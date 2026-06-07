import type { Novel } from "../../types.ts";

interface Props {
  novel: Novel;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function HealthOverlay({ novel, onClose, onToast }: Props) {
  const score = 78;
  const weekDelta = 4;

  // SVG gauge
  const R = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * R;
  const pct = score / 100;
  const dashArr = circ * pct;

  const cards = [
    {
      title: "📝 进度",
      stats: [
        { label: "总字数", value: novel.chapters.reduce((s, c) => s + c.body.length, 0).toLocaleString() + " 字" },
        { label: "已完成章节", value: novel.chapters.filter((c) => c.status === "done").length + " 章" },
        { label: "日均码字", value: "2,340 字" },
        { label: "预计完稿", value: "约 60 章" },
      ],
    },
    {
      title: "📐 结构",
      stats: [
        { label: "张力曲线", value: "良好" },
        { label: "卷长方差", value: "低（稳定）" },
        { label: "高潮预测", value: "第 60 章" },
        { label: "节奏问题", value: "2 处" },
      ],
    },
    {
      title: "🔗 一致性",
      stats: [
        { label: "待修角色问题", value: "2 个" },
        { label: "伏笔回收率", value: "0 / 2" },
        { label: "伏笔老化风险", value: "0 条" },
        { label: "命名冲突", value: "1 处" },
      ],
    },
    {
      title: "🎨 风格",
      stats: [
        { label: "风格匹配度", value: "82%" },
        { label: "AI 味检测", value: "低" },
        { label: "起点兼容", value: "✓" },
        { label: "番茄兼容", value: "⚠ 待修 2 处" },
      ],
    },
  ];

  const actions = [
    { text: "修复「沈砚酒量」前后矛盾", score: "+5", detail: "在第22章与31章之间加入成长触发事件" },
    { text: "补写下一章喘息场景", score: "+3", detail: "连续5章高密度对话后，节奏需放缓" },
    { text: "登记铜牌伏笔回收计划", score: "+2", detail: "第60章回收时机已近，需明确路径" },
  ];

  return (
    <div className="overlay-backdrop center-overlay" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">♥ 全书健康度</h2>
          <div style={{ marginLeft: 16, fontSize: 13, color: "var(--ink-3)" }}>
            本周 <span style={{ color: "var(--green)", fontWeight: 600 }}>+{weekDelta}</span> 分
          </div>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          {/* Gauge */}
          <div className="health-gauge">
            <svg width={180} height={180} viewBox="0 0 180 180">
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--line-2)" strokeWidth="10" />
              <circle
                cx={cx} cy={cy} r={R} fill="none"
                stroke={score >= 80 ? "var(--green)" : score >= 60 ? "var(--warm)" : "var(--accent)"}
                strokeWidth="10"
                strokeDasharray={`${dashArr} ${circ}`}
                strokeDashoffset={circ * 0.25}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--ink)" fontSize="30" fontWeight="700"
                fontFamily="JetBrains Mono, monospace">
                {score}
              </text>
              <text x={cx} y={cy + 18} textAnchor="middle" fill="var(--ink-3)" fontSize="12">/ 100</text>
              <text x={cx} y={cy + 36} textAnchor="middle" fill="var(--ink-4)" fontSize="11">
                {novel.title}
              </text>
            </svg>
          </div>

          {/* 4-quadrant grid */}
          <div className="health-grid">
            {cards.map((card) => (
              <div key={card.title} className="health-card">
                <div className="health-card-title">{card.title}</div>
                {card.stats.map((s) => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="health-actions">
            <h5 style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>本周 3 个可执行动作</h5>
            {actions.map((a) => (
              <div key={a.text} className="health-action">
                <div className="health-action-text">
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{a.text}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{a.detail}</div>
                </div>
                <span className="health-action-score">{a.score}</span>
                <button className="inspect-action-btn" style={{ marginLeft: 8 }}
                  onClick={() => onToast("已加入待办：" + a.text)}>
                  加入
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
