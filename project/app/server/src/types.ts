// Shared domain types for the server.

export type ChapterStatus = "done" | "writing" | "draft" | "outline";

export interface Chapter {
  id: string;
  volumeId: string;
  num: number;
  title: string;
  /** Plain text, paragraphs separated by "\n". */
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
  kind: string;        // "人物 · 主角" 等
  body: string;
  meta?: string;
  isForeshadow?: boolean;
}

export interface Novel {
  id: string;
  title: string;
  genre: string;
  /** AI 风格记忆（注入 system prompt）。 */
  styleNotes: string[];
  volumes: Volume[];
  chapters: Chapter[];
  terms: Term[];
}

export interface DB {
  novels: Novel[];
}

/** OpenAI 兼容凭据，由前端每次请求携带（或服务端 .env 兜底）。 */
export interface AICredentials {
  apiUrl: string;   // 形如 https://api.openai.com/v1
  apiKey: string;
  model: string;
}
