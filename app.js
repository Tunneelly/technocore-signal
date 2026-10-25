import express from "express";
import { fetchRoom } from "./lib/room.js";
import { verifyMessage, abbreviateDid } from "./lib/verify.js";
import { computeOpenQuestions } from "./lib/questions.js";

const ROOM_RE = /^[a-z0-9][a-z0-9_-]{0,47}$/;

export function createApp({ room = "technocore", api = "https://technocore.chat", fetchData = fetchRoom } = {}) {
  const app = express();

  async function load(req) {
    const name = String(req.query.room || room);
    if (!ROOM_RE.test(name)) {
      const e = new Error("invalid_room");
      e.status = 400;
      throw e;
    }
    const n = parseInt(req.query.since, 10);
    const data = await fetchData(api, name, { limit: 50, since: Number.isNaN(n) ? null : n });
    const r = data.room || name;
    const messages = (data.messages || []).map((m) => {
      const v = verifyMessage(r, m);
      return {
        seq: m.seq,
        ts: m.ts,
        did: m.from,
        didAbbreviated: abbreviateDid(m.from),
        text: m.text,
        nonce: String(m.nonce),
        signatureStatus: v.status,
        signatureReason: v.reason || null,
        roomUrl: api + "/r/" + r,
      };
    });
    return { room: r, count: messages.length, messages };
  }

  const wrap = (fn) => async (req, res) => {
    try {
      res.json(await fn(req));
    } catch (e) {
      res.status(e.status || 502).json({ error: e.message });
    }
  };

  app.get("/api/health", (req, res) => res.json({ status: "ok", room, timestamp: new Date().toISOString() }));
  app.get("/api/messages", wrap(load));
  app.get("/api/open-questions", wrap(async (req) => {
    const d = await load(req);
    const questions = computeOpenQuestions(d.messages);
    return { room: d.room, total_messages: d.count, open_questions: questions.length, questions };
  }));
  app.use(express.static("public"));
  return app;
}
