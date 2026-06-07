import type { Novel, Chapter, AICredentials } from "./types.ts";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function fetchNovel(id: string): Promise<Novel> {
  const r = await fetch(`/api/novels/${id}`);
  if (!r.ok) throw new Error("加载作品失败");
  return r.json();
}

export async function saveChapter(
  novelId: string,
  chapterId: string,
  patch: Partial<Pick<Chapter, "title" | "body" | "status">>
): Promise<Chapter> {
  const r = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("保存失败");
  return r.json();
}

export async function createChapter(
  novelId: string,
  volumeId: string,
  title: string
): Promise<Chapter> {
  const r = await fetch(`/api/novels/${novelId}/chapters`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ volumeId, title }),
  });
  if (!r.ok) throw new Error("新建章节失败");
  return r.json();
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onDone?: () => void;
  onError?: (msg: string) => void;
}

/**
 * 调用后端 AI 流式续写。返回一个 abort 函数，可中途取消。
 */
export function streamComplete(
  args: {
    credentials: AICredentials;
    system: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  },
  handlers: StreamHandlers
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const resp = await fetch("/api/ai/complete", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(args),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
        handlers.onError?.(err.error || "AI 请求失败");
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const block of lines) {
          const line = block.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          try {
            const json = JSON.parse(payload);
            if (json.error) { handlers.onError?.(json.error); return; }
            if (json.delta) handlers.onDelta(json.delta);
            if (json.done) { handlers.onDone?.(); return; }
          } catch {
            /* ignore partial */
          }
        }
      }
      handlers.onDone?.();
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      handlers.onError?.((e as Error).message || "网络错误");
    }
  })();

  return () => controller.abort();
}
