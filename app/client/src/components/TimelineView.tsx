import type { Novel } from "../types.ts";

interface Props {
  novel: Novel;
}

export function TimelineView({ novel }: Props) {
  const W = 700, TRACK_H = 24, GAP = 10;
  const chapters = [...novel.chapters].sort((a, b) => a.num - b.num);
  const maxNum = Math.max(...chapters.map((c) => c.num), 60);
  const xOf = (num: number) => (num / maxNum) * W;

  // Character tracks (simplified)
  const tracks = [
    { name: "沈砚", color: "var(--accent)", start: 1, end: maxNum, break: null as number | null },
    { name: "卫衍", color: "var(--ink-3)", start: 1, end: 29, break: 29 },
    { name: "季元", color: "var(--warm)", start: 38, end: maxNum, break: null },
    { name: "白如霜", color: "var(--green)", start: 43, end: maxNum, break: null },
  ];

  // Foreshadow arcs
  const fores = novel.terms.filter((t) => t.isForeshadow && t.plantedChapter && t.recoverChapter);

  const totalH = tracks.length * (TRACK_H + GAP) + 20;
  const tensionH = 50;

  // Tension curve for full story
  const tensionPoints = [10, 25, 40, 30, 55, 35, 70, 55, 80, 65, 85, 60, 90, 72, 95];
  const tPoints = tensionPoints.map((v, i) => {
    const x = (i / (tensionPoints.length - 1)) * W;
    const y = tensionH - (v / 100) * tensionH;
    return `${x},${y}`;
  }).join(" ");

  // Volume separators
  const volSeps = novel.volumes.map((vol) => {
    const vols = [...novel.volumes].sort((a, b) => a.order - b.order);
    const idx = vols.findIndex((v) => v.id === vol.id);
    if (idx === 0) return null;
    const firstCh = chapters.filter((c) => c.volumeId === vol.id).sort((a, b) => a.num - b.num)[0];
    if (!firstCh) return null;
    return { x: xOf(firstCh.num), label: vol.title };
  }).filter(Boolean) as { x: number; label: string }[];

  const currentCh = chapters.find((c) => c.status === "writing");
  const currentX = currentCh ? xOf(currentCh.num) : null;

  return (
    <div className="timeline">
      {/* Character tracks */}
      <div className="timeline-section">
        <h4>人物轨道</h4>
        <svg className="timeline-svg" viewBox={`0 0 ${W} ${totalH}`} height={totalH}>
          {/* Volume separators */}
          {volSeps.map((sep) => (
            <g key={sep.x}>
              <line x1={sep.x} y1={0} x2={sep.x} y2={totalH}
                stroke="var(--line-2)" strokeWidth="1" strokeDasharray="4,3" />
              <text x={sep.x + 4} y={12} fill="var(--ink-4)" fontSize="9">{sep.label.split("·")[0]}</text>
            </g>
          ))}

          {/* Current chapter */}
          {currentX !== null && (
            <line x1={currentX} y1={0} x2={currentX} y2={totalH}
              stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" />
          )}

          {/* Character tracks */}
          {tracks.map((t, i) => {
            const y = i * (TRACK_H + GAP) + 20;
            const x1 = xOf(t.start);
            const x2 = xOf(t.break || t.end);
            const isMain = i === 0;
            return (
              <g key={t.name}>
                <text x={0} y={y + TRACK_H / 2 + 4} fill="var(--ink-3)" fontSize="10">{t.name}</text>
                <rect x={x1 + 30} y={y} width={Math.max(0, x2 - x1 - 30)} height={TRACK_H}
                  rx={TRACK_H / 2} fill={t.color} opacity={isMain ? 0.85 : 0.5} />
                {t.break && (
                  <>
                    <circle cx={xOf(t.break)} cy={y + TRACK_H / 2} r={5}
                      fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
                    <text x={xOf(t.break) + 6} y={y + TRACK_H / 2 + 4} fill="var(--ink-3)" fontSize="9">亡</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Foreshadow arcs */}
      <div className="timeline-section">
        <h4>伏笔弧</h4>
        <svg className="timeline-svg" viewBox={`0 0 ${W} 60`} height={60}>
          {fores.map((t, i) => {
            const x1 = xOf(t.plantedChapter!);
            const x2 = xOf(t.recoverChapter!);
            const y = 20 + i * 18;
            const color = t.status === "near" ? "var(--warm)" : t.status === "collected" ? "var(--green)" : "var(--accent)";
            const dash = t.status === "planted" ? "4,3" : "none";
            return (
              <g key={t.id}>
                <line x1={x1} y1={y} x2={x2} y2={y} stroke={color}
                  strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" />
                <circle cx={x1} cy={y} r={4} fill={color} />
                <circle cx={x2} cy={y} r={4} fill={color} opacity={0.5} />
                <text x={x1 + 4} y={y - 5} fill={color} fontSize="9">{t.name}</text>
              </g>
            );
          })}
          {fores.length === 0 && (
            <text x={W / 2} y={35} fill="var(--ink-4)" fontSize="12" textAnchor="middle">暂无伏笔数据</text>
          )}
        </svg>
      </div>

      {/* Tension curve */}
      <div className="timeline-section">
        <h4>全本张力曲线</h4>
        <svg className="timeline-svg" viewBox={`0 0 ${W} ${tensionH}`} height={tensionH}>
          <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={tPoints} />
          {currentX !== null && (
            <>
              <line x1={currentX} y1={0} x2={currentX} y2={tensionH}
                stroke="var(--accent)" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
              <text x={currentX + 3} y={10} fill="var(--accent)" fontSize="9">当前</text>
            </>
          )}
        </svg>
      </div>

      {/* Chapter axis */}
      <div className="timeline-section">
        <h4>章节轴</h4>
        <svg className="timeline-svg" viewBox={`0 0 ${W} 30`} height={30}>
          <line x1={0} y1={15} x2={W} y2={15} stroke="var(--line-2)" strokeWidth="1" />
          {chapters.map((ch) => {
            const x = xOf(ch.num);
            const isCurrent = ch.status === "writing";
            return (
              <g key={ch.id}>
                <circle cx={x} cy={15} r={isCurrent ? 5 : 3}
                  fill={isCurrent ? "var(--accent)" : "var(--line-2)"}
                  stroke={isCurrent ? "var(--surface)" : "none"} strokeWidth="1.5" />
                {(ch.num % 10 === 0 || isCurrent) && (
                  <text x={x} y={28} textAnchor="middle" fill="var(--ink-4)" fontSize="9">
                    {ch.num}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
