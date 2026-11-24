import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CLIENT_BRAIN_CAP,
  loadClientBrain,
  replySupportedByBrain,
  resolveShowcaseBrain,
  scriptClientReply,
} from "./client-brains";
import { telegramInbound, telegramShowcaseUrl } from "./telegram-onboarding";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "storage", "telegram-brains");

describe("telegram client brains", () => {
  test("dualperspective folder is the four-file brain and stays inside the cap", async () => {
    const text = await loadClientBrain("dualperspective", { root });
    assert.ok(text);
    assert.ok(text.length <= CLIENT_BRAIN_CAP);
    assert.match(text, /## facts\/project\.md/);
    assert.match(text, /## facts\/offer-limits\.md/);
    assert.match(text, /## open-questions\.md/);
    assert.match(text, /## stories\/positioning\.md/);
    assert.match(text, /Dual Perspective Digital/);
    assert.match(text, /1\.500 €/);
    assert.match(text, /\[CONFIRM\]/);
    assert.doesNotMatch(text, /Agent KBase/i);
    for (const line of text.split("\n")) {
      if (/24 h|1–2 weeks|3–10 weeks/.test(line)) assert.match(line, /\[CONFIRM\]/);
    }
  });

  test("snapshot matches the files on disk", async () => {
    const disk = await loadClientBrain("dualperspective", { root });
    const snapshot = JSON.parse(
      await readFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "client-brains.snapshot.json"), "utf8"),
    ) as { brains: Record<string, string> };
    assert.equal(snapshot.brains.dualperspective, disk);
  });

  test("a path or an unknown id does not load a client brain", async () => {
    assert.equal(await loadClientBrain("../dualperspective", { root }), null);
    assert.equal(await loadClientBrain("nope", { root }), null);
    assert.equal(await loadClientBrain("dualperspective/../../brain", { root }), null);
  });

  test("no start id stays on the company brain, even if the text names a client", async () => {
    const plain = await resolveShowcaseBrain(undefined, undefined, { root });
    assert.equal(plain.brain, "company");
    assert.equal(plain.text, null);

    const named = telegramInbound({
      message: { text: "Tell me about dualperspective prices", from: { id: 1, language_code: "en" }, chat: { id: 1 } },
    });
    assert.equal(named?.start, undefined);
    const still = await resolveShowcaseBrain(named?.start, undefined, { root });
    assert.equal(still.brain, "company");
    assert.equal(still.text, null);
  });

  test("start=dualperspective selects that brain and a later /start clears it", async () => {
    const opened = await resolveShowcaseBrain({ brainId: "dualperspective" }, undefined, { root });
    assert.equal(opened.brain, "dualperspective");
    assert.match(opened.text ?? "", /Dual Perspective Digital/);
    assert.doesNotMatch(opened.text ?? "", /Agent KBase/i);

    const follow = await resolveShowcaseBrain(undefined, "dualperspective", { root });
    assert.equal(follow.brain, "dualperspective");

    const cleared = await resolveShowcaseBrain({ brainId: null }, "dualperspective", { root });
    assert.equal(cleared.brain, "company");
    assert.equal(cleared.text, null);

    const unknown = await resolveShowcaseBrain({ brainId: "nope" }, "dualperspective", { root });
    assert.equal(unknown.brain, "company");
    assert.equal(unknown.text, null);
  });

  test("the scripted showcase quotes the notes and does not become Agent KBase", async () => {
    const text = await loadClientBrain("dualperspective", { root });
    assert.ok(text);
    const hello = scriptClientReply("en", text, "Hello");
    assert.match(hello, /Dual Perspective Digital/);
    assert.match(hello, /1\.500 €/);
    assert.match(hello, /not a closed quote/);
    assert.doesNotMatch(hello, /Agent KBase/i);

    const when = scriptClientReply("es", text, "¿Respondéis en 24 h?");
    assert.match(when, /\[CONFIRM\]/);
    assert.doesNotMatch(when, /1–2 weeks|un día laborable/);

    assert.equal(replySupportedByBrain("LED content from 1.500 €.", text), true);
    assert.equal(replySupportedByBrain("Setup is 9.999 €.", text), false);
    assert.equal(replySupportedByBrain("I'm Agent KBase.", text), false);
  });

  test("deep link and /start payload", () => {
    assert.equal(telegramShowcaseUrl("dualperspective"), "https://t.me/agentkbase_bot?start=dualperspective");

    const lead = telegramInbound({
      message: { text: "Hey Agent KBase!", from: { id: 2, language_code: "en" }, chat: { id: 2 } },
    });
    assert.equal(lead?.start, undefined);
    assert.equal(lead?.text, "Hey Agent KBase!");

    const bare = telegramInbound({
      message: { text: "/start", from: { id: 3, language_code: "en" }, chat: { id: 3 } },
    });
    assert.deepEqual(bare?.start, { brainId: null });
    assert.equal(bare?.text, "Hey Agent KBase!");

    const showcase = telegramInbound({
      message: { text: "/start dualperspective", from: { id: 4, language_code: "en" }, chat: { id: 4 } },
    });
    assert.deepEqual(showcase?.start, { brainId: "dualperspective" });
    assert.equal(showcase?.text, "Hello");

    const cased = telegramInbound({
      message: { text: "/start@agentkbase_bot DualPerspective", from: { id: 5, language_code: "es" }, chat: { id: 5 } },
    });
    assert.deepEqual(cased?.start, { brainId: "dualperspective" });
    assert.equal(cased?.text, "Hola");

    const escape = telegramInbound({
      message: { text: "/start ../secrets", from: { id: 6, language_code: "en" }, chat: { id: 6 } },
    });
    assert.deepEqual(escape?.start, { brainId: null });
    assert.equal(escape?.text, "Hey Agent KBase!");
  });
});
