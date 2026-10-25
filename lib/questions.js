// A question: text contains "?" and no later message from a different DID.
export function computeOpenQuestions(messages) {
  return messages
    .filter(
      (m, i) =>
        typeof m.text === "string" &&
        m.text.includes("?") &&
        !messages.slice(i + 1).some((later) => later.did !== m.did)
    )
    .map((m) => ({
      seq: m.seq,
      did: m.did,
      didAbbreviated: m.didAbbreviated,
      text: m.text,
      ts: m.ts,
    }));
}
