import type { AICredentials, Novel, Chapter } from "./types.ts";

const KEY = "xws_ai_credentials";

export function loadCredentials(): AICredentials {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { apiUrl: "", apiKey: "", model: "" };
}

export function saveCredentials(c: AICredentials): void {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function hasCredentials(c: AICredentials): boolean {
  return !!(c.apiUrl && c.apiKey && c.model);
}

/**
 * 拼 system prompt：把风格记忆 + 设定库 + 上下文喂给模型。
 * 这是「让 AI 写得像你」的核心。
 */
export function buildSystemPrompt(novel: Novel): string {
  const style = novel.styleNotes.map((s) => "- " + s).join("\n");
  const terms = novel.terms
    .map((t) => `- ${t.name}（${t.kind}）：${t.body}`)
    .join("\n");
  return [
    `你是一位网文小说续写助手，正在协助创作《${novel.title}》（${novel.genre}）。`,
    "",
    "【风格约束】（务必遵守，来自前文自动学习）：",
    style,
    "",
    "【关键设定 / 人物 / 伏笔】：",
    terms,
    "",
    "【输出要求】：",
    "- 只输出续写或改写的正文本身",
    "- 不要解释、不要引号包裹、不要 markdown、不要列表",
    "- 与前文语气、节奏、用词保持一致",
    "- 续写默认 1-3 句，不超过 100 字，除非用户另有要求",
  ].join("\n");
}

/** 续写 prompt：当前章正文 + 可选额外指令。 */
export function buildContinuePrompt(chapter: Chapter, extra?: string): string {
  return [
    `章节：第 ${chapter.num} 章 · ${chapter.title}`,
    "",
    "前文：",
    chapter.body,
    "",
    extra ? `要求：${extra}` : "请直接续写下文：",
  ].join("\n");
}

/** 改写 prompt：选中片段 + 指令。 */
export function buildRewritePrompt(selected: string, instruction: string): string {
  return [
    "请改写下面这段正文。只输出改写后的文字，长度与原文相近。",
    `要求：${instruction}`,
    "",
    "原文：",
    selected,
  ].join("\n");
}
