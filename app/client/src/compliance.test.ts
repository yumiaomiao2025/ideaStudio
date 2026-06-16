import { describe, it, expect } from "vitest";
import { SENSITIVE_WORDS, SENSITIVE_REPLACEMENTS, scanCompliance, decorateBody } from "./compliance.ts";

describe("scanCompliance", () => {
  it("finds sensitive word occurrences with indices", () => {
    const hits = scanCompliance("一场刺杀，留下旧血。", ["刺杀", "旧血"]);
    expect(hits).toEqual([
      { word: "刺杀", index: 2 },
      { word: "旧血", index: 7 },
    ]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(scanCompliance("平静的一天", SENSITIVE_WORDS)).toEqual([]);
  });
});

describe("SENSITIVE_REPLACEMENTS", () => {
  it("has a suggested replacement for every sensitive word", () => {
    for (const w of SENSITIVE_WORDS) {
      expect(SENSITIVE_REPLACEMENTS[w]).toBeTruthy();
    }
  });
});

describe("decorateBody", () => {
  it("wraps sensitive words in a span with data-sensitive", () => {
    const html = decorateBody("他遭遇了刺杀", [], ["刺杀"]);
    expect(html).toContain('<span class="sensitive-word" data-sensitive="刺杀">刺杀</span>');
  });

  it("wraps term names in a span with data-termid, first occurrence only", () => {
    const html = decorateBody("沈砚走了，沈砚又回来了", [{ id: "t1", name: "沈砚" }], []);
    const matches = html.match(/data-termid="t1"/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  it("escapes html special characters", () => {
    const html = decorateBody("a < b & c > d", [], []);
    expect(html).not.toContain("<b");
    expect(html).toContain("&lt;");
    expect(html).toContain("&gt;");
    expect(html).toContain("&amp;");
  });
});
