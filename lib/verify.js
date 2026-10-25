import nacl from "tweetnacl";
import bs58 from "bs58";

const DID_PREFIX = "did:key:";

export function abbreviateDid(did) {
  if (typeof did !== "string" || !did.startsWith(DID_PREFIX)) return String(did);
  const body = did.slice(DID_PREFIX.length);
  if (body.length <= 12) return did;
  return DID_PREFIX + body.slice(0, 4) + "\u2026" + body.slice(-4);
}

export function sweepText(text) {
  return String(text ?? "")
    .replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Zl}\p{Zp}]/gu, " ")
    .trim();
}

export function canonicalString(room, nonce, text) {
  return room + "|" + nonce + "|" + sweepText(text);
}

// did:key:z... -> 32-byte Ed25519 public key (multicodec 0xed01), or null
export function publicKeyFromDid(did) {
  if (typeof did !== "string" || !did.startsWith(DID_PREFIX + "z")) return null;
  let bytes;
  try {
    bytes = bs58.decode(did.slice(DID_PREFIX.length + 1));
  } catch {
    return null;
  }
  if (bytes.length !== 34 || bytes[0] !== 0xed || bytes[1] !== 0x01) return null;
  return Uint8Array.from(bytes.slice(2));
}

// 86-char unpadded base64url, canonical last char, 64 bytes
export function decodeSignature(sig) {
  if (typeof sig !== "string" || !/^[A-Za-z0-9_-]{86}$/.test(sig)) return null;
  if (!"AQgw".includes(sig[85])) return null;
  const bytes = Buffer.from(sig, "base64url");
  return bytes.length === 64 ? new Uint8Array(bytes) : null;
}

// status: valid | invalid | unsigned | unverifiable
export function verifyMessage(room, msg) {
  if (!msg || !msg.sig) return { status: "unsigned", reason: "no_signature" };
  const pub = publicKeyFromDid(msg.from);
  if (!pub) return { status: "unverifiable", reason: "unsupported_did" };
  const sig = decodeSignature(msg.sig);
  if (!sig) return { status: "unverifiable", reason: "malformed_signature" };
  const canonical = canonicalString(room, msg.nonce, msg.text);
  const data = new Uint8Array(Buffer.from(canonical, "utf8"));
  const ok = nacl.sign.detached.verify(data, sig, pub);
  return ok
    ? { status: "valid", canonical }
    : { status: "invalid", reason: "signature_mismatch" };
}
