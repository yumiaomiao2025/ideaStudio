export type ChapterStatus = "done" | "writing" | "draft" | "outline";

export interface Chapter {
  id: string;
  volumeId: string;
  num: number;
  title: string;
  body: string;
  status: ChapterStatus;
  updatedAt: number;
  authorNote?: string;
}

export interface Volume {
  id: string;
  title: string;
  order: number;
}

export interface Term {
  id: string;
  name: string;
  kind: string;
  body: string;
  meta?: string;
  isForeshadow?: boolean;
  plantedChapter?: number;
  recoverChapter?: number;
  status?: "planted" | "near" | "collected" | "new";
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string[];
  firstChapter: number;
  appearances: number;
}

export interface RevisionEntry {
  id: string;
  chapterId: string;
  timestamp: number;
  type: "user" | "ai" | "auto";
  label: string;
  snapshot: string;
  milestone?: boolean;
}

export interface WritingLogEntry {
  date: string;
  wordsAdded: number;
}

export interface Novel {
  id: string;
  title: string;
  genre: string;
  styleNotes: string[];
  volumes: Volume[];
  chapters: Chapter[];
  terms: Term[];
  characters: Character[];
  revisions: RevisionEntry[];
  writingLog: WritingLogEntry[];
}

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

export interface NovelSummary {
  id: string;
  title: string;
  genre: string;
  chapterCount: number;
}

export interface AICredentials {
  apiUrl: string;
  apiKey: string;
  model: string;
}

export type ViewMode = "write" | "kanban" | "timeline";
export type RightTab = "context" | "characters" | "terms" | "foreshadow" | "style" | "compliance";
export type OverlayType = "inspect" | "health" | "history" | "settings" | "publish" | "analytics" | "bookshelf" | "character" | null;
