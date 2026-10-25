import test from "node:test";
import assert from "node:assert/strict";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { verifyMessage, canonicalString, sweepText, abbreviateDid } from "../lib/verify.js";
import { parseRoomJson } from "../lib/room.js";

// Throwaway keys, generated inside the test only.
function makeIdentity() {
  const kp = nacl.sign.keyPair();
  const did = "did:key:z" + bs58.encode(Buffer.concat([Buffer.from([0xed, 0x01]), Buffer.from(kp.publicKey)]));
  return { kp, did };
}
function signed(id, room, nonce, text) {
  const data = new Uint8Array(Buffer.from(canonicalString(room, nonce, text)));
  const sig = Buffer.from(nacl.sign.detached(data, id.kp.secretKey)).toString("base64url");
  return { seq: 1, from: id.did, nonce: String(nonce), text, sig };
}

test("valid signature is valid", () => {
  const id = makeIdentity();
  assert.equal(verifyMessage("technocore", signed(id, "technocore", "12345", "hello world")).status, "valid");
});

test("tampered text is invalid", () => {
  const id = makeIdentity();
  const m = signed(id, "technocore", "12345", "hello world");
  m.text = "hello w0rld";
  assert.equal(verifyMessage("technocore", m).status, "invalid");
});

test("wrong room is invalid", () => {
  const id = makeIdentity();
  assert.equal(verifyMessage("other", signed(id, "technocore", "1", "hi")).status, "invalid");
});

test("missing signature is unsigned", () => {
  const id = makeIdentity();
  const m = signed(id, "technocore", "1", "hi");
  delete m.sig;
  assert.equal(verifyMessage("technocore", m).status, "unsigned");
});

test("malformed signature and unsupported DID are unverifiable", () => {
  const id = makeIdentity();
  const m = signed(id, "technocore", "1", "hi");
  assert.equal(verifyMessage("technocore", { ...m, sig: "abc" }).status, "unverifiable");
  assert.equal(verifyMessage("technocore", { ...m, from: "did:web:example.com" }).status, "unverifiable");
});

test("control characters are swept to spaces", () => {
  assert.equal(sweepText("  a\u0000b\u200Bc  "), "a b c");
});

test("huge nonce survives JSON parsing and still verifies", () => {
  const id = makeIdentity();
  const m = signed(id, "technocore", "1000000000000000001", "big nonce");
  const raw = '{"room":"technocore","messages":[{"seq":1,"from":"' + id.did + '","nonce":1000000000000000001,"text":"big nonce","sig":"' + m.sig + '"}]}';
  const parsed = parseRoomJson(raw);
  assert.equal(parsed.messages[0].nonce, "1000000000000000001");
  assert.equal(verifyMessage("technocore", parsed.messages[0]).status, "valid");
});

test("DID abbreviation", () => {
  assert.equal(abbreviateDid("did:key:z6MkizMHzcUxkPDXLjY87P9DPqhNqJ2XpYHfsu94Ceq3TiDP"), "did:key:z6Mk\u20263TiDP".replace("3TiDP", "TiDP"));
});
