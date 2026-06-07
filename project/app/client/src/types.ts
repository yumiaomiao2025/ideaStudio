// 前端领域类型（与后端 types.ts 对应）。
export type ChapterStatus = "done" | "writing" | "draft" | "outline";

export interface Chapter {
  id: string;
  volumeId: string;
  num: number;
  title: string;
  body: string;
  status: ChapterStatus;
  updatedAt: number;
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
}

export interface Novel {
  id: string;
  title: string;
  genre: string;
  styleNotes: string[];
  volumes: Volume[];
  chapters: Chapter[];
  terms: Term[];
}

export interface AICredentials {
  apiUrl: string;
  apiKey: string;
  model: string;
}
