import express from "express";
import fetch from "node-fetch";
import nacl from "tweetnacl";
import bs58 from "bs58";

const PORT = process.env.PORT || 3000;
const ROOM = process.env.ROOM || "technocore";
const LIVE_API = process.env.LIVE_API || "https://technocore.chat";

function abbreviateDid(did) {
  const prefix = "did:key:";
  const body = did.slice(prefix.length);
  if (body.length <= 8) return did;
  return prefix + body.substring(0, 4) + "\u2026" + body.substring(body.length - 4);
}

function sweepText(text) {
  if (typeof text !== "string") return String(text);
  return String(text).replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").trim();
}

function verifyEd25519(did, signature, message) {
  const didPrefix = "did:key:";
  if (!did.startsWith(didPrefix)) {
    return { valid: false, reason: "invalid_did_format" };
  }
  const b58id = did.slice(didPrefix.length);
  if (b58id.length !== 48) {
    return { valid: false, reason: "invalid_did_length", got: b58id.length };
  }
  if (!b58id.startsWith("z6M")) {
    return { valid: false, reason: "invalid_did_prefix" };
  }
  // Base58 decode using bs58 library
  try {
    const keyBytes = bs58.decode(b58id);
    // Skip first 4 bytes (multicodec prefix), take last 32 bytes as Ed25519 key
    const pubKey = keyBytes.length >= 36 ? keyBytes.slice(keyBytes.length - 32) : keyBytes;
    if (pubKey.length !== 32) {
      return { valid: false, reason: "invalid_key_length", got: pubKey.length };
    }
    // Decode signature
    const SIG_CHARS = 86;
    if (typeof signature !== "string" || signature.length !== SIG_CHARS) {
      return { valid: false, reason: "bad_signature_length" };
    }
    const lastChar = signature.charAt(SIG_CHARS - 1);
    if (!"AQgw".includes(lastChar)) {
      return { valid: false, reason: "non_canonical_sig" };
    }
    let b64 = signature.substring(0, SIG_CHARS);
    b64 = b64.replace(/[^a-zA-Z0-9_-]/g, "");
    while (b64.length % 4 !== 0) b64 += "=";
    const sigBytes = Buffer.from(b64, "base64");
    if (sigBytes.length !== 64) {
      return { valid: false, reason: "bad_sig_bytes_length", got: sigBytes.length };
    }
    // Sweep text - use message.text specifically
    const swept = sweepText(message.text);
    // Canonical string: <room>|<nonce>|<swept_text>
    const canonical = ROOM + "|" + message.split("|")[1] + "|" + swept;
    // Debug
    console.log("Debug verify:");
    console.log("  sigBytes.length:", sigBytes.length);
    console.log("  pubKey.length:", pubKey.length);
    console.log("  canonical:", canonical.substring(0, 60));
    try {
      // Use nacl.sign.open which returns message if valid, null if invalid
      // Use Uint8Array as tweetnacl expects, and only pass 2 arguments: signature and publicKey
      const msgUint8 = Uint8Array.from(Buffer.from(canonical, "utf-8"));
      const sigUint8 = Uint8Array.from(sigBytes);
      
      // Try different key extractions
      // Current: bytes 4-35 (last 32 bytes of 36-byte key)
      const pubUint8Current = Uint8Array.from(pubKey);
      console.log("  pubKey.length:", pubKey.length);
      console.log("  Current extraction (bytes 4-35):", pubUint8Current.length, "bytes");
      
      // Try: bytes 1-32 (skip first byte only)
      const pubKeyBytes = Array.from(pubKey);
      const pubUint8SkipFirst = new Uint8Array(pubKeyBytes.slice(1, 33));
      console.log("  Skip first byte (1-32):", pubUint8SkipFirst.length, "bytes");
      
      // Try: bytes 0-31 (first 32 bytes)
      const pubUint8First32 = new Uint8Array(pubKeyBytes.slice(0, 32));
      console.log("  First 32 bytes (0-31):", pubUint8First32.length, "bytes");
      
      // Try current first
      let result = nacl.sign.open(sigUint8, pubUint8Current);
      console.log("  Result with current extraction:", result ? "VALID" : "INVALID");
      
      if (result === null) {
        // Try skip first
        result = nacl.sign.open(sigUint8, pubUint8SkipFirst);
        console.log("  Result with skip first:", result ? "VALID" : "INVALID");
      }
      
      if (result === null) {
        // Try first 32
        result = nacl.sign.open(sigUint8, pubUint8First32);
        console.log("  Result with first 32:", result ? "VALID" : "INVALID");
      }
      
      if (result !== null) {
        return { valid: true, canonical };
      } else {
        return { valid: false, reason: "signature_mismatch" };
      }
    } catch (e) {
      console.log("  nacl.open error:", e.message);
      return { valid: false, reason: "verification_error" };
    }
  } catch (e) {
    return { valid: false, reason: "base58_decode_error" };
  }
}

function fetchMessages(sinceSeq = null) {
  return new Promise((resolve, reject) => {
    const url = LIVE_API + "/r/" + ROOM + "?format=json&limit=50" + (sinceSeq !== null ? "&since=" + sinceSeq : "");
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("API responded " + res.status);
        return res.json();
      })
      .then((data) => {
        const verifiedMessages = data.messages.map((msg) => {
          const result = verifyEd25519(msg.from, msg.sig, msg);
          return {
            seq: msg.seq,
            ts: msg.ts,
            did: msg.from,
            didAbbreviated: abbreviateDid(msg.from),
            text: msg.text,
            nonce: msg.nonce,
            signature: msg.sig,
            signatureValid: result.valid,
            signatureReason: result.valid ? undefined : (result.reason || "unverifiable"),
            canonical: result.canonical || null,
            sourceUrl: LIVE_API + "/r/" + ROOM + "?seq=" + msg.seq
          };
        });
        resolve({
          room: data.room,
          count: data.count,
          first_seq: data.first_seq,
          last_seq: data.last_seq,
          generation: data.generation,
          messages: verifiedMessages
        });
      })
      .catch((err) => reject(err));
  });
}

function computeOpenQuestions(messages) {
  const questionMessages = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.text.includes("?") && msg.signatureValid) {
      const laterReplies = messages.slice(i + 1).filter(
        later => later.did !== msg.did && later.signatureValid
      );
      if (laterReplies.length === 0) {
        questionMessages.push({
          seq: msg.seq,
          did: msg.did,
          didAbbreviated: msg.didAbbreviated,
          text: msg.text,
          ts: msg.ts
        });
      }
    }
  }
  return questionMessages;
}

const app = express();

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    room: ROOM,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/messages", async (req, res) => {
  try {
    const sinceSeq = req.query.since ? parseInt(req.query.since, 10) : null;
    const data = await fetchMessages(sinceSeq);
    if (!data) {
      return res.status(500).json({
        error: "failed_to_fetch",
        message: "Could not fetch messages from the API. Is the live mode available?"
      });
    }
    res.json(data);
  } catch (error) {
    console.error("Error in /api/messages:", error);
    res.status(500).json({
      error: "internal_error",
      message: error.message
    });
  }
});

app.get("/api/open-questions", async (req, res) => {
  try {
    const sinceSeq = req.query.since ? parseInt(req.query.since, 10) : null;
    const messagesData = await fetchMessages(sinceSeq);
    if (!messagesData) {
      return res.status(500).json({
        error: "failed_to_fetch",
        message: "Could not fetch messages from the API."
      });
    }
    const openQuestions = computeOpenQuestions(messagesData.messages);
    res.json({
      room: messagesData.room,
      total_messages: messagesData.messages.length,
      open_questions: openQuestions.length,
      questions: openQuestions
    });
  } catch (error) {
    console.error("Error in /api/open-questions:", error);
    res.status(500).json({
      error: "internal_error",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Technocore Signal backend running on http://localhost:" + PORT);
  console.log("Room: " + ROOM);
  console.log("Live API: " + LIVE_API);
});
