import type {
  Novel, Chapter, Term, RevisionEntry, AICredentials,
  InspectIssue, HealthReport, ChapterComplianceResult, NovelSummary,
} from "./types.ts";

const J = { "Content-Type": "application/json" };

export async function fetchNovel(id: string): Promise<Novel> {
  const r = await fetch(`/api/novels/${id}`);
  if (!r.ok) throw new Error("加载作品失败");
  return r.json();
}

export async function fetchNovels(): Promise<NovelSummary[]> {
  const r = await fetch(`/api/novels`);
  if (!r.ok) throw new Error("加载作品列表失败");
  return r.json();
}

export async function fetchInspect(novelId: string): Promise<InspectIssue[]> {
  const r = await fetch(`/api/novels/${novelId}/inspect`);
  if (!r.ok) throw new Error("加载巡检结果失败");
  return r.json();
}

export async function fetchHealth(novelId: string): Promise<HealthReport> {
  const r = await fetch(`/api/novels/${novelId}/health`);
  if (!r.ok) throw new Error("加载健康度失败");
  return r.json();
}

export async function fetchCompliance(novelId: string): Promise<ChapterComplianceResult[]> {
  const r = await fetch(`/api/novels/${novelId}/compliance`);
  if (!r.ok) throw new Error("加载合规检测失败");
  return r.json();
}

export async function revertChapter(novelId: string, chapterId: string, revisionId: string): Promise<Chapter> {
  const r = await fetch(`/api/novels/${novelId}/chapters/${chapterId}/revert`, {
    method: "POST", headers: J, body: JSON.stringify({ revisionId }),
  });
  if (!r.ok) throw new Error("回退失败");
  return r.json();
}

export async function saveChapter(
  novelId: string,
  chapterId: string,
  patch: Partial<Pick<Chapter, "title" | "body" | "status" | "authorNote">>
): Promise<Chapter> {
  const r = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
    method: "PATCH", headers: J, body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("保存失败");
  return r.json();
}

export async function createChapter(
  novelId: string, volumeId: string, title: string
): Promise<Chapter> {
  const r = await fetch(`/api/novels/${novelId}/chapters`, {
    method: "POST", headers: J, body: JSON.stringify({ volumeId, title }),
  });
  if (!r.ok) throw new Error("新建章节失败");
  return r.json();
}

export async function upsertTerm(novelId: string, term: Term): Promise<Term> {
  const r = await fetch(`/api/novels/${novelId}/terms/${term.id}`, {
    method: "PUT", headers: J, body: JSON.stringify(term),
  });
  if (!r.ok) throw new Error("保存设定失败");
  return r.json();
}

export async function deleteTerm(novelId: string, termId: string): Promise<void> {
  const r = await fetch(`/api/novels/${novelId}/terms/${termId}`, { method: "DELETE" });
  if (!r.ok) throw new Error("删除设定失败");
}

export async function postRevision(novelId: string, entry: RevisionEntry): Promise<void> {
  await fetch(`/api/novels/${novelId}/revisions`, {
    method: "POST", headers: J, body: JSON.stringify(entry),
  });
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onDone?: () => void;
  onError?: (msg: string) => void;
}

export function streamComplete(
  args: { credentials: AICredentials; system: string; prompt: string; maxTokens?: number; temperature?: number; },
  handlers: StreamHandlers
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const resp = await fetch("/api/ai/complete", {
        method: "POST", headers: J,
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
          } catch { /* ignore partial */ }
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
