import type { Novel } from "../../types.ts";

interface Props {
  novel: Novel;
  onClose: () => void;
  onOpenNovel: () => void;
  onToast: (msg: string) => void;
}

export function BookshelfOverlay({ novel, onClose, onOpenNovel, onToast }: Props) {
  // Mock heatmap data (12 weeks × 7 days)
  const heatmap = Array.from({ length: 84 }, (_, i) => {
    const r = Math.random();
    return r < 0.3 ? 0 : r < 0.55 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4;
  });

  const stats = [
    { label: "总字数", value: novel.chapters.reduce((s, c) => s + c.body.length, 0).toLocaleString() + " 字" },
    { label: "连码天数", value: "17 天" },
    { label: "日均码字", value: "2,340 字" },
    { label: "最高单日", value: "5,820 字" },
    { label: "章节数", value: novel.chapters.length + " 章" },
  ];

  const aiReminders = [
    { level: "high" as const, text: "铜牌伏笔距回收仅 18 章，建议规划路径" },
    { level: "medium" as const, text: "连续 5 章对话密度超标，节奏需放缓" },
    { level: "low" as const, text: "卫衍死亡后沈砚的心理变化描写较少" },
  ];

  // Mock other novels
  const otherNovels = [
    { title: "星河落地", genre: "仙侠", chapters: 23, words: "115,200" },
    { title: "末日余生", genre: "末世", chapters: 8, words: "41,600" },
  ];

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

              <button className="btn-accent" onClick={() => { onOpenNovel(); onClose(); }}>
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
              <div key={n.title} className="book-card" style={{ gap: 12 }}>
                <div className="book-cover" style={{ width: 40, height: 52, fontSize: 16 }}>📖</div>
                <div style={{ flex: 1 }}>
                  <div className="book-title" style={{ fontSize: 14 }}>{n.title}</div>
                  <div className="book-meta">{n.genre} · {n.chapters} 章 · {n.words} 字</div>
                  <button className="inspect-action-btn" onClick={() => onToast("切换到：" + n.title)}>
                    打开
                  </button>
                </div>
              </div>
            ))}
            <button className="inspect-action-btn" style={{ marginTop: 8 }}
              onClick={() => onToast("新建作品功能开发中")}>
              + 新建作品
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
