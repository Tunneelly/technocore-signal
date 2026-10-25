import { createApp } from "./app.js";

const PORT = process.env.PORT || 3000;
const ROOM = process.env.ROOM || "technocore";
const LIVE_API = process.env.LIVE_API || "https://technocore.chat";

createApp({ room: ROOM, api: LIVE_API }).listen(PORT, () => {
  console.log("Technocore Signal running on http://localhost:" + PORT + " (room: " + ROOM + ")");
});
