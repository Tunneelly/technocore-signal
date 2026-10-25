import { verifyMessage } from "../lib/verify.js";
import { fetchRoom } from "../lib/room.js";

const room = process.argv[2] || "technocore";
const data = await fetchRoom("https://technocore.chat", room);
const counts = {};
let shown = 0;
for (const m of data.messages) {
  const r = verifyMessage(data.room || room, m);
  const key = r.status + (r.reason ? ":" + r.reason : "");
  counts[key] = (counts[key] || 0) + 1;
  if (shown++ < 5) console.log(m.seq, r.status, r.reason || "");
}
console.log(counts);
