import { useState } from "react";
import type { Novel, Term, RightTab } from "../types.ts";
import { upsertTerm, deleteTerm } from "../api.ts";

interface Props {
  novel: Novel;
  tab: RightTab;
  onTabChange: (t: RightTab) => void;
  onNovelUpdate: (n: Novel) => void;
  onToast: (msg: string) => void;
  onCharacterClick: (id: string) => void;
}

const TABS: { key: RightTab; label: string }[] = [
  { key: "context", label: "✦ 上下文" },
  { key: "characters", label: "人 人物" },
  { key: "terms", label: "☱ 设定" },
  { key: "foreshadow", label: "⚐ 伏笔" },
  { key: "style", label: "✎ 风格" },
  { key: "compliance", label: "⚖ 合规" },
];

export function RightPanel({ novel, tab, onTabChange, onNovelUpdate, onToast, onCharacterClick }: Props) {
  return (
    <aside className="right">
      <div className="right-tabs">
        {TABS.map((t) => (
          <button key={t.key}
            className={"right-tab" + (tab === t.key ? " active" : "")}
            onClick={() => onTabChange(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="right-body">
        {tab === "context" && <ContextTab novel={novel} />}
        {tab === "characters" && <CharactersTab novel={novel} onCharacterClick={onCharacterClick} />}
        {tab === "terms" && <TermsTab novel={novel} onNovelUpdate={onNovelUpdate} onToast={onToast} />}
        {tab === "foreshadow" && <ForeshadowTab novel={novel} />}
        {tab === "style" && <StyleTab novel={novel} />}
        {tab === "compliance" && <ComplianceTab novel={novel} onToast={onToast} />}
      </div>
    </aside>
  );
}

/* ---- Context Tab ---- */
function ContextTab({ novel }: { novel: Novel }) {
  const bars = [
    { label: "正文", pct: 55, color: "var(--accent)" },
    { label: "人物", pct: 20, color: "var(--warm)" },
    { label: "设定", pct: 15, color: "var(--blue)" },
    { label: "风格", pct: 10, color: "var(--green)" },
  ];
  return (
    <div>
      <div className="panel-section">
        <h5>AI 上下文用量</h5>
        {bars.map((b) => (
          <div key={b.label} className="ctx-bar-wrap">
            <div className="ctx-bar-label"><span>{b.label}</span><span>{b.pct}%</span></div>
            <div className="ctx-bar"><div className="ctx-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} /></div>
          </div>
        ))}
      </div>
      <div className="panel-section">
        <h5>风格记忆</h5>
        <div className="panel-card">
          {novel.styleNotes.map((s, i) => (
            <div key={i} style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--ink-2)", fontFamily: "Noto Serif SC, serif" }}>· {s}</div>
          ))}
        </div>
      </div>
      <div className="panel-section">
        <h5>已注入设定 · {novel.terms.length}</h5>
        {novel.terms.slice(0, 3).map((t) => (
          <div key={t.id} className="panel-card" style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "Noto Serif SC, serif" }}>{t.name}</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{t.kind}</span>
            </div>
          </div>
        ))}
        {novel.terms.length > 3 && (
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", padding: "4px 0" }}>+{novel.terms.length - 3} 条已注入</div>
        )}
      </div>
    </div>
  );
}

/* ---- Characters Tab ---- */
function CharactersTab({ novel, onCharacterClick }: { novel: Novel; onCharacterClick: (id: string) => void }) {
  const maxAppearances = Math.max(...novel.characters.map((c) => c.appearances), 1);
  return (
    <div>
      <div className="panel-section">
        <h5>人物列表 · {novel.characters.length}</h5>
        {novel.characters.map((ch) => (
          <div key={ch.id} className="char-item" style={{ cursor: "pointer" }} onClick={() => onCharacterClick(ch.id)}>
            <div className="char-avatar">
              {ch.name.slice(0, 1)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="char-name">{ch.name}</div>
              <div className="char-role">{ch.role} · 第 {ch.firstChapter} 章出场</div>
              <div className="char-bar">
                <div className="char-bar-fill" style={{ width: `${Math.round((ch.appearances / maxAppearances) * 100)}%` }} />
              </div>
              <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 2 }}>出场 {ch.appearances} 章</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Terms Tab ---- */
function TermsTab({ novel, onNovelUpdate, onToast }: { novel: Novel; onNovelUpdate: (n: Novel) => void; onToast: (msg: string) => void }) {
  const [editing, setEditing] = useState<Term | null>(null);
  const [creating, setCreating] = useState(false);

  const newTerm = (): Term => ({
    id: "t" + Date.now().toString(36),
    name: "", kind: "人物", body: "",
  });

  async function save(term: Term) {
    try {
      const saved = await upsertTerm(novel.id, term);
      const terms = novel.terms.some((t) => t.id === saved.id)
        ? novel.terms.map((t) => (t.id === saved.id ? saved : t))
        : [...novel.terms, saved];
      onNovelUpdate({ ...novel, terms });
      setEditing(null);
      setCreating(false);
      onToast("设定已保存");
    } catch { onToast("保存失败"); }
  }

  async function remove(id: string) {
    try {
      await deleteTerm(novel.id, id);
      onNovelUpdate({ ...novel, terms: novel.terms.filter((t) => t.id !== id) });
      onToast("设定已删除");
    } catch { onToast("删除失败"); }
  }

  if (editing || creating) {
    const t = editing || newTerm();
    return <TermEditor term={t} onSave={save} onCancel={() => { setEditing(null); setCreating(false); }} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="term-btn" onClick={() => setCreating(true)}>+ 新建设定</button>
      </div>
      {novel.terms.map((t) => (
        <div key={t.id} className={"term-card" + (t.status === "near" ? " near" : t.isForeshadow ? " fore" : "")}>
          <div className="term-head">
            <span className="term-name">{t.name}</span>
            <span className="term-kind">{t.kind}</span>
            {t.isForeshadow && <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: "auto" }}>⚐ 伏笔</span>}
          </div>
          <p className="term-body">{t.body}</p>
          {t.meta && <div className="term-meta">{t.meta}</div>}
          <div className="term-actions">
            <button className="term-btn" onClick={() => setEditing(t)}>编辑</button>
            <button className="term-btn danger" onClick={() => remove(t.id)}>删除</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TermEditor({ term, onSave, onCancel }: { term: Term; onSave: (t: Term) => void; onCancel: () => void }) {
  const [t, setT] = useState<Term>(term);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{t.id.startsWith("t") && t.name === "" ? "新建设定" : "编辑设定"}</span>
        <button className="term-btn" style={{ marginLeft: "auto" }} onClick={onCancel}>取消</button>
      </div>
      <label className="field"><span>名称</span><input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} /></label>
      <label className="field"><span>类型</span><input value={t.kind} onChange={(e) => setT({ ...t, kind: e.target.value })} /></label>
      <label className="field"><span>描述</span><textarea value={t.body} onChange={(e) => setT({ ...t, body: e.target.value })} /></label>
      <label className="field"><span>备注</span><input value={t.meta || ""} onChange={(e) => setT({ ...t, meta: e.target.value })} /></label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={!!t.isForeshadow} onChange={(e) => setT({ ...t, isForeshadow: e.target.checked })} />
          标记为伏笔
        </label>
      </div>
      <button className="btn-accent" style={{ width: "100%" }} onClick={() => onSave(t)}>保存</button>
    </div>
  );
}

/* ---- Foreshadow Tab ---- */
function ForeshadowTab({ novel }: { novel: Novel }) {
  const fores = novel.terms.filter((t) => t.isForeshadow);
  const STATUS_LABEL: Record<string, string> = { planted: "已埋", near: "临近", collected: "已收", new: "新埋" };
  const STATUS_COLOR: Record<string, string> = {
    planted: "var(--accent)", near: "var(--warm)", collected: "var(--green)", new: "var(--ink-4)",
  };
  return (
    <div>
      <div className="panel-section">
        <h5>伏笔追踪 · {fores.length}</h5>
        {fores.map((t) => (
          <div key={t.id} className="panel-card" style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", marginTop: 3, flexShrink: 0,
                background: STATUS_COLOR[t.status || "planted"],
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="term-name" style={{ fontSize: 13 }}>{t.name}</span>
                  <span className={"fore-status " + (t.status || "planted")}>{STATUS_LABEL[t.status || "planted"]}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                  {t.plantedChapter && `埋：第 ${t.plantedChapter} 章`}
                  {t.recoverChapter && ` · 收：第 ${t.recoverChapter} 章`}
                </div>
                <p className="term-body" style={{ marginTop: 6 }}>{t.body}</p>
              </div>
            </div>
          </div>
        ))}
        {fores.length === 0 && <div style={{ color: "var(--ink-3)", fontSize: 13 }}>暂无伏笔，可在设定库中标记</div>}
      </div>
    </div>
  );
}

/* ---- Style Tab ---- */
function StyleTab({ novel }: { novel: Novel }) {
  const metrics = [
    { label: "句长", value: 78, target: 70, unit: "字/句" },
    { label: "对话占比", value: 32, target: 35, unit: "%" },
    { label: "比喻密度", value: 45, target: 50, unit: "%" },
    { label: "被动句", value: 12, target: 15, unit: "%" },
  ];
  return (
    <div>
      <div className="panel-section">
        <h5>本章风格指标</h5>
        {metrics.map((m) => {
          const pct = Math.min(100, Math.round((m.value / Math.max(m.target, m.value)) * 100));
          const cls = Math.abs(m.value - m.target) < 10 ? "good" : m.value > m.target ? "warn" : "";
          return (
            <div key={m.label} className="style-metric">
              <span className="style-metric-label">{m.label}</span>
              <div className="style-bar"><div className={"style-bar-fill " + cls} style={{ width: `${pct}%` }} /></div>
              <span style={{ fontSize: 11, color: "var(--ink-3)", width: 36, textAlign: "right" }}>{m.value}{m.unit}</span>
            </div>
          );
        })}
      </div>
      <div className="panel-section">
        <h5>风格记忆</h5>
        <div className="panel-card">
          {novel.styleNotes.map((s, i) => (
            <div key={i} className="style-sample">· {s}</div>
          ))}
        </div>
      </div>
      <div className="panel-section">
        <h5>人物语气样本</h5>
        {novel.characters.slice(0, 2).map((ch) => (
          <div key={ch.id} className="panel-card" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 4 }}>{ch.name}</div>
            <div className="style-sample">
              {ch.name === "沈砚" ? '"嗯。" 他转过身，没再说话。' : '"父亲今夜等的客，比昨日少了两个。"'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Compliance Tab ---- */
const SENSITIVE = [
  { word: "刺杀", replace: "暗杀", platform: "番茄/七猫", level: "high" as const },
  { word: "血", replace: "暗色血迹", platform: "七猫", level: "medium" as const },
  { word: "尸身", replace: "遗体", platform: "番茄", level: "medium" as const },
];

function ComplianceTab({ novel, onToast }: { novel: Novel; onToast: (msg: string) => void }) {
  const platforms = ["起点", "番茄", "七猫", "微读", "晋江"];
  return (
    <div>
      <div className="panel-section">
        <h5>平台适配</h5>
        <div className="publish-platforms" style={{ flexDirection: "column", gap: 6 }}>
          {platforms.map((p) => {
            const hasIssue = p === "番茄" || p === "七猫";
            return (
              <div key={p} className="platform-row">
                <span className={"platform-chip " + (hasIssue ? "warn" : "ok")}>{p}</span>
                <span style={{ fontSize: 12, color: hasIssue ? "var(--warm)" : "var(--green)" }}>
                  {hasIssue ? "⚠ 待修" : "✓ 可发"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="panel-section">
        <h5>命中词 · {SENSITIVE.length}</h5>
        {SENSITIVE.map((s, i) => (
          <div key={i} className={"compliance-item " + s.level}>
            <div className="compliance-orig">
              原文含 <span>「{s.word}」</span> · {s.platform}
            </div>
            <div className="compliance-sug">建议替换为 <strong>「{s.replace}」</strong></div>
            <div className="compliance-actions">
              <button className="compliance-btn primary"
                onClick={() => onToast(`已将「${s.word}」替换为「${s.replace}」`)}>
                一键替换
              </button>
              <button className="compliance-btn"
                onClick={() => onToast(`已跳转到「${s.word}」`)}>
                跳到
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
