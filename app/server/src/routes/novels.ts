import { Router } from "express";
import {
  getNovels, getNovel, updateChapter, createChapter,
  upsertTerm, deleteTerm, addRevision, revertChapter,
} from "../store.js";
import type { Term, RevisionEntry } from "../types.js";
import { inspectNovel, computeHealth, scanNovelCompliance } from "../lib/analysis.js";

export const novelsRouter = Router();

novelsRouter.get("/", async (_req, res) => {
  const novels = await getNovels();
  res.json(novels.map((n) => ({ id: n.id, title: n.title, genre: n.genre, chapterCount: n.chapters.length })));
});

novelsRouter.get("/:id", async (req, res) => {
  const novel = await getNovel(req.params.id);
  if (!novel) { res.status(404).json({ error: "未找到该作品" }); return; }
  res.json(novel);
});

novelsRouter.patch("/:id/chapters/:chapterId", async (req, res) => {
  const { title, body, status, authorNote } = req.body ?? {};
  const ch = await updateChapter(req.params.id, req.params.chapterId, { title, body, status, authorNote });
  if (!ch) { res.status(404).json({ error: "未找到该章节" }); return; }
  res.json(ch);
});

novelsRouter.post("/:id/chapters/:chapterId/revert", async (req, res) => {
  const { revisionId } = req.body ?? {};
  const ch = await revertChapter(req.params.id, req.params.chapterId, revisionId);
  if (!ch) { res.status(404).json({ error: "未找到该版本" }); return; }
  res.json(ch);
});

novelsRouter.get("/:id/inspect", async (req, res) => {
  const novel = await getNovel(req.params.id);
  if (!novel) { res.status(404).json({ error: "未找到该作品" }); return; }
  res.json(inspectNovel(novel));
});

novelsRouter.get("/:id/health", async (req, res) => {
  const novel = await getNovel(req.params.id);
  if (!novel) { res.status(404).json({ error: "未找到该作品" }); return; }
  res.json(computeHealth(novel));
});

novelsRouter.get("/:id/compliance", async (req, res) => {
  const novel = await getNovel(req.params.id);
  if (!novel) { res.status(404).json({ error: "未找到该作品" }); return; }
  res.json(scanNovelCompliance(novel));
});

novelsRouter.post("/:id/chapters", async (req, res) => {
  const { volumeId, title } = req.body ?? {};
  const ch = await createChapter(req.params.id, volumeId || "vol2", title || "新章节");
  if (!ch) { res.status(404).json({ error: "未找到该作品" }); return; }
  res.status(201).json(ch);
});

novelsRouter.put("/:id/terms/:termId", async (req, res) => {
  const term: Term = { ...req.body, id: req.params.termId };
  const result = await upsertTerm(req.params.id, term);
  if (!result) { res.status(404).json({ error: "未找到该作品" }); return; }
  res.json(result);
});

novelsRouter.delete("/:id/terms/:termId", async (req, res) => {
  const ok = await deleteTerm(req.params.id, req.params.termId);
  if (!ok) { res.status(404).json({ error: "未找到" }); return; }
  res.json({ ok: true });
});

novelsRouter.post("/:id/revisions", async (req, res) => {
  const entry: RevisionEntry = req.body;
  await addRevision(req.params.id, entry);
  res.status(201).json({ ok: true });
});
