import type { Novel } from "../types.ts";

interface Props {
  novel: Novel;
}

/** 右侧上下文 / 设定面板：展示喂给 AI 的设定与风格。 */
export function ContextPanel({ novel }: Props) {
  return (
    <aside className="right">
      <div className="right-head">
        <h3>AI 上下文</h3>
        <span className="right-sub">这就是 AI 看到的</span>
      </div>
      <div className="right-body">
        <section className="panel-section">
          <h5>风格记忆</h5>
          <div className="style-card">
            {novel.styleNotes.map((s, i) => (
              <div key={i} className="style-line">· {s}</div>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <h5>设定库 · {novel.terms.length}</h5>
          {novel.terms.map((t) => (
            <div key={t.id} className={"term-card" + (t.isForeshadow ? " fore" : "")}>
              <div className="term-head">
                <span className="term-name">{t.name}</span>
                <span className="term-kind">{t.kind}</span>
              </div>
              <p className="term-body">{t.body}</p>
              {t.meta && <div className="term-meta">{t.meta}</div>}
            </div>
          ))}
        </section>
      </div>
    </aside>
  );
}
