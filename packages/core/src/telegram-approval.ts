import { decideQueueItem, listQueue, markQueueNotified, type QueueDecision, type QueueItem } from "./queue.js";

const CALLBACK_LIMIT = 64;

export type TelegramConfig = {
  token: string;
  chatId: string;
};

export type TelegramUpdate = {
  update_id: number;
  callback_query?: {
    id?: string;
    data?: string;
    message?: { message_id?: number; chat?: { id?: number | string } };
  };
};

type FetchLike = typeof fetch;

function apiUrl(token: string, method: string): string {
  return `https://api.telegram.org/bot${token}/${method}`;
}

/** `y:<id>` publishes. `n:<id>` stops it. The id has to fit Telegram's 64-byte limit. */
export function approvalCallbackData(id: string, decision: QueueDecision): string {
  const data = `${decision === "approve" ? "y" : "n"}:${id}`;
  if (Buffer.byteLength(data) > CALLBACK_LIMIT) {
    throw new Error("Queue id is too long to send as a Telegram button.");
  }
  return data;
}

export function parseApprovalCallback(data: string): { id: string; decision: QueueDecision } | null {
  const match = /^(y|n):([A-Za-z0-9_-]{1,64})$/.exec(data);
  if (!match) return null;
  const id = match[2];
  if (!id || Buffer.byteLength(data) > CALLBACK_LIMIT) return null;
  return { id, decision: match[1] === "y" ? "approve" : "reject" };
}

export function approvalText(item: QueueItem): string {
  const body = item.text.length > 3200 ? `${item.text.slice(0, 3200)}…` : item.text;
  return [`Borrador pendiente`, ``, item.question, ``, body, ``, `Publicar solo si este es el texto que quieres.`].join(
    "\n",
  );
}

function keyboard(item: QueueItem): { inline_keyboard: { text: string; callback_data: string }[][] } {
  return {
    inline_keyboard: [
      [
        { text: "Publicar", callback_data: approvalCallbackData(item.id, "approve") },
        { text: "No", callback_data: approvalCallbackData(item.id, "reject") },
      ],
    ],
  };
}

async function postJson(
  token: string,
  method: string,
  body: Record<string, unknown>,
  fetchImpl: FetchLike,
): Promise<void> {
  const response = await fetchImpl(apiUrl(token, method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Telegram ${method} failed (${response.status}).`);
}

/** Send one pending draft to the approval chat. The token stays in the request, not in the error. */
export async function sendApproval(
  item: QueueItem,
  config: TelegramConfig,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  if (item.status !== "pending") throw new Error("Only a pending draft is sent.");
  await postJson(
    config.token,
    "sendMessage",
    {
      chat_id: config.chatId,
      text: approvalText(item),
      reply_markup: keyboard(item),
    },
    fetchImpl,
  );
}

export async function notifyPendingDrafts(input: {
  brainRoot: string;
  queueDir: string;
  config: TelegramConfig;
  fetchImpl?: FetchLike;
  now?: Date;
}): Promise<QueueItem[]> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const pending = (await listQueue(input.brainRoot, input.queueDir)).filter(
    (item) => item.status === "pending" && !item.notifiedAt,
  );
  const sent: QueueItem[] = [];
  for (const item of pending) {
    await sendApproval(item, input.config, fetchImpl);
    sent.push(
      await markQueueNotified({
        brainRoot: input.brainRoot,
        queueDir: input.queueDir,
        id: item.id,
        now: input.now,
      }),
    );
  }
  return sent;
}

/**
 * A tap from the configured chat decides the draft.
 * A tap from another chat is ignored.
 * A second tap answers and leaves the file as it was.
 */
export async function applyTelegramUpdate(input: {
  brainRoot: string;
  queueDir: string;
  config: TelegramConfig;
  update: TelegramUpdate;
  fetchImpl?: FetchLike;
  now?: Date;
}): Promise<{ applied: boolean; reason: string }> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const query = input.update.callback_query;
  const data = query?.data ?? "";
  const parsed = parseApprovalCallback(data);
  const callbackId = query?.id;
  const chatId = query?.message?.chat?.id;
  const messageId = query?.message?.message_id;

  async function answer(text: string): Promise<void> {
    if (!callbackId) return;
    await postJson(input.config.token, "answerCallbackQuery", { callback_query_id: callbackId, text }, fetchImpl);
  }

  if (!parsed) return { applied: false, reason: "Not an approval button." };
  if (String(chatId ?? "") !== String(input.config.chatId)) {
    return { applied: false, reason: "The tap came from another chat." };
  }

  try {
    const item = await decideQueueItem({
      brainRoot: input.brainRoot,
      queueDir: input.queueDir,
      id: parsed.id,
      decision: parsed.decision,
      now: input.now,
    });
    const line = item.status === "approved" ? "Publicado." : "No se publica.";
    await answer(line);
    if (messageId !== undefined) {
      await postJson(
        input.config.token,
        "editMessageText",
        {
          chat_id: input.config.chatId,
          message_id: messageId,
          text: `${approvalText(item)}\n\n${line}`,
        },
        fetchImpl,
      );
    }
    return { applied: true, reason: line };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await answer("Ya estaba decidido.");
    return { applied: false, reason: message };
  }
}

export async function getTelegramUpdates(input: {
  token: string;
  offset: number;
  timeout?: number;
  fetchImpl?: FetchLike;
}): Promise<TelegramUpdate[]> {
  const timeout = input.timeout ?? 0;
  const response = await (input.fetchImpl ?? fetch)(
    `${apiUrl(input.token, "getUpdates")}?offset=${encodeURIComponent(String(input.offset))}&timeout=${encodeURIComponent(String(timeout))}`,
  );
  if (!response.ok) throw new Error(`Telegram getUpdates failed (${response.status}).`);
  const body = (await response.json()) as { ok?: boolean; result?: TelegramUpdate[] };
  if (!body.ok || !Array.isArray(body.result)) throw new Error("Telegram getUpdates failed.");
  return body.result;
}
