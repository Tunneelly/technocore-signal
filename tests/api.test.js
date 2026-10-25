import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../lib/create-app.js";

async function withServer(opts, fn) {
  const server = createApp(opts).listen(0);
  try {
    await fn("http://127.0.0.1:" + server.address().port);
  } finally {
    server.close();
    server.closeAllConnections?.();
  }
}
const fake = async () => ({
  room: "technocore",
  messages: [{ seq: 1, from: "did:key:zFake", nonce: "1", text: "Does this work?", ts: "t" }],
});

test("GET /api/health", async () => {
  await withServer({ fetchData: fake }, async (base) => {
    const j = await (await fetch(base + "/api/health")).json();
    assert.equal(j.status, "ok");
  });
});

test("GET /api/messages labels unsigned messages", async () => {
  await withServer({ fetchData: fake }, async (base) => {
    const j = await (await fetch(base + "/api/messages")).json();
    assert.equal(j.count, 1);
    assert.equal(j.messages[0].signatureStatus, "unsigned");
  });
});

test("GET /api/open-questions finds the question", async () => {
  await withServer({ fetchData: fake }, async (base) => {
    const j = await (await fetch(base + "/api/open-questions")).json();
    assert.equal(j.open_questions, 1);
  });
});

test("upstream failure returns 502", async () => {
  const boom = async () => { throw new Error("API responded 500"); };
  await withServer({ fetchData: boom }, async (base) => {
    assert.equal((await fetch(base + "/api/messages")).status, 502);
  });
});

test("invalid room name returns 400", async () => {
  await withServer({ fetchData: fake }, async (base) => {
    assert.equal((await fetch(base + "/api/messages?room=BAD!")).status, 400);
  });
});
