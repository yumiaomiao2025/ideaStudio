import type { ViewMode } from "../types.ts";

interface Props {
  novelTitle: string;
  chapterLabel: string;
  saveState: string;
  view: ViewMode;
  theme: "light" | "dark";
  todoCount: number;
  onViewChange: (v: ViewMode) => void;
  onThemeToggle: () => void;
  onOpenSettings: () => void;
  onOpenInspect: () => void;
  onOpenHealth: () => void;
  onOpenHistory: () => void;
  onOpenPublish: () => void;
  onOpenAnalytics: () => void;
  onOpenBookshelf: () => void;
  onOpenTodos: () => void;
}

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "write", label: "✍ 写作" },
  { key: "kanban", label: "⊞ 看板" },
  { key: "timeline", label: "⌖ 时间线" },
];

export function Topbar({
  novelTitle, chapterLabel, saveState,
  view, theme, todoCount,
  onViewChange, onThemeToggle, onOpenSettings,
  onOpenInspect, onOpenHealth, onOpenHistory,
  onOpenPublish, onOpenAnalytics, onOpenBookshelf, onOpenTodos,
}: Props) {
  return (
    <div className="topbar">
      <button className="brand" onClick={onOpenBookshelf}>
        <span className="brand-dot" />
        网文studio
      </button>
      <span className="crumbs">·&nbsp;<b>《{novelTitle}》</b>&nbsp;/ {chapterLabel}</span>

      <div className="view-tabs">
        {VIEWS.map((v) => (
          <button key={v.key}
            className={"view-tab" + (view === v.key ? " active" : "")}
            onClick={() => onViewChange(v.key)}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="topbar-right">
        <span className="save-state">{saveState}</span>
        <button className="topbar-btn" onClick={onOpenInspect} title="AI 巡检">⚐ 巡检</button>
        <button className="topbar-btn" onClick={onOpenHealth} title="全书健康度">♥ 健康</button>
        <button className="topbar-btn" onClick={onOpenHistory} title="修订历史">⏱ 历史</button>
        <button className="topbar-btn" onClick={onOpenTodos} title="待办清单">☑ 待办{todoCount > 0 ? ` (${todoCount})` : ""}</button>
        <button className="topbar-btn accent" onClick={onOpenPublish}>🪶 发布</button>
        <button className="topbar-btn" onClick={onOpenAnalytics}>📈 数据</button>
        <button className="topbar-btn" onClick={onThemeToggle}>{theme === "dark" ? "☀" : "☾"}</button>
        <button className="topbar-btn" onClick={onOpenSettings}>⚙ 设置</button>
      </div>
    </div>
  );
}
