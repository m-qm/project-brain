/**
 * Optional Langfuse spans for the CLI and the MCP server.
 * Inactive unless both LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY are set.
 * Spans store the decision (pass/fail, issue codes, paths). Fact and draft
 * text stays local unless LANGFUSE_TRACE_CONTENT=1.
 */
import { randomUUID } from "node:crypto";
import { diag, DiagLogLevel, type SpanContext } from "@opentelemetry/api";

const CONTENT_LIMIT = 2_000;

export type ObservationKind = "retriever" | "evaluator" | "tool";
export type TraceSurface = "mcp" | "cli";
export type TraceLevel = "DEFAULT" | "WARNING" | "ERROR";

export type TraceSummary = {
  ok: boolean;
  failed?: boolean;
  error?: string;
  chars?: number;
  issueCodes?: string[];
  issueCount?: number;
  hitCount?: number;
  truncated?: boolean;
  fileCount?: number;
  questionCount?: number;
  paths?: string[];
  content?: string;
};

type ActiveSpan = {
  update: (attributes: {
    input?: unknown;
    output?: unknown;
    metadata?: Record<string, unknown>;
    level?: TraceLevel;
  }) => unknown;
};

type StartActive = (
  name: string,
  fn: (span: ActiveSpan) => Promise<unknown>,
  options?: { asType?: ObservationKind; parentSpanContext?: SpanContext },
) => Promise<unknown>;

type TracingApi = {
  startActiveObservation: StartActive;
  propagateAttributes: (
    params: { sessionId?: string; tags?: string[]; traceName?: string },
    fn: () => Promise<unknown>,
  ) => Promise<unknown>;
};

type SpanProcessor = { forceFlush: () => Promise<void> };

let processor: SpanProcessor | null = null;
let tracingApi: TracingApi | null = null;
let startPromise: Promise<boolean> | null = null;
let processSessionId: string | null = null;
let shutdownInstalled = false;

export function observeEnabled(): boolean {
  return Boolean(process.env.LANGFUSE_PUBLIC_KEY?.trim() && process.env.LANGFUSE_SECRET_KEY?.trim());
}

export function traceContentEnabled(): boolean {
  const raw = process.env.LANGFUSE_TRACE_CONTENT?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export function truncateTraceText(text: string, limit = CONTENT_LIMIT): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}…`;
}

export function observationKind(name: string): ObservationKind {
  if (name === "brain_eval" || name === "brain_validate" || name === "brain_ask") return "evaluator";
  if (
    name === "brain_search" ||
    name === "brain_read" ||
    name === "brain_brief" ||
    name === "brain_list" ||
    name === "brain_open_questions"
  ) {
    return "retriever";
  }
  return "tool";
}

export function traceparentFromMeta(meta: object | undefined): SpanContext | undefined {
  const raw = readMeta(meta, "traceparent");
  if (typeof raw !== "string") return undefined;
  const match = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/i.exec(raw.trim());
  if (!match) return undefined;
  const traceId = match[1].toLowerCase();
  const spanId = match[2].toLowerCase();
  if (/^0+$/.test(traceId) || /^0+$/.test(spanId)) return undefined;
  return {
    traceId,
    spanId,
    traceFlags: Number.parseInt(match[3], 16),
    isRemote: true,
  };
}

export function sessionIdFromMeta(meta: object | undefined): string | undefined {
  for (const key of ["langfuseSessionId", "sessionId"]) {
    const value = readMeta(meta, key);
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 200);
  }
  return undefined;
}

export function summarizeToolInput(args: object): Record<string, unknown> {
  const record = args as Record<string, unknown>;
  const input: Record<string, unknown> = {};
  if (typeof record.query === "string") input.query = truncateTraceText(record.query, 300);
  if (typeof record.path === "string") input.path = record.path;
  if (typeof record.checks === "string") input.checks = record.checks;
  if (typeof record.draft === "string") input.draftChars = record.draft.length;
  if (typeof record.article === "string") input.articleChars = record.article.length;
  if (traceContentEnabled()) {
    if (typeof record.draft === "string") input.draft = truncateTraceText(record.draft);
    if (typeof record.article === "string") input.article = truncateTraceText(record.article);
  }
  return input;
}

export function summarizeToolPayload(text: string, isError?: boolean): TraceSummary {
  const summary: TraceSummary = { ok: !isError, chars: text.length };
  if (isError) {
    summary.failed = true;
    summary.error = truncateTraceText(text, 300);
    return summary;
  }
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (typeof parsed.ok === "boolean") summary.ok = parsed.ok;
    if (Array.isArray(parsed.issues)) {
      summary.issueCount = parsed.issues.length;
      summary.issueCodes = parsed.issues
        .map((issue) =>
          issue && typeof issue === "object" && "code" in issue
            ? String((issue as { code: unknown }).code)
            : "",
        )
        .filter(Boolean)
        .slice(0, 20);
    }
    if (Array.isArray(parsed.hits)) {
      summary.hitCount = parsed.hits.length;
      summary.paths = uniquePaths(parsed.hits);
    }
    if (typeof parsed.truncated === "boolean") summary.truncated = parsed.truncated;
    if (Array.isArray(parsed.files)) summary.fileCount = parsed.files.length;
    if (Array.isArray(parsed.questions)) summary.questionCount = parsed.questions.length;
  } catch {
    // Brief text is markdown, not JSON.
  }
  if (traceContentEnabled()) summary.content = truncateTraceText(text);
  return summary;
}

export async function observeCall<T>(options: {
  name: string;
  kind: ObservationKind;
  surface: TraceSurface;
  input: Record<string, unknown>;
  meta?: object;
  run: () => Promise<T>;
  summarize: (value: T) => Record<string, unknown>;
}): Promise<T> {
  if (!observeEnabled()) return options.run();
  const ready = await ensureSdk();
  if (!ready || !tracingApi) return options.run();
  const api = tracingApi;
  const parent = traceparentFromMeta(options.meta);
  const sessionId = sessionIdFromMeta(options.meta) ?? processSession();
  let ran = false;
  try {
    const value = await api.propagateAttributes(
      {
        sessionId,
        tags: ["agentkbase", options.surface],
        traceName: options.name,
      },
      () =>
        api.startActiveObservation(
          options.name,
          async (span) => {
            span.update({
              input: options.input,
              metadata: { surface: options.surface, readOnly: true },
            });
            ran = true;
            const result = await options.run();
            try {
              const output = options.summarize(result);
              span.update({ output, level: levelFor(output) });
            } catch {
              // A tracing failure must not hide a finished result.
            }
            return result;
          },
          parent
            ? { asType: options.kind, parentSpanContext: parent }
            : { asType: options.kind },
        ),
    );
    return value as T;
  } catch (err) {
    if (ran) throw err;
    return options.run();
  }
}

export async function observeTool<T extends { content: readonly { type: string; text: string }[]; isError?: boolean }>(
  name: string,
  args: object,
  meta: object | undefined,
  run: () => Promise<T>,
): Promise<T> {
  return observeCall({
    name,
    kind: observationKind(name),
    surface: "mcp",
    input: summarizeToolInput(args),
    meta,
    run,
    summarize: (result) => {
      const text = result.content.find((block) => block.type === "text")?.text ?? "";
      return summarizeToolPayload(text, result.isError);
    },
  });
}

export async function observeCommand<T>(
  name: string,
  input: Record<string, unknown>,
  run: () => Promise<T>,
  summarize: (value: T) => Record<string, unknown>,
): Promise<T> {
  try {
    return await observeCall({
      name,
      kind: observationKind(name),
      surface: "cli",
      input,
      run,
      summarize,
    });
  } finally {
    await flushObservations();
  }
}

export async function flushObservations(): Promise<void> {
  if (!processor) return;
  try {
    await processor.forceFlush();
  } catch {
    // Export errors stay off the tool result.
  }
}

function levelFor(output: Record<string, unknown>): TraceLevel {
  if (output.failed === true) return "ERROR";
  if (output.ok === false) return "WARNING";
  return "DEFAULT";
}

function uniquePaths(hits: unknown[]): string[] {
  const paths: string[] = [];
  for (const hit of hits) {
    if (!hit || typeof hit !== "object" || !("path" in hit)) continue;
    const path = String((hit as { path: unknown }).path);
    if (!paths.includes(path)) paths.push(path);
    if (paths.length >= 20) break;
  }
  return paths;
}

function readMeta(meta: object | undefined, key: string): unknown {
  if (!meta || !(key in meta)) return undefined;
  return (meta as Record<string, unknown>)[key];
}

function processSession(): string {
  if (!processSessionId) processSessionId = randomUUID();
  return processSessionId;
}

async function ensureSdk(): Promise<boolean> {
  if (processor && tracingApi) return true;
  if (!startPromise) startPromise = startSdk();
  return startPromise;
}

async function startSdk(): Promise<boolean> {
  if (!process.env.LANGFUSE_LOG_LEVEL && process.env.LANGFUSE_DEBUG?.toLowerCase() !== "true") {
    process.env.LANGFUSE_LOG_LEVEL = "ERROR";
  }
  if (!process.env.OTEL_EXPORTER_OTLP_TIMEOUT) {
    process.env.OTEL_EXPORTER_OTLP_TIMEOUT = "3000";
  }
  diag.setLogger(
    { verbose() {}, debug() {}, info() {}, warn() {}, error() {} },
    DiagLogLevel.NONE,
  );
  try {
    const [{ NodeTracerProvider }, { LangfuseSpanProcessor }, tracing] = await Promise.all([
      import("@opentelemetry/sdk-trace-node"),
      import("@langfuse/otel"),
      import("@langfuse/tracing"),
    ]);
    const spanProcessor = new LangfuseSpanProcessor({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL,
      environment: process.env.LANGFUSE_TRACING_ENVIRONMENT,
      flushAt: 1,
      shouldExportSpan: ({ otelSpan }) => otelSpan.name.startsWith("brain_"),
    });
    const provider = new NodeTracerProvider({ spanProcessors: [spanProcessor] });
    provider.register();
    processor = spanProcessor;
    tracingApi = {
      startActiveObservation: tracing.startActiveObservation as StartActive,
      propagateAttributes: tracing.propagateAttributes as TracingApi["propagateAttributes"],
    };
    installShutdown();
    return true;
  } catch {
    processor = null;
    tracingApi = null;
    return false;
  }
}

function installShutdown(): void {
  if (shutdownInstalled) return;
  shutdownInstalled = true;
  const exitAfterFlush = (code: number) => {
    void flushObservations().finally(() => process.exit(code));
  };
  process.once("SIGINT", () => exitAfterFlush(130));
  process.once("SIGTERM", () => exitAfterFlush(143));
  process.once("beforeExit", () => {
    void flushObservations();
  });
}
