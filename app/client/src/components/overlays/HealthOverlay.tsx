import { useEffect, useState } from "react";
import type { Novel, HealthReport } from "../../types.ts";
import { fetchHealth } from "../../api.ts";

interface Props {
  novel: Novel;
  onClose: () => void;
  onToast: (msg: string) => void;
  onAddTodo: (text: string, detail: string, source: string) => void;
}

export function HealthOverlay({ novel, onClose, onToast, onAddTodo }: Props) {
  const [report, setReport] = useState<HealthReport | null>(null);

  useEffect(() => {
    fetchHealth(novel.id).then(setReport).catch(() => onToast("健康度加载失败"));
  }, [novel.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const score = report?.score ?? 0;
  const cards = report?.cards ?? [];
  const actions = report?.actions ?? [];

  // SVG gauge
  const R = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * R;
  const pct = score / 100;
  const dashArr = circ * pct;

  if (!report) {
    return (
      <div className="overlay-backdrop center-overlay" onClick={onClose}>
        <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
          <div className="overlay-head">
            <h2 className="overlay-title">♥ 全书健康度</h2>
            <button className="overlay-close" onClick={onClose}>×</button>
          </div>
          <div className="overlay-body" style={{ color: "var(--ink-3)" }}>计算中…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay-backdrop center-overlay" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">♥ 全书健康度</h2>
          <div style={{ marginLeft: 16, fontSize: 13, color: "var(--ink-3)" }}>
            高 {report.highCount} · 中 {report.mediumCount} · 低 {report.lowCount}
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
            <h5 style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>{actions.length} 个可执行动作</h5>
            {actions.length === 0 && <div style={{ color: "var(--ink-3)", fontSize: 13 }}>暂无待办，状态良好</div>}
            {actions.map((a) => (
              <div key={a.text} className="health-action">
                <div className="health-action-text">
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{a.text}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{a.detail}</div>
                </div>
                <span className="health-action-score">{a.score}</span>
                <button className="inspect-action-btn" style={{ marginLeft: 8 }}
                  onClick={() => onAddTodo(a.text, a.detail, "健康看板")}>
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
