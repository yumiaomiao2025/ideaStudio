import { describe, it, expect } from "vitest";
import {
  scanCompliance,
  scanNovelCompliance,
  inspectNovel,
  computeHealth,
  applyWritingLog,
  revertChapterSnapshot,
  SENSITIVE_WORDS,
  SENSITIVE_REPLACEMENTS,
} from "./analysis.js";
import type { Novel } from "../types.js";

function makeNovel(overrides: Partial<Novel> = {}): Novel {
  return {
    id: "n1",
    title: "测试小说",
    genre: "玄幻",
    styleNotes: ["句子偏短，平均 14 字"],
    volumes: [{ id: "v1", title: "卷一", order: 1 }],
    chapters: [
      { id: "c1", volumeId: "v1", num: 1, title: "起", status: "done", updatedAt: 1, body: "沈砚走在路上。" },
      { id: "c2", volumeId: "v1", num: 2, title: "承", status: "done", updatedAt: 1, body: "季元出现了。" },
    ],
    terms: [],
    characters: [],
    revisions: [],
    writingLog: [],
    ...overrides,
  };
}

describe("scanCompliance", () => {
  it("finds all sensitive word occurrences with correct indices", () => {
    const hits = scanCompliance("他刺杀了对方，留下旧血。", ["刺杀", "旧血"]);
    expect(hits).toHaveLength(2);
    expect(hits[0]).toEqual({ word: "刺杀", index: 1 });
    expect(hits[1]).toEqual({ word: "旧血", index: 9 });
  });

  it("returns empty array when no sensitive words present", () => {
    expect(scanCompliance("一段平静的文字。", SENSITIVE_WORDS)).toEqual([]);
  });

  it("finds multiple occurrences of the same word", () => {
    const hits = scanCompliance("刺杀，再次刺杀。", ["刺杀"]);
    expect(hits).toHaveLength(2);
  });
});

describe("scanNovelCompliance", () => {
  it("aggregates hits per chapter with chapter metadata", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "刺杀夜", status: "done", updatedAt: 1, body: "他遭遇了刺杀。" },
        { id: "c2", volumeId: "v1", num: 2, title: "平静", status: "done", updatedAt: 1, body: "什么都没发生。" },
      ],
    });
    const result = scanNovelCompliance(novel);
    expect(result).toHaveLength(1);
    expect(result[0].chapterId).toBe("c1");
    expect(result[0].hits[0].word).toBe("刺杀");
  });
});

describe("inspectNovel", () => {
  it("flags an overdue foreshadow that has passed its recover chapter", () => {
    const novel = makeNovel({
      terms: [
        { id: "t1", name: "铜牌", kind: "物品", body: "信物", isForeshadow: true, plantedChapter: 1, recoverChapter: 2, status: "planted" },
      ],
    });
    const issues = inspectNovel(novel);
    expect(issues.some((i) => i.category === "伏笔" && i.severity === "high")).toBe(true);
  });

  it("flags a foreshadow nearing its recover chapter", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "起", status: "done", updatedAt: 1, body: "正文" },
      ],
      terms: [
        { id: "t1", name: "铜牌", kind: "物品", body: "信物", isForeshadow: true, plantedChapter: 1, recoverChapter: 3, status: "planted" },
      ],
    });
    const issues = inspectNovel(novel);
    expect(issues.some((i) => i.category === "伏笔" && i.severity === "medium")).toBe(true);
  });

  it("does not flag a foreshadow already collected", () => {
    const novel = makeNovel({
      terms: [
        { id: "t1", name: "铜牌", kind: "物品", body: "信物", isForeshadow: true, plantedChapter: 1, recoverChapter: 2, status: "collected" },
      ],
    });
    const issues = inspectNovel(novel);
    expect(issues.some((i) => i.category === "伏笔")).toBe(false);
  });

  it("flags characters sharing the same first character as a naming risk", () => {
    const novel = makeNovel({
      characters: [
        { id: "ch1", name: "季元", role: "反派", description: "", traits: [], firstChapter: 1, appearances: 1 },
        { id: "ch2", name: "季远", role: "配角", description: "", traits: [], firstChapter: 1, appearances: 1 },
      ],
    });
    const issues = inspectNovel(novel);
    expect(issues.some((i) => i.category === "命名")).toBe(true);
  });

  it("flags a character absent for many chapters since their last appearance", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "起", status: "done", updatedAt: 1, body: "卫衍登场。" },
        { id: "c20", volumeId: "v1", num: 20, title: "终", status: "done", updatedAt: 1, body: "故事继续。" },
      ],
      characters: [
        { id: "ch1", name: "卫衍", role: "配角", description: "", traits: [], firstChapter: 1, appearances: 1 },
      ],
    });
    const issues = inspectNovel(novel);
    expect(issues.some((i) => i.category === "一致性" && i.title.includes("卫衍"))).toBe(true);
  });

  it("flags compliance hits found in chapter bodies", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "夜", status: "done", updatedAt: 1, body: "一场刺杀。" },
      ],
    });
    const issues = inspectNovel(novel);
    expect(issues.some((i) => i.category === "合规")).toBe(true);
  });
});

describe("computeHealth", () => {
  it("returns a lower score when there are more high-severity issues", () => {
    const clean = makeNovel();
    const risky = makeNovel({
      terms: [
        { id: "t1", name: "铜牌", kind: "物品", body: "信物", isForeshadow: true, plantedChapter: 1, recoverChapter: 1, status: "planted" },
      ],
    });
    const healthClean = computeHealth(clean);
    const healthRisky = computeHealth(risky);
    expect(healthRisky.score).toBeLessThan(healthClean.score);
  });

  it("reflects real chapter completion counts in the progress card", () => {
    const novel = makeNovel();
    const health = computeHealth(novel);
    const progress = health.cards.find((c) => c.title.includes("进度"));
    expect(progress).toBeDefined();
    const doneStat = progress!.stats.find((s) => s.label === "已完成章节");
    expect(doneStat?.value).toBe("2 章");
  });

  it("clamps score between 0 and 100", () => {
    const manyIssues = makeNovel({
      terms: Array.from({ length: 30 }, (_, i) => ({
        id: "t" + i, name: "term" + i, kind: "物品", body: "x",
        isForeshadow: true, plantedChapter: 1, recoverChapter: 1, status: "planted" as const,
      })),
    });
    const health = computeHealth(manyIssues);
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
  });
});

describe("applyWritingLog", () => {
  it("creates a new entry for a date not yet present", () => {
    const log = applyWritingLog([], "2026-06-16", 120);
    expect(log).toEqual([{ date: "2026-06-16", wordsAdded: 120 }]);
  });

  it("accumulates delta into an existing date entry", () => {
    const log = applyWritingLog([{ date: "2026-06-16", wordsAdded: 50 }], "2026-06-16", 30);
    expect(log).toEqual([{ date: "2026-06-16", wordsAdded: 80 }]);
  });

  it("leaves other dates untouched", () => {
    const log = applyWritingLog(
      [{ date: "2026-06-15", wordsAdded: 50 }],
      "2026-06-16",
      30
    );
    expect(log).toContainEqual({ date: "2026-06-15", wordsAdded: 50 });
    expect(log).toContainEqual({ date: "2026-06-16", wordsAdded: 30 });
  });
});

describe("revertChapterSnapshot", () => {
  it("returns the snapshot body for a matching revision", () => {
    const novel = makeNovel({
      revisions: [
        { id: "r1", chapterId: "c1", timestamp: 1, type: "auto", label: "自动保存", snapshot: "旧文本" },
      ],
    });
    expect(revertChapterSnapshot(novel, "c1", "r1")).toBe("旧文本");
  });

  it("returns undefined when the revision does not belong to the chapter", () => {
    const novel = makeNovel({
      revisions: [
        { id: "r1", chapterId: "c2", timestamp: 1, type: "auto", label: "自动保存", snapshot: "旧文本" },
      ],
    });
    expect(revertChapterSnapshot(novel, "c1", "r1")).toBeUndefined();
  });
});

describe("SENSITIVE_REPLACEMENTS", () => {
  it("has a suggested replacement for every sensitive word", () => {
    for (const w of SENSITIVE_WORDS) {
      expect(SENSITIVE_REPLACEMENTS[w]).toBeTruthy();
    }
  });
});
