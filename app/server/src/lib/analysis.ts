import type { Novel, WritingLogEntry } from "../types.js";

export const SENSITIVE_WORDS = ["刺杀", "暗杀", "血液", "尸身", "喘气", "旧血", "刀口"];

export const SENSITIVE_REPLACEMENTS: Record<string, string> = {
  "刺杀": "偷袭",
  "暗杀": "伏击",
  "血液": "暗色痕迹",
  "尸身": "遗体",
  "喘气": "呼吸急促",
  "旧血": "陈年痕迹",
  "刀口": "伤处",
};

export interface ComplianceHit {
  word: string;
  index: number;
}

export interface ChapterComplianceResult {
  chapterId: string;
  chapterNum: number;
  chapterTitle: string;
  hits: ComplianceHit[];
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function scanCompliance(text: string, words: string[] = SENSITIVE_WORDS): ComplianceHit[] {
  const hits: ComplianceHit[] = [];
  for (const word of words) {
    const re = new RegExp(escapeRegex(word), "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      hits.push({ word, index: m.index });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

export function scanNovelCompliance(novel: Novel): ChapterComplianceResult[] {
  const results: ChapterComplianceResult[] = [];
  for (const ch of novel.chapters) {
    const hits = scanCompliance(ch.body);
    if (hits.length > 0) {
      results.push({ chapterId: ch.id, chapterNum: ch.num, chapterTitle: ch.title, hits });
    }
  }
  return results;
}

export type IssueSeverity = "high" | "medium" | "low";

export interface InspectIssue {
  id: string;
  category: string;
  severity: IssueSeverity;
  title: string;
  excerpt: string;
  suggestions: string[];
  chapterId?: string;
}

const ABSENCE_GAP_THRESHOLD = 15;
const NEAR_FORESHADOW_WINDOW = 5;

export function inspectNovel(novel: Novel): InspectIssue[] {
  const issues: InspectIssue[] = [];
  const maxChapterNum = novel.chapters.reduce((m, c) => Math.max(m, c.num), 0);

  // Foreshadow tracking
  for (const term of novel.terms) {
    if (!term.isForeshadow || term.status === "collected" || !term.recoverChapter) continue;
    const remaining = term.recoverChapter - maxChapterNum;
    if (remaining <= 0) {
      issues.push({
        id: "fore-overdue-" + term.id,
        category: "伏笔",
        severity: "high",
        title: `伏笔「${term.name}」已超期未回收`,
        excerpt: `计划于第 ${term.recoverChapter} 章回收，当前进度第 ${maxChapterNum} 章`,
        suggestions: ["加入本周巡检计划", "调整回收章节", "标记为已回收"],
      });
    } else if (remaining <= NEAR_FORESHADOW_WINDOW) {
      issues.push({
        id: "fore-near-" + term.id,
        category: "伏笔",
        severity: "medium",
        title: `伏笔「${term.name}」即将到期`,
        excerpt: `计划于第 ${term.recoverChapter} 章回收，距当前进度仅 ${remaining} 章`,
        suggestions: ["提前铺垫", "规划回收路径"],
      });
    }
  }

  // Naming collisions — characters or terms sharing a first character
  const names = [
    ...novel.characters.map((c) => c.name),
    ...novel.terms.filter((t) => !t.isForeshadow).map((t) => t.name),
  ];
  const byFirstChar = new Map<string, string[]>();
  for (const name of names) {
    if (!name) continue;
    const key = name[0];
    byFirstChar.set(key, [...(byFirstChar.get(key) ?? []), name]);
  }
  for (const [, group] of byFirstChar) {
    const unique = Array.from(new Set(group));
    if (unique.length > 1) {
      issues.push({
        id: "naming-" + unique.join("-"),
        category: "命名",
        severity: "low",
        title: `${unique.join(" / ")} 首字相同，读者可能混淆`,
        excerpt: `检测到 ${unique.length} 个名称以「${unique[0][0]}」开头`,
        suggestions: ["调整其中一个名称", "加强区分性描写"],
      });
    }
  }

  // Character absence
  for (const ch of novel.characters) {
    const appearances = novel.chapters
      .filter((c) => c.body.includes(ch.name))
      .map((c) => c.num);
    if (appearances.length === 0) continue;
    const last = Math.max(...appearances);
    const gap = maxChapterNum - last;
    if (gap >= ABSENCE_GAP_THRESHOLD) {
      issues.push({
        id: "absence-" + ch.id,
        category: "一致性",
        severity: gap >= ABSENCE_GAP_THRESHOLD * 2 ? "high" : "medium",
        title: `${ch.name} 已有 ${gap} 章未出场`,
        excerpt: `最近一次出场在第 ${last} 章，当前进度第 ${maxChapterNum} 章`,
        suggestions: ["安排一次回场", "在对话中提及该角色"],
      });
    }
  }

  // Compliance
  for (const result of scanNovelCompliance(novel)) {
    const words = Array.from(new Set(result.hits.map((h) => h.word)));
    issues.push({
      id: "compliance-" + result.chapterId,
      category: "合规",
      severity: "medium",
      title: `第 ${result.chapterNum} 章命中敏感词 ${words.length} 处`,
      excerpt: `「${words.join("」「")}」`,
      suggestions: words.map((w) => `将「${w}」替换为「${SENSITIVE_REPLACEMENTS[w] ?? "更温和的表达"}」`),
      chapterId: result.chapterId,
    });
  }

  // Pacing — consecutive dialogue-heavy chapters
  const ordered = [...novel.chapters].sort((a, b) => a.num - b.num);
  let dialogueRun = 0;
  for (let i = 0; i < ordered.length; i++) {
    const ch = ordered[i];
    const lines = ch.body.split("\n").filter(Boolean);
    const dialogueLines = lines.filter((l) => /["「]/.test(l));
    const ratio = lines.length > 0 ? dialogueLines.length / lines.length : 0;
    if (ratio > 0.5) {
      dialogueRun++;
    } else {
      dialogueRun = 0;
    }
    if (dialogueRun === 3) {
      issues.push({
        id: "pacing-" + ch.id,
        category: "节奏",
        severity: "medium",
        title: `连续 3 章对话密度过高（截至第 ${ch.num} 章）`,
        excerpt: "叙事长期依赖对话推进，读者需要喘息场景",
        suggestions: ["下一章加入环境或独处描写", "插入过渡性回忆"],
      });
    }
  }

  return issues;
}

export interface HealthCardStat {
  label: string;
  value: string;
}

export interface HealthCard {
  title: string;
  stats: HealthCardStat[];
}

export interface HealthAction {
  text: string;
  score: string;
  detail: string;
}

export interface HealthReport {
  score: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  cards: HealthCard[];
  actions: HealthAction[];
}

const SEVERITY_PENALTY: Record<IssueSeverity, number> = { high: 8, medium: 4, low: 1 };
const SEVERITY_BONUS: Record<IssueSeverity, string> = { high: "+5", medium: "+3", low: "+1" };

export function computeHealth(novel: Novel): HealthReport {
  const issues = inspectNovel(novel);
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;
  const lowCount = issues.filter((i) => i.severity === "low").length;

  const penalty = issues.reduce((sum, i) => sum + SEVERITY_PENALTY[i.severity], 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));

  const totalWords = novel.chapters.reduce((s, c) => s + c.body.length, 0);
  const doneChapters = novel.chapters.filter((c) => c.status === "done").length;
  const avgWords = novel.chapters.length > 0 ? totalWords / novel.chapters.length : 0;

  const lengths = novel.chapters.map((c) => c.body.length);
  const meanLen = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const variance = lengths.length > 0
    ? lengths.reduce((s, l) => s + (l - meanLen) ** 2, 0) / lengths.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const structureLabel = meanLen === 0 ? "暂无数据" : stdDev / Math.max(meanLen, 1) < 0.4 ? "低（稳定）" : "高（波动）";

  const foreshadowTerms = novel.terms.filter((t) => t.isForeshadow);
  const collected = foreshadowTerms.filter((t) => t.status === "collected").length;

  const sentences = novel.chapters.flatMap((c) => c.body.split(/[。！？]/).filter((s) => s.trim().length > 0));
  const avgSentenceLen = sentences.length > 0
    ? Math.round(sentences.reduce((s, sentence) => s + sentence.length, 0) / sentences.length)
    : 0;

  const cards: HealthCard[] = [
    {
      title: "📝 进度",
      stats: [
        { label: "总字数", value: totalWords.toLocaleString() + " 字" },
        { label: "已完成章节", value: doneChapters + " 章" },
        { label: "章均字数", value: Math.round(avgWords).toLocaleString() + " 字" },
        { label: "总章节数", value: novel.chapters.length + " 章" },
      ],
    },
    {
      title: "📐 结构",
      stats: [
        { label: "章节长度波动", value: structureLabel },
        { label: "节奏问题", value: issues.filter((i) => i.category === "节奏").length + " 处" },
        { label: "命名风险", value: issues.filter((i) => i.category === "命名").length + " 处" },
        { label: "一致性问题", value: issues.filter((i) => i.category === "一致性").length + " 处" },
      ],
    },
    {
      title: "🔗 一致性",
      stats: [
        { label: "待修角色问题", value: issues.filter((i) => i.category === "一致性").length + " 个" },
        { label: "伏笔回收率", value: `${collected} / ${foreshadowTerms.length}` },
        { label: "伏笔超期数", value: issues.filter((i) => i.id.startsWith("fore-overdue")).length + " 条" },
        { label: "命名冲突", value: issues.filter((i) => i.category === "命名").length + " 处" },
      ],
    },
    {
      title: "🎨 风格 / 合规",
      stats: [
        { label: "平均句长", value: avgSentenceLen + " 字" },
        { label: "合规命中章节", value: scanNovelCompliance(novel).length + " 章" },
        { label: "合规命中词数", value: scanNovelCompliance(novel).reduce((s, r) => s + r.hits.length, 0) + " 处" },
        { label: "风格笔记数", value: novel.styleNotes.length + " 条" },
      ],
    },
  ];

  const actions: HealthAction[] = [...issues]
    .sort((a, b) => SEVERITY_PENALTY[b.severity] - SEVERITY_PENALTY[a.severity])
    .slice(0, 3)
    .map((issue) => ({
      text: issue.title,
      score: SEVERITY_BONUS[issue.severity],
      detail: issue.excerpt,
    }));

  return { score, highCount, mediumCount, lowCount, cards, actions };
}

export function applyWritingLog(log: WritingLogEntry[], date: string, delta: number): WritingLogEntry[] {
  const idx = log.findIndex((e) => e.date === date);
  if (idx >= 0) {
    const next = [...log];
    next[idx] = { date, wordsAdded: next[idx].wordsAdded + delta };
    return next;
  }
  return [...log, { date, wordsAdded: delta }];
}

export function revertChapterSnapshot(novel: Novel, chapterId: string, revisionId: string): string | undefined {
  const revision = novel.revisions.find((r) => r.id === revisionId && r.chapterId === chapterId);
  return revision?.snapshot;
}
