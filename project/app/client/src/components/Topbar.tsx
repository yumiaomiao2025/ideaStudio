interface Props {
  novelTitle: string;
  chapterLabel: string;
  saveState: string;
  onOpenSettings: () => void;
}

export function Topbar({ novelTitle, chapterLabel, saveState, onOpenSettings }: Props) {
  return (
    <div className="topbar">
      <span className="brand"><span className="brand-dot" />网文studio</span>
      <span className="crumbs">· <b>《{novelTitle}》</b> / {chapterLabel}</span>
      <div className="topbar-right">
        <span className="save-state">{saveState}</span>
        <button className="ck-cta" onClick={onOpenSettings}>⚙ 设置</button>
      </div>
    </div>
  );
}
