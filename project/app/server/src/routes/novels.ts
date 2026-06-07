import { Router } from "express";
import { getNovels, getNovel, updateChapter, createChapter } from "../store.js";

export const novelsRouter = Router();

novelsRouter.get("/", async (_req, res) => {
  const novels = await getNovels();
  // 列表里不带全文，省流量
  res.json(
    novels.map((n) => ({ id: n.id, title: n.title, genre: n.genre, chapterCount: n.chapters.length }))
  );
});

novelsRouter.get("/:id", async (req, res) => {
  const novel = await getNovel(req.params.id);
  if (!novel) { res.status(404).json({ error: "未找到该作品" }); return; }
  res.json(novel);
});

novelsRouter.patch("/:id/chapters/:chapterId", async (req, res) => {
  const { title, body, status } = req.body ?? {};
  const ch = await updateChapter(req.params.id, req.params.chapterId, { title, body, status });
  if (!ch) { res.status(404).json({ error: "未找到该章节" }); return; }
  res.json(ch);
});

novelsRouter.post("/:id/chapters", async (req, res) => {
  const { volumeId, title } = req.body ?? {};
  const ch = await createChapter(req.params.id, volumeId || "vol2", title || "新章节");
  if (!ch) { res.status(404).json({ error: "未找到该作品" }); return; }
  res.status(201).json(ch);
});
