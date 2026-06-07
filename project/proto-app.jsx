/* global React, ReactDOM */
/* ============================================================
   Main app for the high-fidelity prototype
   ============================================================ */

const { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle } = React;
const { CHAPTERS, CHAPTER_ORDER, TERMS, GHOSTS, RIGHT_TABS, PALETTE_GROUPS } = window.PROTO_DATA;
const { PanelContext, PanelPeople, PanelFore, PanelStyle, PanelWorld, PanelRule } = window.PROTO_PANELS;
const { KanbanView, TimelineView } = window.PROTO_VIEWS;
const { InspectOverlay, HealthOverlay, HistoryOverlay, SettingsOverlay, PublishOverlay, AnalyticsOverlay, ShelfOverlay, CharacterOverlay } = window.PROTO_OVERLAYS;

/* ============ AI helpers ============= */
const SYSTEM_PROMPT = `你是一位网文小说续写助手。读用户提供的章节正文，按相同的语气、节奏与笔触，给出贴合上下文的续写或改写。

风格约束（来自前 41 章自动学习）：
- 句子偏短，平均 14 字；少用长复句
- 比喻克制，偏冷意象（雪、铁、灯、冻）
- 对话不写"道""说"，少用"突然""忽然"
- 沈砚（主角）：寡言，说"嗯"代替"是"，不主动开口
- 重要伏笔：半枚铜牌（沈砚父亲遗物，反派季元持另一半），灯无人添油

输出要求：
- 只输出续写/改写文本本身
- 不要解释、不要引号、不要列表、不要 markdown
- 不要超过 80 个汉字
- 与前文流畅衔接，第一个字不要换行`;

function stripTerms(text) {
  return text.replace(/\{TERM:([^}]+)\}/g, "$1");
}

function chapterContextText(chapter) {
  return chapter.paragraphs.map(stripTerms).join("\n");
}

async function aiContinue(chapter, { extra = "" } = {}) {
  const ctx = chapterContextText(chapter);
  const userPrompt = `章节标题：第 ${chapter.num} 章 · ${chapter.title}

前文：
${ctx}

请直接续写下文（1-2 句，不超过 80 字）：${extra ? "\n额外要求：" + extra : ""}`;

  try {
    const result = await window.claude.complete({
      messages: [
        { role: "user", content: SYSTEM_PROMPT + "\n\n---\n\n" + userPrompt },
      ],
    });
    // Clean up: trim, drop leading/trailing quotes, single line max
    return (result || "").trim().replace(/^["「『]/, "").replace(/["」』]$/, "").split("\n")[0].slice(0, 120);
  } catch (e) {
    console.warn("AI call failed:", e);
    return null;
  }
}

async function aiCommand(item, chapter) {
  const extras = {
    "⌥W": "在光标处继续推进剧情，可以让节奏稍微紧一点",
    "⌥B": "在两段之间补一个过渡，把节奏放缓 1 拍",
    "⌥D": "把最后一句展开成动作 + 心理 + 环境，但仍是 1-2 句",
    "⌥E": "写一个本章的结尾钩子（悬念或留白），让读者想看下一章",
    "⌥1": "把最后一段换成冷峻、克制的语气重写",
    "⌥3": "在最后一句加入一个具体的五感细节（视觉或听觉）",
    "⌥4": "把最后一段对话改得更紧绷、潜台词更多",
  };
  return aiContinue(chapter, { extra: extras[item.k] || item.t });
}

async function aiNatural(query, chapter) {
  return aiContinue(chapter, { extra: query });
}

async function aiRewrite(selected, instruction) {
  const prompt = `${SYSTEM_PROMPT}

---

下面是《剑入星海》正文中的一段，请按要求改写。只输出改写后的文字本身，不要解释、不要引号、不要 markdown，长度与原文相近。

要求：${instruction}

原文：
${selected}`;
  try {
    const r = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return (r || "").trim().replace(/^["「『]/, "").replace(/["」』]$/, "").split("\n")[0].slice(0, 160);
  } catch (e) {
    return null;
  }
}

const SEL_ACTIONS = [
  { key: "rewrite", label: "改写", instr: "保持原意，换一种更冷峻、克制的说法" },
  { key: "shorten", label: "缩写", instr: "压缩到原来约 70%，更紧凑，删掉可有可无的字" },
  { key: "expand",  label: "扩写", instr: "适当展开，加入 1 个动作或环境细节，但不超过原文的 1.5 倍" },
  { key: "sensory", label: "加细节", instr: "在不改变情节的前提下，加入一个具体的五感细节（视觉或听觉）" },
];

function SelToolbar({ info, onAction, onClose }) {
  if (!info) return null;
  return (
    <div
      className="sel-toolbar"
      style={{ position: "fixed", left: info.left, top: info.top - 8, zIndex: 70 }}
      onMouseDown={e => e.preventDefault()}
    >
      {SEL_ACTIONS.map((a, i) => (
        <button key={a.key} onClick={() => onAction(a)}>{a.label}</button>
      ))}
      <span className="sep" />
      <button onClick={() => onAction({ key: "custom" })}>✦ ⌘K</button>
    </div>
  );
}

// Render a paragraph text that may contain {TERM:xxx} markers.
function renderParagraph(text, onTermClick) {
  if (!text.includes("{TERM:")) return text;
  const parts = [];
  let last = 0;
  const re = /\{TERM:([^}]+)\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const term = m[1];
    const idx = m.index;
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push(
      <span key={idx} className="term" data-term={term} onClick={(e) => onTermClick(e, term)}>{term}</span>
    );
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Topbar({ view, setView, bookTitle, volTitle, chapterTitle, chapterNum, theme, onToggleTheme, onOpenOverlay }) {
  return (
    <div className="topbar">
      <span className="brand" onClick={() => onOpenOverlay("shelf")} style={{ cursor: "pointer" }} title="返回书架"><span className="brand-dot"></span>网文studio</span>
      <span className="crumbs">· <b>《{bookTitle || "剑入星海"}》</b> / {volTitle || "卷二 · 雪夜入城"} / <b>第 {chapterNum || 42} 章 · {chapterTitle || "雪夜城下"}</b></span>

      <div style={{ marginLeft: 24 }}>
        <div className="view-toggle">
          <button className={view === "write" ? "active" : ""} onClick={() => setView("write")}>✎ 写作</button>
          <button className={view === "board" ? "active" : ""} onClick={() => setView("board")}>▦ 看板</button>
          <button className={view === "timeline" ? "active" : ""} onClick={() => setView("timeline")}>☱ 时间线</button>
        </div>
      </div>

      <div className="right">
        <a
          href={encodeURI("网文studio · 新书向导.html")}
          className="ck-cta"
          style={{ textDecoration: "none", color: "var(--ink-2)" }}
          title="开新书"
        >+ 新书</a>
        <button className="ck-cta" onClick={() => onOpenOverlay("inspect")} title="AI 巡检中心" style={{ position: "relative" }}>
          ⚐ 巡检
          <span style={{ position: "absolute", top: -4, right: -4, background: "var(--accent)", color: "#fff", fontSize: 9, borderRadius: 99, minWidth: 14, height: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>16</span>
        </button>
        <button className="ck-cta" onClick={() => onOpenOverlay("analytics")} title="读者数据">📈 数据</button>
        <button className="ck-cta" onClick={() => onOpenOverlay("health")} title="全书健康度">♥ 78</button>
        <button className="ck-cta" onClick={() => onOpenOverlay("publish")} title="发布本章" style={{ background: "var(--accent-soft)", borderColor: "var(--accent-line)", color: "var(--accent)" }}>🪶 发布</button>
        <button
          className="ck-cta"
          onClick={onToggleTheme}
          title={theme === "dark" ? "切到日间" : "切到夜间码字"}
          style={{ minWidth: 34, justifyContent: "center" }}
        >{theme === "dark" ? "☾" : "☀"}</button>
        <span className="save-state">自动保存 · 12 秒前</span>
        <button className="ck-cta" onClick={() => onOpenOverlay("history")} title="修订历史">⏱ 历史</button>
        <button className="ck-cta" onClick={() => onOpenOverlay("settings")} title="AI 设置">⚙</button>
        <button className="ck-cta">✦ <span style={{ marginLeft: 4 }}>AI</span> <kbd style={{ marginLeft: 6 }}>⌘K</kbd></button>
        <div className="avatar">砚</div>
      </div>
    </div>
  );
}

function LeftPane({ collapsed, setCollapsed, currentId, onSelect, onOpenOverlay }) {
  return (
    <aside className={"left" + (collapsed ? " collapsed" : "")}>
      <div className="left-rail">
        <button className="rail-btn" onClick={() => setCollapsed(false)} title="目录">☰</button>
        <button className="rail-btn" title="设定">✦</button>
        <button className="rail-btn" title="大纲">⌗</button>
        <button className="rail-btn" onClick={() => onOpenOverlay("history")} title="修订历史">⏱</button>
      </div>

      <div className="left-head">
        <h2>章节目录</h2>
        <button className="toggle" onClick={() => setCollapsed(true)} title="收起">‹</button>
      </div>
      <div className="left-search">
        <input placeholder="🔍 搜索章节 / @ 人物" />
      </div>
      <div className="left-body">
        <div className="vol">
          <div className="vol-head"><span className="caret">▸</span>卷一 · 少年入江湖<span className="meta">38 章 · 119k</span></div>
        </div>
        <div className="vol">
          <div className="vol-head current"><span className="caret">▾</span>卷二 · 雪夜入城<span className="meta">3/?  · 5.1k</span></div>
          {CHAPTER_ORDER.filter(id => CHAPTERS[id].vol === "vol2").map(id => {
            const c = CHAPTERS[id];
            const isCurrent = id === currentId;
            return (
              <div
                key={id}
                className={"chapter" + (isCurrent ? " current" : "") + (c.status === "draft" || c.status === "outline" ? " draft" : "")}
                onClick={() => onSelect(id)}
              >
                <span className="ch-num">{String(c.num).padStart(2, "0")}</span>
                <span className="ch-name">{c.title}</span>
                {c.status === "draft" && <span className="ch-flag" title="AI 草稿">·</span>}
                <span className="ch-words">{c.words ? `${(c.words/1000).toFixed(1)}k` : "—"}</span>
              </div>
            );
          })}
          <div className="chapter-add">+ 新章节</div>
        </div>
        <div className="vol">
          <div className="vol-head"><span className="caret">▸</span>卷三 · 北望<span className="meta">规划</span></div>
        </div>
      </div>
      <div className="left-foot">
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span>今日 · 2,140 字</span>
          <span style={{ marginLeft: "auto", color: "var(--accent)", fontWeight: 600 }}>71%</span>
        </div>
        <div className="progress"><div style={{ width: "71%" }}/></div>
        <span style={{ color: "var(--ink-3)", fontSize: 11 }}>目标 3,000 · 🔥 连码 18 天</span>
      </div>
    </aside>
  );
}

function RightPane({ tab, setTab, expanded, setExpanded, chapter, onCharacterClick, onJumpSensitive, onReplaceSensitive }) {
  const collapsed = !expanded;
  const tabs = RIGHT_TABS;
  return (
    <aside className="right-panel" style={collapsed ? { flexBasis: 54 } : {}}>
      <div className="right-rail">
        {tabs.map(t => (
          <button
            key={t.id}
            className={"r-btn" + (tab === t.id && expanded ? " active" : "")}
            onClick={() => { setTab(t.id); setExpanded(true); }}
            title={t.label}
          >
            <span className="icn">{t.icon}</span>
            <span>{t.label}</span>
            {t.badge && <span className="dot" />}
          </button>
        ))}
        <div className="spacer" />
        <button className="r-btn" onClick={() => setExpanded(!expanded)} title={expanded ? "收起" : "展开"}>
          <span className="icn" style={{ fontSize: 14 }}>{expanded ? "›" : "‹"}</span>
        </button>
      </div>
      {expanded && (
        <div className="right-content">
          <div className="right-head">
            <h3>{tabs.find(x => x.id === tab)?.label}</h3>
            <span className="sub">第 {chapter.num} 章 · 实时</span>
          </div>
          <div className="right-body">
            {tab === "context" && <PanelContext chapter={chapter} words={chapter.words} />}
            {tab === "people"  && <PanelPeople onCharacterClick={onCharacterClick} />}
            {tab === "world"   && <PanelWorld />}
            {tab === "fore"    && <PanelFore />}
            {tab === "style"   && <PanelStyle />}
            {tab === "rule"    && <PanelRule onJump={onJumpSensitive} onReplace={onReplaceSensitive} />}
          </div>
        </div>
      )}
    </aside>
  );
}

/* ============ ⌘K Palette ============= */
function Palette({ open, onClose, onPick, onNatural }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const flat = useMemo(() => {
    const all = [];
    PALETTE_GROUPS.forEach(g => g.items.forEach(it => all.push({ ...it, g: g.g })));
    if (!q) return all;
    const ql = q.toLowerCase();
    return all.filter(it => it.t.includes(q) || it.s.includes(q) || it.k.toLowerCase().includes(ql));
  }, [q]);

  useEffect(() => { if (open) { setSel(0); setQ(""); } }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(flat.length - 1, s + 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (flat.length === 0 && q.trim()) { onNatural?.(q.trim()); return; }
        if (flat[sel]) onPick(flat[sel]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, sel, flat, q, onClose, onPick, onNatural]);

  if (!open) return null;

  // group flat results back by group
  const grouped = {};
  flat.forEach((it, i) => {
    if (!grouped[it.g]) grouped[it.g] = [];
    grouped[it.g].push({ ...it, idx: i });
  });

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="palette" onClick={e => e.stopPropagation()}>
        <div className="pal-head">
          <span className="icn">✦</span>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="输入指令，或用自然语言告诉 AI…" />
          <kbd>⌘K</kbd>
        </div>
        <div className="scope-row">
          <span>作用于：</span>
          <button className="chip accent">当前段</button>
          <button className="chip">选中文字</button>
          <button className="chip">当前章</button>
          <span style={{ marginLeft: "auto" }}>引用：</span>
          <button className="chip">@沈砚</button>
          <button className="chip warm">@铜牌</button>
        </div>
        <div className="pal-body">
          {Object.entries(grouped).map(([g, items]) => (
            <React.Fragment key={g}>
              <div className="pal-group">{g}</div>
              {items.map(it => (
                <div
                  key={it.idx}
                  className={"pal-item" + (it.idx === sel ? " selected" : "")}
                  onMouseEnter={() => setSel(it.idx)}
                  onClick={() => onPick(it)}
                >
                  <span className="pal-key">{it.k}</span>
                  <div>
                    <div className="pal-text">{it.t}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{it.s}</div>
                  </div>
                  <span className="pal-hint">↩</span>
                </div>
              ))}
            </React.Fragment>
          ))}
          {flat.length === 0 && (
            <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              <div>没找到指令。按 <kbd>↩</kbd> 让 AI 直接处理：</div>
              <div className="serif" style={{ marginTop: 10, color: "var(--accent)", fontSize: 15, fontStyle: "italic" }}>"{q}"</div>
            </div>
          )}
        </div>
        <div className="pal-foot">
          <span><kbd>↑</kbd><kbd style={{ marginLeft: 2 }}>↓</kbd> 选择</span>
          <span><kbd>↩</kbd> 执行</span>
          <span><kbd>⌥↩</kbd> 取多版</span>
          <span><kbd>⎋</kbd> 关闭</span>
          <span style={{ marginLeft: "auto" }}>5 组 · {flat.length} / 16 条</span>
        </div>
      </div>
    </>
  );
}

/* ============ Term popover ============= */
function TermPop({ term, anchor, onClose }) {
  if (!term || !anchor) return null;
  const data = TERMS[term];
  if (!data) return null;
  const rect = anchor.getBoundingClientRect();
  const style = {
    left: Math.min(window.innerWidth - 300, rect.left),
    top: rect.bottom + 6,
  };
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={onClose} />
      <div className="pop" style={style} onClick={e => e.stopPropagation()}>
        <h4>
          {data.name}
          <span className="badge">{data.kind}</span>
        </h4>
        <div className="pop-body">{data.body}</div>
        <div className="pop-meta">{data.meta}</div>
        <div className="pop-actions">
          <button className="chip accent">在伏笔面板查看</button>
          <button className="chip">编辑设定</button>
        </div>
      </div>
    </>
  );
}

/* ============ Toast ============= */
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="toast">
      {msg.icon && <span>{msg.icon}</span>}
      <span>{msg.text}</span>
      {msg.key && <span className="toast-key">{msg.key}</span>}
    </div>
  );
}

/* ============ Editor (contenteditable) ============= */
const Editor = React.forwardRef(function Editor({ chapter, onTermClick, onIdleType, onWordsChanged, onSelChange, onHistoryChange, ghostLoading }, ref) {
  const bodyRef = useRef(null);
  const ghostRef = useRef(null); // currently-mounted ghost span
  const idleTimerRef = useRef(null);
  const savedRangeRef = useRef(null); // last non-collapsed selection range
  const pendingRef = useRef(null);    // pending rewrite span awaiting accept/revert
  const typingRef = useRef(null);     // typewriter interval
  const histRef = useRef({ stack: [], i: -1 }); // undo/redo snapshots of clean HTML

  // Snapshot current clean body HTML (no ghost/pending) onto the undo stack.
  function snapshot(label) {
    const el = bodyRef.current;
    if (!el) return;
    // strip transient spans from a clone
    const clone = el.cloneNode(true);
    clone.querySelectorAll(".ghost, .ghost-loading").forEach(n => n.remove());
    clone.querySelectorAll(".rewrite-new").forEach(n => {
      n.replaceWith(document.createTextNode(n.dataset.original || n.textContent));
    });
    const html = clone.innerHTML;
    const h = histRef.current;
    // drop any redo tail
    h.stack = h.stack.slice(0, h.i + 1);
    if (h.stack.length === 0) {
      // seed with current-before-state already captured by caller; just push
    }
    h.stack.push({ html, label });
    h.i = h.stack.length - 1;
    if (h.stack.length > 50) { h.stack.shift(); h.i -= 1; }
    onHistoryChange?.(h.i > 0, false);
  }
  function restore(html) {
    const el = bodyRef.current;
    if (!el) return;
    if (typingRef.current) { clearInterval(typingRef.current); typingRef.current = null; }
    ghostRef.current = null; pendingRef.current = null;
    el.innerHTML = html;
    el.normalize();
    onWordsChanged?.(countChars(el.innerText));
  }

  // ---- Setup chapter content once per chapter ----
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.innerHTML = buildChapterHTML(chapter.paragraphs);
    placeCursorAtEnd(el);
    onWordsChanged?.(countChars(el.innerText));
    // seed history with the initial chapter state
    histRef.current = { stack: [{ html: el.innerHTML, label: "初始" }], i: 0 };
    onHistoryChange?.(false, false);
  }, [chapter.id]);

  // ---- Insert/update/remove ghost span when prop changes ----
  // The actual ghost text lives in the parent's `ghost` state; we get it via imperative method
  // to avoid React stomping on contenteditable DOM.
  useImperativeHandle(ref, () => ({
    setGhost(text) {
      removeGhost();
      if (!text) return;
      insertGhostTyping(text);
    },
    setGhostLoading(loading) {
      // Only touch loading spans — leave real ghost alone
      bodyRef.current?.querySelectorAll(".ghost-loading").forEach(n => n.remove());
      if (loading) {
        // Also clear any stale ghost since a fresh request is in flight
        removeGhost();
        insertGhostSpan(null, "ghost-loading");
      }
    },
    acceptGhost() {
      const g = ghostRef.current;
      if (!g || !g.classList.contains("ghost")) return null;
      const text = g.dataset.text || "";
      const parent = g.parentNode;
      // Replace ghost span with a plain text node (the leading space stays)
      const textNode = document.createTextNode(" " + text);
      parent.replaceChild(textNode, g);
      ghostRef.current = null;
      // Move cursor to end of inserted text
      const range = document.createRange();
      range.setStart(textNode, textNode.length);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      // Flash "accepted" highlight via a temporary wrapper
      flashAccepted(textNode);
      onWordsChanged?.(countChars(bodyRef.current.innerText));
      snapshot("AI 续写");
      return text;
    },
    getText() {
      // Excludes ghost (which has contenteditable=false but we want to exclude regardless)
      return cleanText(bodyRef.current);
    },
    focus() {
      bodyRef.current?.focus();
    },
    // ---- selection rewrite ----
    applyRewrite(newText) {
      const range = savedRangeRef.current;
      if (!range || !newText) return null;
      // Clear any existing pending first
      if (pendingRef.current) {
        const tn = document.createTextNode(pendingRef.current.dataset.original || "");
        pendingRef.current.parentNode.replaceChild(tn, pendingRef.current);
        pendingRef.current = null;
      }
      const original = range.toString();
      range.deleteContents();
      const span = document.createElement("span");
      span.className = "rewrite-new";
      span.contentEditable = "false";
      span.textContent = newText;
      span.dataset.original = original;
      range.insertNode(span);
      pendingRef.current = span;
      // scroll into view
      span.scrollIntoView?.({ block: "nearest" });
      onWordsChanged?.(countChars(bodyRef.current.innerText));
      return true;
    },
    acceptRewrite() {
      const span = pendingRef.current;
      if (!span) return null;
      const tn = document.createTextNode(span.textContent);
      span.parentNode.replaceChild(tn, span);
      pendingRef.current = null;
      flashAccepted(tn);
      bodyRef.current?.normalize();
      onWordsChanged?.(countChars(bodyRef.current.innerText));
      snapshot("AI 改写");
      return true;
    },
    revertRewrite() {
      const span = pendingRef.current;
      if (!span) return null;
      const tn = document.createTextNode(span.dataset.original || "");
      span.parentNode.replaceChild(tn, span);
      pendingRef.current = null;
      bodyRef.current?.normalize();
      onWordsChanged?.(countChars(bodyRef.current.innerText));
      return true;
    },
    hasPending() { return !!pendingRef.current; },
    // ---- sensitive word actions (from 合规 panel) ----
    jumpToSensitive(word) {
      const el = bodyRef.current;
      if (!el) return null;
      const span = [...el.querySelectorAll(".sensitive")].find(s => s.dataset.word === word);
      if (!span) return null;
      span.scrollIntoView?.({ block: "center", behavior: "smooth" });
      span.classList.add("sensitive-flash");
      setTimeout(() => span.classList.remove("sensitive-flash"), 900);
      return true;
    },
    replaceSensitive(word, rep) {
      const el = bodyRef.current;
      if (!el) return null;
      const span = [...el.querySelectorAll(".sensitive")].find(s => s.dataset.word === word);
      if (!span) return null;
      const tn = document.createTextNode(rep);
      span.parentNode.replaceChild(tn, span);
      flashAccepted(tn);
      el.normalize();
      onWordsChanged?.(countChars(el.innerText));
      snapshot("敏感词替换");
      return true;
    },
    countSensitive() {
      return bodyRef.current ? bodyRef.current.querySelectorAll(".sensitive").length : 0;
    },
    undo() {
      const h = histRef.current;
      if (h.i <= 0) return null;
      h.i -= 1;
      const entry = h.stack[h.i];
      restore(entry.html);
      onHistoryChange?.(h.i > 0, h.i < h.stack.length - 1);
      return h.stack[h.i + 1].label;
    },
    redo() {
      const h = histRef.current;
      if (h.i >= h.stack.length - 1) return null;
      h.i += 1;
      const entry = h.stack[h.i];
      restore(entry.html);
      onHistoryChange?.(h.i > 0, h.i < h.stack.length - 1);
      return entry.label;
    },
  }), []);

  function insertGhostSpan(text, cls) {
    const body = bodyRef.current;
    if (!body) return;
    const lastP = body.querySelector("p:last-child");
    if (!lastP) return;
    const span = document.createElement("span");
    span.className = cls;
    span.contentEditable = "false";
    if (cls === "ghost-loading") {
      span.innerHTML = ' <span class="ghost-dot"></span><span class="ghost-dot"></span><span class="ghost-dot"></span><span class="ghost-loading-label">AI 思考中</span>';
    } else {
      span.textContent = " " + text;
      span.dataset.text = text;
    }
    lastP.appendChild(span);
    ghostRef.current = span;
  }
  // Ghost with typewriter reveal
  function insertGhostTyping(text) {
    const body = bodyRef.current;
    if (!body) return;
    const lastP = body.querySelector("p:last-child");
    if (!lastP) return;
    const span = document.createElement("span");
    span.className = "ghost";
    span.contentEditable = "false";
    span.dataset.text = text;
    span.textContent = " ";
    lastP.appendChild(span);
    ghostRef.current = span;
    span.scrollIntoView?.({ block: "nearest" });
    let i = 0;
    if (typingRef.current) clearInterval(typingRef.current);
    typingRef.current = setInterval(() => {
      if (ghostRef.current !== span) { clearInterval(typingRef.current); return; }
      i += 1;
      span.textContent = " " + text.slice(0, i);
      if (i >= text.length) { clearInterval(typingRef.current); typingRef.current = null; }
    }, 26);
  }
  function removeGhost() {
    if (typingRef.current) { clearInterval(typingRef.current); typingRef.current = null; }
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    // Also clean up any stragglers
    bodyRef.current?.querySelectorAll(".ghost, .ghost-loading").forEach(n => n.remove());
  }

  // ---- Click handler for terms ----
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    function onClick(e) {
      const t = e.target.closest(".term");
      if (t && t.dataset.term) {
        onTermClick(e, t.dataset.term);
        e.stopPropagation();
      }
    }
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [onTermClick]);

  // ---- Selection → floating rewrite toolbar ----
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    function check() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { onSelChange?.(null); return; }
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) { onSelChange?.(null); return; }
      const text = sel.toString();
      if (!text.trim() || text.replace(/\s/g, "").length < 2) { onSelChange?.(null); return; }
      // Ignore selections that cover the ghost / pending span
      if (range.cloneContents().querySelector?.(".ghost, .ghost-loading")) { onSelChange?.(null); return; }
      savedRangeRef.current = range.cloneRange();
      const rect = range.getBoundingClientRect();
      onSelChange?.({ left: rect.left + rect.width / 2, top: rect.top, text });
    }
    document.addEventListener("selectionchange", check);
    return () => document.removeEventListener("selectionchange", check);
  }, [onSelChange]);

  // ---- Typing → idle detection ----
  function handleInput(e) {
    // User typed → kill ghost (parent will reschedule)
    removeGhost();
    const words = countChars(bodyRef.current.innerText);
    onWordsChanged?.(words);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      const text = cleanText(bodyRef.current);
      onIdleType?.(text);
    }, 1500);
  }

  function handleKeyDown(e) {
    // Prevent Enter from creating <div> instead of <p>
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertHTML", false, "<br><br>");
      // Note: this is simple; production would split into a new <p>
    }
  }

  return (
    <div className="editor-wrap">
      <div className="editor">
        <h1 className="chapter-title">第 {chapter.num} 章 · {chapter.title}</h1>
        <div className="chapter-sub">
          <span>{chapter.volTitle || (chapter.vol === "vol1" ? "卷一" : "卷二 · 雪夜入城")}</span>
          <span className="rule"/>
          <span><WordsLabel chapter={chapter} /></span>
        </div>
        <div
          ref={bodyRef}
          className="body-text"
          id="body-text"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
});

function WordsLabel({ chapter }) {
  return (
    <>{chapter.words.toLocaleString()} / 3,000 字 · {Math.min(100, Math.round(chapter.words/3000*100))}%</>
  );
}

function placeCursorAtEnd(el) {
  if (!el) return;
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// Build chapter HTML: wrap first occurrence of each known term + all sensitive words.
function buildChapterHTML(paragraphs) {
  const TERMS = window.PROTO_DATA.TERMS;
  const SENSITIVE = window.PROTO_DATA.SENSITIVE || [];
  const names = Object.keys(TERMS).sort((a, b) => b.length - a.length);
  const seen = new Set();
  const OPEN = "\u0001", CLOSE = "\u0002";
  function wrapSensitiveOutside(str) {
    const parts = str.split(new RegExp(`(${OPEN}[\\s\\S]*?${CLOSE})`));
    return parts.map(seg => {
      if (seg.startsWith(OPEN)) return seg;
      let out = seg;
      for (const sw of SENSITIVE) {
        out = out.split(sw.word).join(OPEN + "sensitive::" + sw.word + CLOSE);
      }
      return out;
    }).join("");
  }
  return paragraphs.map(p => {
    // protect explicit {TERM:x} markers and mark them seen
    let s = p.replace(/\{TERM:([^}]+)\}/g, (_, t) => { seen.add(t); return OPEN + "term::" + t + CLOSE; });
    // wrap first occurrence of each remaining term name
    for (const name of names) {
      if (seen.has(name)) continue;
      const idx = s.indexOf(name);
      if (idx === -1) continue;
      s = s.slice(0, idx) + OPEN + "term::" + name + CLOSE + s.slice(idx + name.length);
      seen.add(name);
    }
    // wrap sensitive words (all occurrences, outside existing sentinels)
    s = wrapSensitiveOutside(s);
    const html = s.replace(new RegExp(OPEN + "([a-z]+)::([\\s\\S]*?)" + CLOSE, "g"), (_, cls, t) => {
      if (cls === "term") return `<span class="term" data-term="${t}" contenteditable="false">${t}</span>`;
      return `<span class="sensitive" data-word="${t}">${t}</span>`;
    });
    return `<p>${html}</p>`;
  }).join("");
}

function countChars(text) {
  if (!text) return 0;
  // Count non-whitespace characters (approximates Chinese char count)
  return text.replace(/\s/g, "").length;
}

function cleanText(bodyEl) {
  if (!bodyEl) return "";
  // Build text from <p>s, skipping ghost spans
  const ps = bodyEl.querySelectorAll("p");
  const out = [];
  ps.forEach(p => {
    const clone = p.cloneNode(true);
    clone.querySelectorAll(".ghost, .ghost-loading").forEach(n => n.remove());
    out.push(clone.innerText);
  });
  return out.join("\n");
}

function flashAccepted(node) {
  // Wrap in a span that has the accepted animation, then unwrap after animation
  const range = document.createRange();
  range.selectNodeContents(node);
  const wrap = document.createElement("span");
  wrap.className = "accepted";
  range.surroundContents(wrap);
  setTimeout(() => {
    // Unwrap
    const parent = wrap.parentNode;
    while (wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
    parent.removeChild(wrap);
    parent.normalize();
  }, 320);
}

function StatusBar({ chapter, ghostLoading, canUndo, canRedo, onUndo, onRedo }) {
  const pct = Math.min(100, Math.round(chapter.words / 3000 * 100));
  return (
    <div className="status">
      <span><span className="pulse"/>{ghostLoading ? "AI 思考中 · 小说-Lite" : "AI 待命 · 模型 小说-Lite"}</span>
      <span style={{ color: "var(--ink-4)" }}>|</span>
      <button className="undo-btn" disabled={!canUndo} onClick={onUndo} title="撤销 AI 改动 ⌘Z">↶</button>
      <button className="undo-btn" disabled={!canRedo} onClick={onRedo} title="重做 ⌘⇧Z">↷</button>
      <span style={{ color: "var(--ink-4)" }}>|</span>
      <span>巡检通过 · 0 高危</span>
      <div className="progress-mini"><div style={{ width: `${pct}%` }}/></div>
      <span>{chapter.words.toLocaleString()} / 3,000 字</span>
      <div className="right">
        <span>⚐ 1 新伏笔</span>
        <span style={{ color: "var(--ink-4)" }}>|</span>
        <span>风格 87%</span>
        <span style={{ color: "var(--ink-4)" }}>|</span>
        <span>衬线 · 16.5px</span>
      </div>
    </div>
  );
}

/* ============ Beat strip ============= */
function BeatStrip({ onAct, onClose }) {
  return (
    <div className="beat-strip">
      <span className="beat-icon">♪ 节拍</span>
      <span className="beat-text">已铺垫 3 处冲突，建议结尾给一个"喘息"段落让 43 章发力。</span>
      <button onClick={onAct}>采纳</button>
      <button>忽略</button>
      <button className="primary">AI 起 3 版</button>
      <button className="close" onClick={onClose}>×</button>
    </div>
  );
}

/* ============ App ============= */
function countCharsHelper(s) {
  return (s || "").replace(/\s/g, "").length;
}

function App() {
  // Detect onboard handoff
  const onboardData = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get("from") === "onboard") {
        const raw = localStorage.getItem("xws_onboard");
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return null;
  }, []);

  const [view, setView] = useState("write");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightTab, setRightTab] = useState("context");
  const [rightExpanded, setRightExpanded] = useState(true);
  const [currentId, setCurrentId] = useState(onboardData ? "c01_new" : "c42");
  const [showBeat, setShowBeat] = useState(!onboardData);
  const [showOnboardWelcome, setShowOnboardWelcome] = useState(!!onboardData);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("xws_theme") || "light"; } catch (e) { return "light"; }
  });

  // Apply theme to <body>
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    try { localStorage.setItem("xws_theme", theme); } catch (e) {}
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => (t === "dark" ? "light" : "dark")), []);
  const [overlay, setOverlay] = useState(null); // "inspect" | "health" | null
  const [selInfo, setSelInfo] = useState(null);  // selection toolbar info
  const [rewritePending, setRewritePending] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pop, setPop] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentWords, setCurrentWords] = useState(0);

  const editorRef = useRef(null);
  const aiTokenRef = useRef(0); // to ignore stale AI responses

  const chapter = useMemo(() => {
    if (onboardData && currentId === "c01_new") {
      // Build a synthetic chapter from onboard data
      const firstVol = onboardData.outline?.[0];
      const firstBeat = firstVol?.beats?.[0];
      return {
        id: "c01_new",
        vol: "vol1",
        num: 1,
        title: firstBeat?.n || "开场",
        words: countCharsHelper(onboardData.firstChapter || ""),
        status: "writing",
        current: true,
        paragraphs: [onboardData.firstChapter || ""],
      };
    }
    const base = CHAPTERS[currentId];
    return base;
  }, [currentId, onboardData]);

  // Chapter object with live word count (so right panel + status bar see fresh data)
  const liveChapter = useMemo(() => ({
    ...chapter,
    words: currentWords || chapter.words,
  }), [chapter, currentWords]);

  // Toast helper
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  // Sync ghost state → editor DOM
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.setGhost(ghost);
  }, [ghost]);
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.setGhostLoading(ghostLoading);
  }, [ghostLoading]);

  // Reset state on chapter switch
  useEffect(() => {
    setGhost(null);
    setGhostLoading(false);
    setCurrentWords(chapter.words || 0);
  }, [currentId, chapter.words]);

  // AI request: from text snapshot. Uses token to ignore stale responses.
  const requestAI = useCallback(async (text, opts = {}) => {
    const token = ++aiTokenRef.current;
    setGhost(null);
    setGhostLoading(true);
    const chapShape = { ...chapter, paragraphs: text.split("\n").filter(Boolean) };
    const ai = await aiContinue(chapShape, opts);
    if (aiTokenRef.current !== token) return;
    setGhostLoading(false);
    if (ai) setGhost(ai);
    else {
      const key = `${currentId}:end`;
      setGhost(GHOSTS[key] || null);
    }
  }, [chapter, currentId]);

  // Initial AI suggestion on entering writing chapter
  useEffect(() => {
    if (view !== "write") return;
    if (chapter.status !== "writing") return;
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      const text = editorRef.current?.getText() || chapter.paragraphs.join("\n");
      requestAI(text);
    }, 1400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [currentId, view]);

  // Editor → idle typing callback
  const handleIdleType = useCallback((text) => {
    if (ghostLoading) return;
    if (chapter.status !== "writing") return;
    requestAI(text);
  }, [requestAI, chapter.status, ghostLoading]);

  const handleWordsChanged = useCallback((w) => {
    setCurrentWords(w);
  }, []);

  // Keyboard: ⌘K + Tab + Esc
  useEffect(() => {
    function onKey(e) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === "k") { e.preventDefault(); setPaletteOpen(true); return; }
      // Undo / Redo for AI mutations (custom stack)
      if (isMeta && (e.key === "z" || e.key === "Z")) {
        if (e.shiftKey) {
          const lbl = editorRef.current?.redo();
          if (lbl) { e.preventDefault(); showToast({ text: `重做：${lbl}`, icon: "↷" }); return; }
        } else {
          const lbl = editorRef.current?.undo();
          if (lbl) { e.preventDefault(); showToast({ text: `撤销：${lbl}`, icon: "↶" }); return; }
        }
      }
      if (e.key === "Tab") {
        // Pending selection-rewrite takes priority, then ghost
        if (editorRef.current?.hasPending()) {
          e.preventDefault();
          editorRef.current.acceptRewrite();
          setRewritePending(false);
          showToast({ text: "已采用改写 · ⌘Z 撤销", icon: "✓", key: "⇥" });
          return;
        }
        if (ghost) {
          e.preventDefault();
          const accepted = editorRef.current?.acceptGhost();
          setGhost(null);
          if (accepted) showToast({ text: "已接受 · ⌘Z 撤销", icon: "✓", key: "⇥" });
          return;
        }
      }
      if (e.key === "Escape") {
        if (editorRef.current?.hasPending()) {
          e.preventDefault();
          editorRef.current.revertRewrite();
          setRewritePending(false);
          showToast({ text: "已还原", icon: "✕" });
          return;
        }
        if (ghost) {
          e.preventDefault();
          setGhost(null);
          showToast({ text: "已拒绝", icon: "✕" });
          return;
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ghost, showToast]);

  // Selection toolbar action → AI rewrite of the selection
  const handleSelAction = useCallback(async (action) => {
    const info = selInfo;
    setSelInfo(null);
    if (!info) return;
    if (action.key === "custom") {
      // Hand off to ⌘K, seeded with the selection
      setPaletteOpen(true);
      return;
    }
    const token = ++aiTokenRef.current;
    showToast({ text: `AI ${action.label}中…`, icon: "✦" });
    const result = await aiRewrite(info.text, action.instr);
    if (aiTokenRef.current !== token) return;
    if (result) {
      const ok = editorRef.current?.applyRewrite(result);
      if (ok) {
        setRewritePending(true);
        showToast({ text: "改写预览 · Tab 采用 · Esc 还原", icon: "✦" });
      }
    } else {
      showToast({ text: "AI 暂时不可用，请重试", icon: "✕" });
    }
  }, [selInfo, showToast]);

  const handleTermClick = (e, term) => {
    setPop({ term, anchor: e.currentTarget });
  };

  const handlePalettePick = async (item) => {
    setPaletteOpen(false);
    const text = editorRef.current?.getText() || chapter.paragraphs.join("\n");
    const token = ++aiTokenRef.current;
    setGhost(null);
    setGhostLoading(true);
    showToast({ text: `执行：${item.t}…`, icon: "✦" });
    const chapShape = { ...chapter, paragraphs: text.split("\n").filter(Boolean) };
    const ai = await aiCommand(item, chapShape);
    if (aiTokenRef.current !== token) return;
    setGhostLoading(false);
    if (ai) { setGhost(ai); showToast({ text: "AI 已给出候选 · Tab 接受", icon: "✦" }); }
    else { showToast({ text: "AI 暂时不可用，请重试", icon: "✕" }); }
  };

  const handlePaletteNatural = async (query) => {
    setPaletteOpen(false);
    const text = editorRef.current?.getText() || chapter.paragraphs.join("\n");
    const token = ++aiTokenRef.current;
    setGhost(null);
    setGhostLoading(true);
    showToast({ text: `AI 思考中：${query.slice(0, 20)}…`, icon: "✦" });
    const chapShape = { ...chapter, paragraphs: text.split("\n").filter(Boolean) };
    const ai = await aiNatural(query, chapShape);
    if (aiTokenRef.current !== token) return;
    setGhostLoading(false);
    if (ai) { setGhost(ai); showToast({ text: "AI 已给出候选 · Tab 接受", icon: "✦" }); }
  };

  const handleSelectChapter = (id) => {
    setCurrentId(id);
  };

  return (
    <>
      <Topbar
        view={view}
        setView={setView}
        bookTitle={onboardData ? "新书" : "剑入星海"}
        volTitle={onboardData ? (onboardData.outline?.[0]?.title || "卷一") : "卷二 · 雪夜入城"}
        chapterTitle={chapter.title}
        chapterNum={chapter.num}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenOverlay={setOverlay}
      />
      <div className="body">
        <LeftPane
          collapsed={leftCollapsed}
          setCollapsed={setLeftCollapsed}
          currentId={currentId}
          onSelect={handleSelectChapter}
          onOpenOverlay={setOverlay}
        />
        <div className="center">
          {view === "write" && (
            <>
              {showOnboardWelcome && onboardData && (
                <div className="beat-strip" style={{ background: "var(--accent-soft)", borderColor: "var(--accent-line)" }}>
                  <span className="beat-icon">✦ 新书</span>
                  <span className="beat-text">已带入 {onboardData.outline?.length || 0} 卷大纲 · {onboardData.entities?.length || 0} 个设定 · 候选 {(onboardData.selectedCandidate ?? 0) + 1} 已落入第 1 章。继续写吧。</span>
                  <button className="close" onClick={() => setShowOnboardWelcome(false)}>×</button>
                </div>
              )}
              {showBeat && <BeatStrip onAct={() => { setShowBeat(false); showToast({ text: "已加入大纲：43 章前喘息段" }); }} onClose={() => setShowBeat(false)} />}
              <Editor
                ref={editorRef}
                chapter={chapter}
                onTermClick={handleTermClick}
                onIdleType={handleIdleType}
                onWordsChanged={handleWordsChanged}
                onSelChange={setSelInfo}
                onHistoryChange={(u, r) => { setCanUndo(u); setCanRedo(r); }}
                ghostLoading={ghostLoading}
              />
              <StatusBar chapter={liveChapter} ghostLoading={ghostLoading} canUndo={canUndo} canRedo={canRedo} onUndo={() => { const l = editorRef.current?.undo(); if (l) showToast({ text: `撤销：${l}`, icon: "↶" }); }} onRedo={() => { const l = editorRef.current?.redo(); if (l) showToast({ text: `重做：${l}`, icon: "↷" }); }} />
            </>
          )}
          {view === "board" && (
            <KanbanView
              currentId={currentId}
              onOpenChapter={(id) => { handleSelectChapter(id); setView("write"); }}
            />
          )}
          {view === "timeline" && (
            <TimelineView onOpenChapter={(id) => { handleSelectChapter(id); setView("write"); }} />
          )}
        </div>
        <RightPane
          tab={rightTab}
          setTab={setRightTab}
          expanded={rightExpanded}
          setExpanded={setRightExpanded}
          chapter={liveChapter}
          onCharacterClick={() => setOverlay("character")}
          onJumpSensitive={(w) => { editorRef.current?.jumpToSensitive(w) ? showToast({ text: `已定位「${w}」` }) : showToast({ text: `本章未出现「${w}」`, icon: "·" }); }}
          onReplaceSensitive={(w, rep) => { editorRef.current?.replaceSensitive(w, rep) ? showToast({ text: `已替换「${w}」→「${rep}」`, icon: "✓" }) : showToast({ text: `本章未出现「${w}」`, icon: "·" }); }}
        />
      </div>

      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} onPick={handlePalettePick} onNatural={handlePaletteNatural} />
      <SelToolbar info={paletteOpen || ghost || ghostLoading ? null : selInfo} onAction={handleSelAction} />
      <TermPop term={pop?.term} anchor={pop?.anchor} onClose={() => setPop(null)} />
      <Toast msg={toast} />
      {overlay === "inspect" && <InspectOverlay onClose={() => setOverlay(null)} />}
      {overlay === "health" && <HealthOverlay onClose={() => setOverlay(null)} />}
      {overlay === "history" && <HistoryOverlay onClose={() => setOverlay(null)} />}
      {overlay === "settings" && <SettingsOverlay onClose={() => setOverlay(null)} />}
      {overlay === "publish" && <PublishOverlay onClose={() => setOverlay(null)} />}
      {overlay === "analytics" && <AnalyticsOverlay onClose={() => setOverlay(null)} />}
      {overlay === "shelf" && <ShelfOverlay onClose={() => setOverlay(null)} onOpenBook={() => setOverlay(null)} />}
      {overlay === "character" && <CharacterOverlay onClose={() => setOverlay(null)} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
