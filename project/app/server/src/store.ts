// Minimal JSON-file persistence. Zero native deps — swap for Prisma/Postgres later.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DB, Novel, Chapter } from "./types.js";
import { seedNovel } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

let cache: DB | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function ensureLoaded(): Promise<DB> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    cache = JSON.parse(raw) as DB;
  } catch {
    cache = { novels: [seedNovel()] };
    await persist();
  }
  return cache;
}

async function persist(): Promise<void> {
  // Serialize writes so concurrent requests don't corrupt the file.
  writeQueue = writeQueue.then(async () => {
    if (!cache) return;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(cache, null, 2), "utf8");
  });
  return writeQueue;
}

export async function getNovels(): Promise<Novel[]> {
  const db = await ensureLoaded();
  return db.novels;
}

export async function getNovel(id: string): Promise<Novel | undefined> {
  const db = await ensureLoaded();
  return db.novels.find((n) => n.id === id);
}

export async function updateChapter(
  novelId: string,
  chapterId: string,
  patch: Partial<Pick<Chapter, "title" | "body" | "status">>
): Promise<Chapter | undefined> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  const ch = novel?.chapters.find((c) => c.id === chapterId);
  if (!ch) return undefined;
  Object.assign(ch, patch, { updatedAt: Date.now() });
  await persist();
  return ch;
}

export async function createChapter(
  novelId: string,
  volumeId: string,
  title: string
): Promise<Chapter | undefined> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  if (!novel) return undefined;
  const maxNum = novel.chapters.reduce((m, c) => Math.max(m, c.num), 0);
  const ch: Chapter = {
    id: "c" + (Date.now().toString(36)),
    volumeId,
    num: maxNum + 1,
    title: title || "新章节",
    body: "",
    status: "writing",
    updatedAt: Date.now(),
  };
  novel.chapters.push(ch);
  await persist();
  return ch;
}
