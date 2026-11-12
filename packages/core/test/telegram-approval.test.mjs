import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  applyTelegramUpdate,
  approvalCallbackData,
  enqueueDraft,
  getTelegramUpdates,
  notifyPendingDrafts,
  parseApprovalCallback,
  sendApproval,
} from "../dist/index.js";

const ready = {
  status: "ready",
  kind: "reply",
  text: "El precio está a consultar.",
  sources: ["brain/facts/project.md"],
  actions: ["approve", "reject"],
};

const config = { token: "secret-token", chatId: "42" };

async function workspace() {
  const root = await mkdtemp(join(tmpdir(), "agentkbase-telegram-"));
  await mkdir(join(root, "brain", "facts"), { recursive: true });
  await writeFile(join(root, "brain", "facts", "project.md"), "# Facts\n", "utf8");
  return { root, queueDir: join(root, ".agentkbase", "queue") };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

test("buttons encode Publicar and No", () => {
  assert.deepEqual(parseApprovalCallback(approvalCallbackData("billing", "approve")), {
    id: "billing",
    decision: "approve",
  });
  assert.deepEqual(parseApprovalCallback("n:digest"), { id: "digest", decision: "reject" });
  assert.equal(parseApprovalCallback("publish:billing"), null);
  assert.throws(() => approvalCallbackData("x".repeat(64), "approve"), /too long/);
});

test("a failed send does not include the token", async () => {
  const fetchImpl = async () => jsonResponse({ ok: false }, 401);
  await assert.rejects(
    sendApproval(
      {
        id: "billing",
        status: "pending",
        kind: "reply",
        question: "¿Cuánto cuesta?",
        text: ready.text,
        sources: [],
        createdAt: "2026-11-10T00:00:00.000Z",
      },
      config,
      fetchImpl,
    ),
    (error) => {
      assert.match(error.message, /sendMessage failed/);
      assert.equal(error.message.includes(config.token), false);
      return true;
    },
  );
});

test("notify sends a pending draft once and a tap approves it", async () => {
  const { root, queueDir } = await workspace();
  await enqueueDraft({
    brainRoot: root,
    queueDir,
    question: "¿Cuánto cuesta?",
    draft: ready,
    id: "billing",
  });
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (String(url).includes("getUpdates")) return jsonResponse({ ok: true, result: [] });
    return jsonResponse({ ok: true, result: {} });
  };

  const sent = await notifyPendingDrafts({ brainRoot: root, queueDir, config, fetchImpl });
  assert.deepEqual(sent.map((item) => item.id), ["billing"]);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/sendMessage$/);
  assert.equal(calls[0].url.includes(config.token), true);
  assert.equal(calls[0].body.chat_id, "42");
  assert.deepEqual(calls[0].body.reply_markup.inline_keyboard[0].map((button) => button.text), ["Publicar", "No"]);

  const again = await notifyPendingDrafts({ brainRoot: root, queueDir, config, fetchImpl });
  assert.deepEqual(again, []);
  assert.equal(calls.length, 1);

  const tap = await applyTelegramUpdate({
    brainRoot: root,
    queueDir,
    config,
    fetchImpl,
    update: {
      update_id: 7,
      callback_query: {
        id: "cb-1",
        data: "y:billing",
        message: { message_id: 3, chat: { id: 42 } },
      },
    },
  });
  assert.equal(tap.applied, true);
  const saved = JSON.parse(await readFile(join(queueDir, "billing.json"), "utf8"));
  assert.equal(saved.status, "approved");
  assert.equal(calls.some((call) => String(call.url).endsWith("/answerCallbackQuery")), true);
  assert.equal(calls.some((call) => String(call.url).endsWith("/editMessageText")), true);

  const second = await applyTelegramUpdate({
    brainRoot: root,
    queueDir,
    config,
    fetchImpl,
    update: {
      update_id: 8,
      callback_query: {
        id: "cb-2",
        data: "n:billing",
        message: { message_id: 3, chat: { id: 42 } },
      },
    },
  });
  assert.equal(second.applied, false);
  const still = JSON.parse(await readFile(join(queueDir, "billing.json"), "utf8"));
  assert.equal(still.status, "approved");
});

test("a tap from another chat does not decide", async () => {
  const { root, queueDir } = await workspace();
  await enqueueDraft({
    brainRoot: root,
    queueDir,
    question: "¿Cuánto cuesta?",
    draft: ready,
    id: "billing",
  });
  let called = false;
  const fetchImpl = async () => {
    called = true;
    return jsonResponse({ ok: true });
  };
  const result = await applyTelegramUpdate({
    brainRoot: root,
    queueDir,
    config,
    fetchImpl,
    update: {
      update_id: 1,
      callback_query: { id: "cb", data: "n:billing", message: { message_id: 1, chat: { id: 99 } } },
    },
  });
  assert.equal(result.applied, false);
  assert.equal(called, false);
  const saved = JSON.parse(await readFile(join(queueDir, "billing.json"), "utf8"));
  assert.equal(saved.status, "pending");
});

test("getUpdates reads the result list", async () => {
  const updates = await getTelegramUpdates({
    token: "secret-token",
    offset: 4,
    fetchImpl: async (url) => {
      assert.match(String(url), /offset=4/);
      assert.match(String(url), /secret-token/);
      return jsonResponse({ ok: true, result: [{ update_id: 4 }] });
    },
  });
  assert.equal(updates[0].update_id, 4);
});
