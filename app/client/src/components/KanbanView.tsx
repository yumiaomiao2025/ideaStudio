import type { Novel, Chapter } from "../types.ts";

interface Props {
  novel: Novel;
  currentId: string;
  onSelect: (id: string) => void;
}

const STATUS_LABEL: Record<Chapter["status"], string> = {
  done: "已完成", writing: "进行中", draft: "AI 草稿", outline: "已大纲",
};
const STATUS_CLS: Record<Chapter["status"], string> = {
  done: "done", writing: "writing", draft: "draft", outline: "outline",
};

export function KanbanView({ novel, currentId, onSelect }: Props) {
  const volumes = [...novel.volumes].sort((a, b) => a.order - b.order);

  // Simple tension curve data (mock)
  const tensionPoints = [20, 35, 45, 30, 55, 40, 65, 50, 80, 70, 85, 60, 90, 75, 95];
  const W = 600, H = 60;
  const points = tensionPoints.map((v, i) => {
    const x = (i / (tensionPoints.length - 1)) * W;
    const y = H - (v / 100) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="kanban">
      {/* Tension curve */}
      <div className="kanban-tension">
        <h4>全本张力曲线</h4>
        <svg className="tension-svg" viewBox={`0 0 ${W} ${H}`} height={H}>
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            points={points}
          />
          {/* Current chapter marker */}
          <line x1="300" y1="0" x2="300" y2={H}
            stroke="var(--accent)" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          <circle cx="300" cy={H - (70 / 100) * H} r="4" fill="var(--accent)" />
          <text x="304" y={H - (70 / 100) * H - 4} fill="var(--accent)" fontSize="10">当前</text>
          {/* Climax prediction */}
          <circle cx={W * 0.75} cy={H - (95 / 100) * H} r="5" fill="none" stroke="var(--warm)" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x={W * 0.75 + 6} y={H - (95 / 100) * H + 4} fill="var(--warm)" fontSize="10">高潮预测</text>
        </svg>
      </div>

      {/* Kanban columns */}
      <div className="kanban-cols">
        {volumes.map((vol) => {
          const chapters = novel.chapters
            .filter((c) => c.volumeId === vol.id)
            .sort((a, b) => a.num - b.num);
          const isDone = vol.order === 1;
          const isCurrent = vol.order === 2;

          return (
            <div key={vol.id} className="kanban-col">
              <div className="kanban-col-head" style={{ opacity: isDone ? 0.6 : 1 }}>
                {vol.title}
                <span className="col-count">·{chapters.length}</span>
              </div>
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className={
                    "kanban-card" +
                    (ch.id === currentId ? " current" : "") +
                    (ch.status === "outline" ? " outline" : "")
                  }
                  onClick={() => { if (ch.status !== "outline") onSelect(ch.id); }}
                >
                  <div className="kanban-card-num">第 {ch.num} 章</div>
                  <div className="kanban-card-title">{ch.title || "（待命名）"}</div>
                  <span className={"kanban-status " + STATUS_CLS[ch.status]}>
                    {STATUS_LABEL[ch.status]}
                  </span>
                </div>
              ))}
              {isCurrent && (
                <div className="kanban-ai-hint">
                  ✦ AI 节奏建议：当前卷对话占比偏高（41%），建议下一章加入独处场景降节奏
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
