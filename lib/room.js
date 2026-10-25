// Nonces can exceed 2^53. Quote them in the raw JSON so they stay exact.
export function parseRoomJson(raw) {
  const safe = raw.replace(/("nonce"\s*:\s*)(-?\d+)/g, '$1"$2"');
  return JSON.parse(safe);
}

export async function fetchRoom(api, room, { limit = 50, since = null } = {}) {
  const url = api + "/r/" + room + "?format=json&limit=" + limit + (since !== null ? "&since=" + since : "");
  const res = await fetch(url);
  if (!res.ok) throw new Error("API responded " + res.status);
  return parseRoomJson(await res.text());
}
