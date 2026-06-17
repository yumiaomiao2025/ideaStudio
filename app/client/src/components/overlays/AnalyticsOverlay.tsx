import type { Novel } from "../../types.ts";

interface Props {
  novel: Novel;
  onClose: () => void;
  onToast: (msg: string) => void;
  onAddTodo: (text: string, detail: string, source: string) => void;
}

export function AnalyticsOverlay({ novel, onClose, onAddTodo }: Props) {
  const kpis = [
    { label: "追读", value: "1,284", trend: "+12", up: true },
    { label: "收藏", value: "4,721", trend: "+38", up: true },
    { label: "推荐", value: "8,930", trend: "+205", up: true },
    { label: "评论", value: "218", trend: "+7", up: true },
    { label: "完读率", value: "68%", trend: "-2%", up: false },
  ];

  const comments = [
    { label: "铜牌伏笔期待", count: 86, sample: "「铜牌到底怎么回事啊！！速更！」" },
    { label: "沈砚酒量矛盾", count: 24, sample: "「第22章说不喝酒，第31章怎么连喝三盏……」" },
    { label: "节奏太慢", count: 18, sample: "「最近几章都是对话，什么时候有行动？」" },
    { label: "白如霜何时出场", count: 33, sample: "「白如霜预告了这么久，第43章终于来了！」" },
  ];

  // Retention funnel
  const funnel = [
    { label: "看到简介", pct: 100 },
    { label: "开始阅读", pct: 72 },
    { label: "读到第5章", pct: 54 },
    { label: "读到第20章", pct: 38 },
    { label: "加入收藏", pct: 22 },
  ];

  // Readthrough curve
  const W = 500, H = 80;
  const curveData = [95, 88, 78, 70, 82, 65, 50, 72, 68, 55, 60, 58, 72, 68, 63];
  const points = curveData.map((v, i) => {
    const x = (i / (curveData.length - 1)) * W;
    const y = H - (v / 100) * H;
    return `${x},${y}`;
  }).join(" ");
  // Chapter 23 dip (index ~5)
  const dipX = (5 / (curveData.length - 1)) * W;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">📈 读者数据</h2>
          <span style={{ fontSize: 13, color: "var(--ink-3)", marginLeft: 12 }}>{novel.title}</span>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          {/* KPIs */}
          <div className="analytics-kpis">
            {kpis.map((k) => (
              <div key={k.label} className="kpi-card">
                <div className="kpi-val">{k.value}</div>
                <div className="kpi-label">{k.label}</div>
                <div className={"kpi-trend " + (k.up ? "up" : "down")}>{k.up ? "↑" : "↓"} {k.trend}</div>
              </div>
            ))}
          </div>

          {/* Readthrough curve */}
          <div className="analytics-chart">
            <h5>追读曲线（按章）</h5>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} height={H} style={{ display: "block" }}>
              <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={points} />
              {/* Chapter 23 anomaly */}
              <line x1={dipX} y1={0} x2={dipX} y2={H} stroke="var(--warm)" strokeWidth="1" strokeDasharray="3,2" />
              <circle cx={dipX} cy={H - (50/100) * H} r={5} fill="var(--warm)" />
              <text x={dipX + 6} y={H - (50/100) * H + 4} fill="var(--warm)" fontSize="9">第23章流失</text>
            </svg>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
              ✦ AI 建议：第23章追读下降 15%，建议章末补 200 字小高潮以提升钩子感
              <button className="inspect-action-btn" style={{ marginLeft: 8 }}
                onClick={() => onAddTodo("第23章补 200 字小高潮", "追读曲线在第23章下降 15%", "读者数据")}>
                加入计划
              </button>
            </div>
          </div>

          {/* Retention funnel */}
          <div className="analytics-chart">
            <h5>留存漏斗</h5>
            {funnel.map((step) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 80, fontSize: 12, color: "var(--ink-3)" }}>{step.label}</span>
                <div style={{ flex: 1, height: 16, background: "var(--paper-2)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${step.pct}%`, height: "100%", background: "var(--accent)", opacity: 0.7, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--ink-3)", width: 36, textAlign: "right" }}>{step.pct}%</span>
              </div>
            ))}
          </div>

          {/* Comment clusters */}
          <div className="panel-section">
            <h5>评论 AI 聚类 · {comments.reduce((s, c) => s + c.count, 0)} 条</h5>
            {comments.map((c) => (
              <div key={c.label} className="comment-cluster">
                <div className="cluster-head">
                  <span className="cluster-label">{c.label}</span>
                  <span className="cluster-count">+{c.count}</span>
                </div>
                <div className="cluster-sample">{c.sample}</div>
                <div className="cluster-action">
                  <button className="inspect-action-btn"
                    onClick={() => onAddTodo("评论聚类：" + c.label, c.sample, "读者数据")}>
                    加入伏笔规划
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
