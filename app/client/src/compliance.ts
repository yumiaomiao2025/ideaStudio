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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

export interface TermLike {
  id: string;
  name: string;
}

export function decorateBody(
  line: string,
  terms: TermLike[],
  sensitiveWords: string[] = SENSITIVE_WORDS
): string {
  let html = escapeHtml(line) || "<br/>";
  for (const sw of sensitiveWords) {
    html = html.replace(
      new RegExp(escapeRegex(sw), "g"),
      `<span class="sensitive-word" data-sensitive="${sw}">${sw}</span>`
    );
  }
  const seen = new Set<string>();
  for (const term of terms) {
    if (seen.has(term.name) || !term.name) continue;
    if (html.includes(term.name)) {
      html = html.replace(
        new RegExp(escapeRegex(term.name), ""),
        `<span class="term-word" data-termid="${term.id}">${term.name}</span>`
      );
      seen.add(term.name);
    }
  }
  return html;
}
