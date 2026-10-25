import express from "express";
import { createApp } from "./lib/create-app.js";

const PORT = process.env.PORT || 3000;
const ROOM = process.env.ROOM || "technocore";
const LIVE_API = process.env.LIVE_API || "https://technocore.chat";

void express; // Vercel detects Express apps by this import
const app = createApp({ room: ROOM, api: LIVE_API });

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("Technocore Signal running on http://localhost:" + PORT + " (room: " + ROOM + ")");
  });
}

export default app;
