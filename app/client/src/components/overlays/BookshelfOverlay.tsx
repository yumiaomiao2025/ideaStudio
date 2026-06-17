import { useEffect, useState } from "react";
import type { Novel, NovelSummary, InspectIssue } from "../../types.ts";
import { computeHeatmap } from "../../derive.ts";
import { fetchNovels, fetchInspect } from "../../api.ts";

interface Props {
  novel: Novel;
  onClose: () => void;
  onOpenNovel: (id: string) => void;
  onCreateNovel: (title: string, genre: string) => void;
}

export function BookshelfOverlay({ novel, onClose, onOpenNovel, onCreateNovel }: Props) {
  const heatmap = computeHeatmap(novel.writingLog ?? []);
  const [otherNovels, setOtherNovels] = useState<NovelSummary[]>([]);
  const [issues, setIssues] = useState<InspectIssue[]>([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("");

  useEffect(() => {
    fetchNovels().then((list) => setOtherNovels(list.filter((n) => n.id !== novel.id))).catch(() => {});
    fetchInspect(novel.id).then(setIssues).catch(() => {});
  }, [novel.id]);

  const log = novel.writingLog ?? [];
  const totalWords = novel.chapters.reduce((s, c) => s + c.body.length, 0);
  const avgDaily = log.length > 0
    ? Math.round(log.reduce((s, e) => s + e.wordsAdded, 0) / log.length)
    : 0;
  const maxDaily = log.length > 0 ? Math.max(...log.map((e) => e.wordsAdded)) : 0;

  const stats = [
    { label: "总字数", value: totalWords.toLocaleString() + " 字" },
    { label: "记录天数", value: log.length + " 天" },
    { label: "日均码字", value: avgDaily.toLocaleString() + " 字" },
    { label: "最高单日", value: maxDaily.toLocaleString() + " 字" },
    { label: "章节数", value: novel.chapters.length + " 章" },
  ];

  const aiReminders = issues.slice(0, 3).map((i) => ({ level: i.severity, text: i.title }));

  return (
    <div className="overlay-backdrop center-overlay" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">📚 书架</h2>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          {/* Current novel */}
          <div className="book-card" style={{ borderBottom: "2px solid var(--accent)", paddingBottom: 20, marginBottom: 16 }}>
            <div className="book-cover">⚔</div>
            <div style={{ flex: 1 }}>
              <div className="book-title">{novel.title}</div>
              <div className="book-meta">{novel.genre} · {novel.chapters.length} 章</div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                {stats.map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, fontSize: 14 }}>{s.value}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Heatmap */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 4 }}>码字热度 · 近 12 周</div>
                <div className="book-heatmap">
                  {heatmap.map((v, i) => (
                    <div key={i} className={`hm-cell hm-${v}`} />
                  ))}
                </div>
              </div>

              <button className="btn-accent" onClick={() => { onOpenNovel(novel.id); onClose(); }}>
                继续写 →
              </button>
            </div>
          </div>

          {/* AI reminders */}
          <div className="panel-section">
            <h5>AI 提醒</h5>
            {aiReminders.map((r, i) => (
              <div key={i} className={"inspect-item " + r.level} style={{ marginBottom: 8 }}>
                <div className="inspect-item-head">
                  <span className={"inspect-badge " + r.level}>
                    {r.level === "high" ? "高" : r.level === "medium" ? "中" : "低"}
                  </span>
                  <span style={{ fontSize: 13 }}>{r.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Other novels */}
          <div className="panel-section">
            <h5>其他作品</h5>
            {otherNovels.map((n) => (
              <div key={n.id} className="book-card" style={{ gap: 12 }}>
                <div className="book-cover" style={{ width: 40, height: 52, fontSize: 16 }}>📖</div>
                <div style={{ flex: 1 }}>
                  <div className="book-title" style={{ fontSize: 14 }}>{n.title}</div>
                  <div className="book-meta">{n.genre} · {n.chapterCount} 章</div>
                  <button className="inspect-action-btn" onClick={() => onOpenNovel(n.id)}>
                    打开
                  </button>
                </div>
              </div>
            ))}
            {otherNovels.length === 0 && (
              <div style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 8 }}>暂无其他作品</div>
            )}
            {!creating && (
              <button className="inspect-action-btn" style={{ marginTop: 8 }}
                onClick={() => setCreating(true)}>
                + 新建作品
              </button>
            )}
            {creating && (
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="作品名"
                  style={{ flex: 1, minWidth: 120, padding: "6px 10px", border: "1px solid var(--line-2)", borderRadius: 6, fontSize: 13 }}
                />
                <input
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="题材"
                  style={{ width: 100, padding: "6px 10px", border: "1px solid var(--line-2)", borderRadius: 6, fontSize: 13 }}
                />
                <button className="btn-accent" onClick={() => onCreateNovel(newTitle, newGenre)}>创建</button>
                <button className="btn-soft" onClick={() => setCreating(false)}>取消</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
