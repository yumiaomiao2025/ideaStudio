import { useState } from "react";
import type { Novel } from "../../types.ts";

interface Props {
  novel: Novel;
  currentChapterId: string;
  onClose: () => void;
  onToast: (msg: string) => void;
  onRevert: (revisionId: string) => void;
}

export function HistoryOverlay({ novel, currentChapterId, onClose, onToast, onRevert }: Props) {
  const allRevisions = (novel.revisions || [])
    .filter((r) => r.chapterId === currentChapterId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const [selected, setSelected] = useState(0);

  const current = novel.chapters.find((c) => c.id === currentChapterId);
  const currentBody = current?.body || "";

  function formatTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }

  // Simple diff view
  function renderDiff(old: string, curr: string) {
    const oldLines = old.split("。").filter(Boolean);
    const currLines = curr.split("。").filter(Boolean);
    const maxLen = Math.max(oldLines.length, currLines.length);
    return Array.from({ length: maxLen }, (_, i) => {
      const o = oldLines[i];
      const c = currLines[i];
      if (!o) return { type: "add", text: c + "。" };
      if (!c) return { type: "del", text: o + "。" };
      if (o !== c) return [{ type: "del", text: o + "。" }, { type: "add", text: c + "。" }];
      return { type: "same", text: o + "。" };
    }).flat() as { type: string; text: string }[];
  }

  const diffLines = renderDiff(allRevisions[selected]?.snapshot || "", currentBody);

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">⏱ 修订历史</h2>
          <span style={{ fontSize: 13, color: "var(--ink-3)", marginLeft: 12 }}>
            {current ? `第 ${current.num} 章 · ${current.title}` : ""}
          </span>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          <div className="history-layout">
            {/* Timeline */}
            <div className="history-timeline">
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 8 }}>版本记录</div>
              {allRevisions.map((r, i) => (
                <div key={r.id}
                  className={"history-entry" + (i === selected ? " active" : "")}
                  onClick={() => setSelected(i)}>
                  <div className="history-entry-time">{formatTime(r.timestamp)}</div>
                  <div className="history-entry-label">{r.label}</div>
                  <span className={"history-entry-badge " + r.type}>
                    {r.type === "user" ? "手写" : r.type === "ai" ? "AI" : "自动"}
                  </span>
                  {r.milestone && <span style={{ fontSize: 10, color: "var(--warm)", marginLeft: 4 }}>★</span>}
                </div>
              ))}
              {allRevisions.length === 0 && (
                <div style={{ color: "var(--ink-3)", fontSize: 12.5, padding: "6px 0" }}>
                  暂无历史版本，继续写作或使用 AI 续写后会自动记录
                </div>
              )}
            </div>

            {/* Diff */}
            <div className="history-diff">
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 10 }}>
                与当前版本对比
              </div>
              <div style={{ lineHeight: 1.8 }}>
                {diffLines.map((line, i) => (
                  <div key={i} className={"diff-line " + line.type}>
                    {line.text}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <button className="btn-soft"
                  disabled={!allRevisions[selected]}
                  onClick={() => { if (allRevisions[selected]) { onRevert(allRevisions[selected].id); onClose(); } }}>
                  ↩ 回退至此版本
                </button>
                <button className="btn-soft"
                  disabled={!allRevisions[selected]}
                  onClick={() => {
                    navigator.clipboard?.writeText(allRevisions[selected]?.snapshot || "");
                    onToast("已复制该版本内容");
                  }}>
                  复制内容
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
