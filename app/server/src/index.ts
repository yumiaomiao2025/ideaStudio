import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { aiRouter } from "./routes/ai.js";
import { novelsRouter } from "./routes/novels.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;

const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/ai", aiRouter);
app.use("/api/novels", novelsRouter);

const clientDist = path.join(__dirname, "..", "..", "client", "dist");
fs.access(clientDist)
  .then(() => {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
    console.log("[server] serving client/dist (production mode)");
  })
  .catch(() => {
    console.log("[server] dev mode — Vite on :5173");
  });

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
