import type { Novel, Chapter } from "../types.ts";

interface Props {
  novel: Novel;
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: (volumeId: string) => void;
}

const STATUS_LABEL: Record<Chapter["status"], string> = {
  done: "完", writing: "写", draft: "草", outline: "纲",
};
const STATUS_CLS: Record<Chapter["status"], string> = {
  done: "done", writing: "writing", draft: "draft", outline: "",
};

export function ChapterList({ novel, currentId, onSelect, onCreate }: Props) {
  const volumes = [...novel.volumes].sort((a, b) => a.order - b.order);
  return (
    <aside className="left">
      <div className="left-head">
        <h2>章节目录</h2>
        <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{novel.chapters.length} 章</span>
      </div>
      <div className="left-body">
        {volumes.map((vol) => {
          const chapters = novel.chapters
            .filter((c) => c.volumeId === vol.id)
            .sort((a, b) => a.num - b.num);
          return (
            <div className="vol" key={vol.id}>
              <div className="vol-head">{vol.title}</div>
              {chapters.map((c) => (
                <button key={c.id}
                  className={"chapter" + (c.id === currentId ? " current" : "")}
                  onClick={() => onSelect(c.id)}>
                  <span className="ch-num">{String(c.num).padStart(2, "0")}</span>
                  <span className="ch-name">{c.title || "（待命名）"}</span>
                  {STATUS_LABEL[c.status] && (
                    <span className={"ch-tag " + STATUS_CLS[c.status]}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  )}
                </button>
              ))}
              <button className="chapter-add" onClick={() => onCreate(vol.id)}>
                + 新章节
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
