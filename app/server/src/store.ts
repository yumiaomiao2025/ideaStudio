import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DB, Novel, Chapter, Term, RevisionEntry, TodoItem } from "./types.js";
import { seedNovel } from "./seed.js";
import { applyWritingLog, revertChapterSnapshot } from "./lib/analysis.js";
import { addTodoItem, toggleTodoItem, removeTodoItem } from "./lib/todos.js";

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
  patch: Partial<Pick<Chapter, "title" | "body" | "status" | "authorNote">>
): Promise<Chapter | undefined> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  const ch = novel?.chapters.find((c) => c.id === chapterId);
  if (!ch || !novel) return undefined;
  if (typeof patch.body === "string" && patch.body !== ch.body) {
    const delta = patch.body.length - ch.body.length;
    const today = new Date().toISOString().slice(0, 10);
    novel.writingLog = applyWritingLog(novel.writingLog ?? [], today, delta);
  }
  Object.assign(ch, patch, { updatedAt: Date.now() });
  await persist();
  return ch;
}

export async function revertChapter(
  novelId: string,
  chapterId: string,
  revisionId: string
): Promise<Chapter | undefined> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  const ch = novel?.chapters.find((c) => c.id === chapterId);
  if (!ch || !novel) return undefined;
  const snapshot = revertChapterSnapshot(novel, chapterId, revisionId);
  if (snapshot === undefined) return undefined;
  ch.body = snapshot;
  ch.updatedAt = Date.now();
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
    id: "c" + Date.now().toString(36),
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

export async function upsertTerm(
  novelId: string,
  term: Term
): Promise<Term | undefined> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  if (!novel) return undefined;
  const idx = novel.terms.findIndex((t) => t.id === term.id);
  if (idx >= 0) {
    novel.terms[idx] = term;
  } else {
    novel.terms.push(term);
  }
  await persist();
  return term;
}

export async function deleteTerm(
  novelId: string,
  termId: string
): Promise<boolean> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  if (!novel) return false;
  const before = novel.terms.length;
  novel.terms = novel.terms.filter((t) => t.id !== termId);
  await persist();
  return novel.terms.length < before;
}

export async function addRevision(
  novelId: string,
  entry: RevisionEntry
): Promise<void> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  if (!novel) return;
  novel.revisions = novel.revisions ?? [];
  novel.revisions.unshift(entry);
  // keep last 100
  novel.revisions = novel.revisions.slice(0, 100);
  await persist();
}

export async function addTodo(novelId: string, item: TodoItem): Promise<TodoItem[] | undefined> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  if (!novel) return undefined;
  novel.todos = addTodoItem(novel.todos ?? [], item);
  await persist();
  return novel.todos;
}

export async function toggleTodo(novelId: string, todoId: string): Promise<TodoItem[] | undefined> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  if (!novel) return undefined;
  novel.todos = toggleTodoItem(novel.todos ?? [], todoId);
  await persist();
  return novel.todos;
}

export async function removeTodo(novelId: string, todoId: string): Promise<TodoItem[] | undefined> {
  const db = await ensureLoaded();
  const novel = db.novels.find((n) => n.id === novelId);
  if (!novel) return undefined;
  novel.todos = removeTodoItem(novel.todos ?? [], todoId);
  await persist();
  return novel.todos;
}

export async function createNovel(title: string, genre: string): Promise<Novel> {
  const db = await ensureLoaded();
  const novel: Novel = {
    id: "n" + Date.now().toString(36),
    title: title.trim() || "未命名作品",
    genre: genre.trim() || "未分类",
    styleNotes: [],
    volumes: [{ id: "vol1", title: "卷一", order: 1 }],
    chapters: [],
    terms: [],
    characters: [],
    revisions: [],
    writingLog: [],
    todos: [],
  };
  db.novels.push(novel);
  await persist();
  return novel;
}
