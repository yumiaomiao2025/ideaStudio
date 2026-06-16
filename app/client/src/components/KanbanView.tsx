import type { Novel, Chapter } from "../types.ts";
import { computeTensionCurve, computeDialogueRatio } from "../derive.ts";

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

  const curve = computeTensionCurve(novel.chapters);
  const W = 600, H = 60;
  const points = curve.map((p, i) => {
    const x = curve.length > 1 ? (i / (curve.length - 1)) * W : 0;
    const y = H - (p.value / 100) * H;
    return `${x},${y}`;
  }).join(" ");

  const currentChapter = novel.chapters.find((c) => c.id === currentId);
  const currentIdx = currentChapter ? curve.findIndex((p) => p.num === currentChapter.num) : -1;
  const currentX = currentIdx >= 0 && curve.length > 1 ? (currentIdx / (curve.length - 1)) * W : null;

  let climaxIdx = -1;
  curve.forEach((p, i) => { if (climaxIdx === -1 || p.value > curve[climaxIdx].value) climaxIdx = i; });
  const climaxX = climaxIdx >= 0 && curve.length > 1 ? (climaxIdx / (curve.length - 1)) * W : null;

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
          {currentX !== null && curve[currentIdx] && (
            <>
              <line x1={currentX} y1="0" x2={currentX} y2={H}
                stroke="var(--accent)" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
              <circle cx={currentX} cy={H - (curve[currentIdx].value / 100) * H} r="4" fill="var(--accent)" />
              <text x={currentX + 4} y={H - (curve[currentIdx].value / 100) * H - 4} fill="var(--accent)" fontSize="10">当前</text>
            </>
          )}
          {/* Climax */}
          {climaxX !== null && curve[climaxIdx] && (
            <>
              <circle cx={climaxX} cy={H - (curve[climaxIdx].value / 100) * H} r="5" fill="none" stroke="var(--warm)" strokeWidth="1.5" strokeDasharray="3,2" />
              <text x={climaxX + 6} y={H - (curve[climaxIdx].value / 100) * H + 4} fill="var(--warm)" fontSize="10">峰值</text>
            </>
          )}
        </svg>
      </div>

      {/* Kanban columns */}
      <div className="kanban-cols">
        {volumes.map((vol) => {
          const chapters = novel.chapters
            .filter((c) => c.volumeId === vol.id)
            .sort((a, b) => a.num - b.num);
          const isDone = chapters.length > 0 && chapters.every((c) => c.status === "done");
          const isCurrent = chapters.some((c) => c.id === currentId);
          const dialogueRatio = computeDialogueRatio(chapters);

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
              {isCurrent && dialogueRatio > 0.5 && (
                <div className="kanban-ai-hint">
                  ✦ AI 节奏建议：当前卷对话占比偏高（{Math.round(dialogueRatio * 100)}%），建议下一章加入独处场景降节奏
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
