import { describe, it, expect } from "vitest";
import { computeRelations, extractVoiceSamples, computeHeatmap, computeTensionCurve, computeCharacterTracks, computeDialogueRatio } from "./derive.ts";
import type { Novel, Character } from "./types.ts";

function makeNovel(overrides: Partial<Novel> = {}): Novel {
  return {
    id: "n1",
    title: "测试",
    genre: "玄幻",
    styleNotes: [],
    volumes: [],
    chapters: [],
    terms: [],
    characters: [],
    revisions: [],
    writingLog: [],
    ...overrides,
  };
}

const sheny: Character = { id: "ch1", name: "沈砚", role: "主角", description: "", traits: [], firstChapter: 1, appearances: 1 };
const jiyuan: Character = { id: "ch2", name: "季元", role: "反派", description: "", traits: [], firstChapter: 1, appearances: 1 };

describe("computeRelations", () => {
  it("counts co-occurrence in chapters where both characters appear", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body: "沈砚遇到了季元。" },
        { id: "c2", volumeId: "v1", num: 2, title: "", status: "done", updatedAt: 1, body: "沈砚独自上路。" },
      ],
      characters: [sheny, jiyuan],
    });
    const relations = computeRelations(novel, sheny);
    expect(relations).toHaveLength(1);
    expect(relations[0]).toMatchObject({ name: "季元", count: 1 });
  });

  it("excludes the character itself and characters with zero co-occurrence", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body: "沈砚独自上路。" },
      ],
      characters: [sheny, jiyuan],
    });
    const relations = computeRelations(novel, sheny);
    expect(relations).toHaveLength(0);
  });
});

describe("extractVoiceSamples", () => {
  it("extracts double-quoted dialogue from chapters mentioning the character", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body: '沈砚说："嗯。"他没再多说。' },
      ],
    });
    const voices = extractVoiceSamples(novel, sheny);
    expect(voices).toContain("嗯。");
  });

  it("extracts corner-bracket dialogue too", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body: "沈砚道：「走了。」" },
      ],
    });
    const voices = extractVoiceSamples(novel, sheny);
    expect(voices).toContain("走了。");
  });

  it("returns an empty array when no dialogue is found", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body: "沈砚走在路上，没有说话。" },
      ],
    });
    expect(extractVoiceSamples(novel, sheny)).toEqual([]);
  });

  it("caps results at 5 unique samples", () => {
    const body = Array.from({ length: 8 }, (_, i) => `沈砚说："台词${i}"`).join("\n");
    const novel = makeNovel({
      chapters: [{ id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body }],
    });
    expect(extractVoiceSamples(novel, sheny).length).toBeLessThanOrEqual(5);
  });
});

describe("computeHeatmap", () => {
  it("buckets word counts into 5 intensity levels across 84 days", () => {
    const today = new Date();
    const log = [{ date: today.toISOString().slice(0, 10), wordsAdded: 3000 }];
    const cells = computeHeatmap(log, 84);
    expect(cells).toHaveLength(84);
    expect(cells[cells.length - 1]).toBe(4);
  });

  it("returns 0 for days with no logged words", () => {
    const cells = computeHeatmap([], 7);
    expect(cells).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("computeTensionCurve", () => {
  it("normalizes chapter body length to a 0-100 scale, sorted by chapter number", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c2", volumeId: "v1", num: 2, title: "", status: "done", updatedAt: 1, body: "短" },
        { id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body: "这是一段长得多的正文内容用于测试" },
      ],
    });
    const curve = computeTensionCurve(novel.chapters);
    expect(curve.map((p) => p.num)).toEqual([1, 2]);
    expect(curve[0].value).toBe(100);
    expect(curve[1].value).toBeLessThan(100);
  });

  it("returns an empty array for a novel with no chapters", () => {
    expect(computeTensionCurve([])).toEqual([]);
  });
});

describe("computeCharacterTracks", () => {
  it("derives each character's appearance span from real chapter co-occurrence", () => {
    const novel = makeNovel({
      chapters: [
        { id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body: "沈砚出发。" },
        { id: "c5", volumeId: "v1", num: 5, title: "", status: "done", updatedAt: 1, body: "沈砚与季元相遇。" },
      ],
      characters: [sheny, jiyuan],
    });
    const tracks = computeCharacterTracks(novel);
    const shenyTrack = tracks.find((t) => t.name === "沈砚")!;
    const jiyuanTrack = tracks.find((t) => t.name === "季元")!;
    expect(shenyTrack).toMatchObject({ start: 1, end: 5 });
    expect(jiyuanTrack).toMatchObject({ start: 5, end: 5 });
  });

  it("excludes characters who never appear in any chapter body", () => {
    const novel = makeNovel({
      chapters: [{ id: "c1", volumeId: "v1", num: 1, title: "", status: "done", updatedAt: 1, body: "无人登场" }],
      characters: [sheny],
    });
    expect(computeCharacterTracks(novel)).toEqual([]);
  });
});

describe("computeDialogueRatio", () => {
  it("computes the share of lines containing dialogue across chapters", () => {
    const chapters = [
      { id: "c1", volumeId: "v1", num: 1, title: "", status: "done" as const, updatedAt: 1, body: '"台词一"\n"台词二"\n旁白句子' },
    ];
    expect(computeDialogueRatio(chapters)).toBeCloseTo(2 / 3, 5);
  });

  it("returns 0 when there are no lines", () => {
    expect(computeDialogueRatio([])).toBe(0);
  });
});
