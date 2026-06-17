import type { Novel, TodoItem } from "../../types.ts";

interface Props {
  novel: Novel;
  onClose: () => void;
  onToggle: (todoId: string) => void;
  onRemove: (todoId: string) => void;
}

export function TodoOverlay({ novel, onClose, onToggle, onRemove }: Props) {
  const todos = [...(novel.todos ?? [])].sort((a, b) => b.createdAt - a.createdAt);
  const openCount = todos.filter((t) => !t.done).length;

  return (
    <div className="overlay-backdrop center-overlay" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">☑ 待办清单</h2>
          <span style={{ fontSize: 13, color: "var(--ink-3)", marginLeft: 12 }}>{openCount} 项未完成</span>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          {todos.length === 0 && (
            <div style={{ color: "var(--ink-3)", fontSize: 13, padding: "20px 0" }}>
              暂无待办，在巡检、健康度或读者数据面板中点击「加入」即可记录到这里
            </div>
          )}
          {todos.map((t: TodoItem) => (
            <div key={t.id} className="health-action">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => onToggle(t.id)}
                style={{ width: 16, height: 16 }}
              />
              <div className="health-action-text">
                <div style={{
                  fontWeight: 500, fontSize: 13,
                  textDecoration: t.done ? "line-through" : "none",
                  color: t.done ? "var(--ink-4)" : "var(--ink)",
                }}>
                  {t.text}
                </div>
                {t.detail && (
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{t.detail}</div>
                )}
                <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 2 }}>来自 · {t.source}</div>
              </div>
              <button className="inspect-action-btn" onClick={() => onRemove(t.id)}>删除</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
