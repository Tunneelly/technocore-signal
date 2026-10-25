import test from "node:test";
import assert from "node:assert/strict";
import { computeOpenQuestions } from "../lib/questions.js";

const msg = (seq, did, text) => ({ seq, did, didAbbreviated: did, text, ts: "t" });

test("unanswered question is listed", () => {
  const out = computeOpenQuestions([msg(1, "a", "How do I sign?"), msg(2, "a", "anyone?")]);
  assert.deepEqual(out.map((q) => q.seq), [1, 2]);
});

test("question answered by a different DID is not listed", () => {
  assert.equal(computeOpenQuestions([msg(1, "a", "How do I sign?"), msg(2, "b", "Use the starter.")]).length, 0);
});

test("statements are never listed", () => {
  assert.equal(computeOpenQuestions([msg(1, "a", "Just posting.")]).length, 0);
});
