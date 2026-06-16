import { useEffect, useState } from "react";
import type { Novel, AICredentials, InspectIssue } from "../../types.ts";
import { streamComplete, fetchInspect } from "../../api.ts";
import { buildSystemPrompt } from "../../prompt.ts";

interface Props {
  novel: Novel;
  credentials: AICredentials;
  hasCreds: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

const CATEGORIES = ["全部", "一致性", "伏笔", "节奏", "命名", "合规"];

export function InspectOverlay({ novel, credentials, hasCreds, onClose, onToast }: Props) {
  const [filter, setFilter] = useState("全部");
  const [issues, setIssues] = useState<InspectIssue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [aiResponse, setAiResponse] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const abortRef = { current: null as (() => void) | null };

  useEffect(() => {
    fetchInspect(novel.id)
      .then(setIssues)
      .catch(() => onToast("巡检加载失败"))
      .finally(() => setLoadingIssues(false));
  }, [novel.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filter === "全部" ? issues : issues.filter((i) => i.category === filter);

  function askAI(issue: InspectIssue) {
    if (!hasCreds) { onToast("请先配置 AI 服务"); return; }
    setLoading(issue.id);
    let acc = "";
    abortRef.current = streamComplete(
      {
        credentials,
        system: buildSystemPrompt(novel),
        prompt: `针对以下问题给出具体可执行的修改建议：\n\n问题：${issue.title}\n\n原文摘录：${issue.excerpt}\n\n请给出 2-3 条具体建议，每条不超过 40 字。`,
        maxTokens: 300,
      },
      {
        onDelta: (d) => { acc += d; setAiResponse((prev) => ({ ...prev, [issue.id]: acc })); },
        onDone: () => setLoading(null),
        onError: (msg) => { setLoading(null); onToast("AI 错误：" + msg); },
      }
    );
  }

  const highCount = issues.filter((i) => i.severity === "high").length;
  const medCount = issues.filter((i) => i.severity === "medium").length;
  const lowCount = issues.filter((i) => i.severity === "low").length;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">⚐ AI 巡检中心</h2>
          <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
            <span className="inspect-badge high">高 {highCount}</span>
            <span className="inspect-badge medium">中 {medCount}</span>
            <span className="inspect-badge low">低 {lowCount}</span>
          </div>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          <div className="inspect-filters">
            {CATEGORIES.map((cat) => (
              <button key={cat}
                className={"inspect-filter" + (filter === cat ? " active" : "")}
                onClick={() => setFilter(cat)}>
                {cat}
              </button>
            ))}
          </div>

          {loadingIssues && <div style={{ color: "var(--ink-3)", fontSize: 13, padding: "20px 0" }}>巡检中…</div>}
          {!loadingIssues && filtered.length === 0 && (
            <div style={{ color: "var(--ink-3)", fontSize: 13, padding: "20px 0" }}>未发现该类问题，继续保持</div>
          )}

          {filtered.map((issue) => (
            <div key={issue.id} className={"inspect-item " + issue.severity}>
              <div className="inspect-item-head">
                <span className={"inspect-badge " + issue.severity}>
                  {issue.severity === "high" ? "高" : issue.severity === "medium" ? "中" : "低"}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{issue.category}</span>
                <span className="inspect-item-title">{issue.title}</span>
              </div>
              <div className="inspect-excerpt">{issue.excerpt}</div>

              {aiResponse[issue.id] && (
                <div style={{
                  padding: "8px 10px", marginBottom: 8,
                  background: "var(--accent-soft)", borderRadius: 6,
                  fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.65,
                  fontFamily: "Noto Serif SC, serif",
                }}>
                  ✦ {aiResponse[issue.id]}
                </div>
              )}

              <div className="inspect-actions">
                <button
                  className={"inspect-action-btn primary" + (loading === issue.id ? " disabled" : "")}
                  onClick={() => askAI(issue)}
                  disabled={loading === issue.id}>
                  {loading === issue.id ? "AI 生成中…" : "✦ AI 给方案"}
                </button>
                {issue.suggestions.slice(1).map((s) => (
                  <button key={s} className="inspect-action-btn"
                    onClick={() => onToast(`已标记：${s}`)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
