import type { Novel, Character, Chapter, WritingLogEntry } from "./types.ts";

export interface RelationInfo {
  name: string;
  count: number;
}

export function computeRelations(novel: Novel, character: Character): RelationInfo[] {
  return novel.characters
    .filter((c) => c.id !== character.id)
    .map((c) => ({
      name: c.name,
      count: novel.chapters.filter((ch) => ch.body.includes(character.name) && ch.body.includes(c.name)).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

const DIALOGUE_PATTERNS = [/"([^"]+)"/g, /「([^」]+)」/g];

export function extractVoiceSamples(novel: Novel, character: Character, limit = 5): string[] {
  const samples: string[] = [];
  for (const ch of novel.chapters) {
    if (!ch.body.includes(character.name)) continue;
    for (const pattern of DIALOGUE_PATTERNS) {
      const re = new RegExp(pattern);
      let m: RegExpExecArray | null;
      while ((m = re.exec(ch.body))) {
        const line = m[1].trim();
        if (line && !samples.includes(line)) samples.push(line);
      }
    }
  }
  return samples.slice(0, limit);
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function levelFor(words: number): number {
  if (words <= 0) return 0;
  if (words < 800) return 1;
  if (words < 1600) return 2;
  if (words < 2600) return 3;
  return 4;
}

export function computeHeatmap(log: WritingLogEntry[], days = 84): number[] {
  const byDate = new Map(log.map((e) => [e.date, e.wordsAdded]));
  const today = new Date();
  const cells: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    cells.push(levelFor(byDate.get(dateKey(d)) ?? 0));
  }
  return cells;
}

export interface TensionPoint {
  num: number;
  value: number;
}

export function computeTensionCurve(chapters: Chapter[]): TensionPoint[] {
  if (chapters.length === 0) return [];
  const maxLen = Math.max(...chapters.map((c) => c.body.length), 1);
  return chapters
    .slice()
    .sort((a, b) => a.num - b.num)
    .map((c) => ({ num: c.num, value: Math.round((c.body.length / maxLen) * 100) }));
}

export interface CharacterTrack {
  name: string;
  start: number;
  end: number;
}

export function computeCharacterTracks(novel: Novel): CharacterTrack[] {
  const tracks: CharacterTrack[] = [];
  for (const character of novel.characters) {
    const nums = novel.chapters
      .filter((ch) => ch.body.includes(character.name))
      .map((ch) => ch.num);
    if (nums.length === 0) continue;
    tracks.push({ name: character.name, start: Math.min(...nums), end: Math.max(...nums) });
  }
  return tracks;
}

export function computeDialogueRatio(chapters: Chapter[]): number {
  const lines = chapters.flatMap((ch) => ch.body.split("\n").filter(Boolean));
  if (lines.length === 0) return 0;
  const dialogueLines = lines.filter((l) => /["「]/.test(l));
  return dialogueLines.length / lines.length;
}

export interface StyleMetrics {
  avgSentenceLen: number;
  dialogueRatio: number;
  metaphorDensity: number;
  passiveRatio: number;
}

const SENTENCE_SPLIT = /[。！？!?…\n]+/;
const METAPHOR_MARKERS = /像|如|仿佛|似|犹如|宛如|好比/;

export function computeStyleMetrics(body: string): StyleMetrics {
  const sentences = body
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.replace(/["「」“”']/g, "").length > 0);
  if (sentences.length === 0) {
    return { avgSentenceLen: 0, dialogueRatio: 0, metaphorDensity: 0, passiveRatio: 0 };
  }
  const totalChars = sentences.reduce((sum, s) => sum + s.replace(/\s/g, "").length, 0);
  const share = (n: number) => Math.round((n / sentences.length) * 100);
  return {
    avgSentenceLen: Math.round(totalChars / sentences.length),
    dialogueRatio: share(sentences.filter((s) => /["「]/.test(s)).length),
    metaphorDensity: share(sentences.filter((s) => METAPHOR_MARKERS.test(s)).length),
    passiveRatio: share(sentences.filter((s) => /被/.test(s)).length),
  };
}

export interface ContextUsage {
  label: string;
  pct: number;
}

export function computeContextUsage(novel: Novel, chapter: Chapter | undefined): ContextUsage[] {
  const bodyLen = chapter?.body.length ?? 0;
  const charLen = novel.characters.reduce(
    (s, c) => s + c.name.length + c.role.length + c.description.length + c.traits.join("").length,
    0
  );
  const termLen = novel.terms.reduce(
    (s, t) => s + t.name.length + t.kind.length + t.body.length + (t.meta?.length ?? 0),
    0
  );
  const styleLen = novel.styleNotes.reduce((s, n) => s + n.length, 0);
  const buckets = [
    { label: "正文", len: bodyLen },
    { label: "人物", len: charLen },
    { label: "设定", len: termLen },
    { label: "风格", len: styleLen },
  ];
  const total = buckets.reduce((s, b) => s + b.len, 0);
  return buckets.map((b) => ({ label: b.label, pct: total === 0 ? 0 : Math.round((b.len / total) * 100) }));
}
