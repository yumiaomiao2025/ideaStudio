/* global React */
/* ============================================================
   巡检中心 + 全书健康度 —— 原型内的真页面（overlay）
   - Inspect: inbox 式提醒，可展开，「一键 AI 修」调真 Claude
   - Health: 4 维评分 + 本周建议
   ============================================================ */

const { useState: useStateO, useEffect: useEffectO, useCallback: useCallbackO } = React;

/* ---- AI: 针对一条提醒生成修订建议 ---- */
async function aiFixSuggestion(alert) {
  const prompt = `你是网文编辑助手。下面是一条针对某本连载小说的"巡检提醒"，请给出 1-2 句具体、可执行的修改建议（不超过 60 字，直接给做法，不要客套，不要解释为什么）。

提醒类别：${alert.cat}
提醒标题：${alert.title}
上下文：${alert.ctxA}${alert.ctxB ? " / " + alert.ctxB : ""}

直接输出建议，不要引号。`;
  try {
    const r = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return (r || "").trim().replace(/^["「『]/, "").replace(/["」』]$/, "").slice(0, 120);
  } catch (e) {
    return null;
  }
}

const ALERTS = [
  {
    id: "a1", sev: "高", cat: "一致性",
    title: "沈砚的酒量前后矛盾",
    ctxA: '第 22 章："沈砚摇头：我不喝。"',
    ctxB: '第 31 章："沈砚连饮三盏，雪夜不寒。"',
    sug: "是否登记为人物成长（19 岁后开始饮酒），或修改其中一段？",
    actions: ["改 22 章", "改 31 章", "登记成长", "忽略"],
  },
  {
    id: "a2", sev: "高", cat: "伏笔",
    title: "半枚铜牌已埋 25 章未回收",
    ctxA: "埋于 第 17 章 · 距计划回收（第 60 章）还有 18 章",
    sug: "建议在 50 章前给一次小回响（沈砚再次取出端详），避免读者遗忘。",
    actions: ["AI 起 3 版回响", "改回收时机", "忽略"],
  },
  {
    id: "a3", sev: "中", cat: "命名",
    title: '"沈砚" 与《夜读》主角 "陈砚" 重名',
    ctxA: "跨书检测 · 你的另一本《夜读 · 都市修真录》",
    sug: "AI 已起 3 个不重名候选：沈翊 / 沈研 / 沈晏。也可保留。",
    actions: ["看候选", "保留", "关闭跨书检查"],
  },
  {
    id: "a4", sev: "中", cat: "节奏",
    title: "连续 3 章无新伏笔 · 推进感偏平",
    ctxA: "第 40-42 章 · 张力曲线低于均值 18%",
    sug: "在 43-44 章插入 1 个小钩子，或回收「灯无人添油」。",
    actions: ["插钩子", "回收旧伏笔", "AI 改大纲", "忽略"],
  },
  {
    id: "a5", sev: "中", cat: "设定空缺",
    title: '"北疆军营 · 寒鸦坞" 缺基础布局',
    ctxA: "已在 3 章被提及 · 仅有外观，无内部",
    sug: "AI 草拟 80 字 setting，可直接采纳。",
    actions: ["让 AI 起草", "我自己写", "暂不"],
  },
  {
    id: "a6", sev: "低", cat: "合规",
    title: '本章 "刺杀" 一词在七猫触发敏感',
    ctxA: "第 7 段 · 起点 OK · 番茄 OK · 七猫 ⚠",
    sug: "七猫平台建议改「暗杀」或「行刺」。",
    actions: ["AI 替换", "跳到段落", "忽略"],
  },
  {
    id: "a7", sev: "低", cat: "风格漂移",
    title: "本章对话占比 41% · 历史均值 23%",
    ctxA: "第 42 章 · 偏向「对白驱动」· 可能拖慢",
    sug: "如有意为之可忽略；否则缩减或加入动作/环境描写。",
    actions: ["精简对话", "这就是我要的"],
  },
];

const CATS = [
  { k: "一致性", icon: "⚠", n: 4 },
  { k: "伏笔", icon: "⚐", n: 3 },
  { k: "节奏", icon: "♪", n: 2 },
  { k: "命名", icon: "✎", n: 1 },
  { k: "设定空缺", icon: "☱", n: 2 },
  { k: "合规", icon: "⚖", n: 3 },
  { k: "风格漂移", icon: "~", n: 1 },
];

function InspectOverlay({ onClose }) {
  const [expanded, setExpanded] = useStateO("a1");
  const [aiFixes, setAiFixes] = useStateO({}); // id -> { loading, text }
  const [filter, setFilter] = useStateO("全部");
  const [toast, setToast] = useStateO(null);

  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 2200); };

  const runFix = async (alert) => {
    setAiFixes(prev => ({ ...prev, [alert.id]: { loading: true } }));
    const text = await aiFixSuggestion(alert);
    setAiFixes(prev => ({ ...prev, [alert.id]: { loading: false, text: text || "AI 暂时不可用，请重试" } }));
  };

  const filtered = filter === "全部" ? ALERTS : ALERTS.filter(a => a.cat === filter);

  const sevColor = (s) => s === "高" ? "var(--accent)" : s === "中" ? "var(--warm)" : "var(--ink-3)";

  return (
    <div className="overlay-page">
      <div className="overlay-head">
        <div>
          <div className="overlay-title">巡检中心</div>
          <div className="overlay-sub">《剑入星海》· 16 条待处理 · 每 6 章自动巡检 · 上次 16:42</div>
        </div>
        <div className="sev-summary">
          <div><span style={{ color: "var(--accent)" }}>2</span> 高</div>
          <div><span style={{ color: "var(--warm)" }}>6</span> 中</div>
          <div><span style={{ color: "var(--ink-2)" }}>8</span> 低</div>
        </div>
        <button className="btn-soft" onClick={() => showToast({ text: "重新扫描中…" })}>重新扫描</button>
        <button className="btn-accent" onClick={() => showToast({ text: "AI 正在批量修复高危项…" })}>一键 AI 修</button>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </div>

      <div className="overlay-body inspect-body">
        <aside className="inspect-nav">
          <div className="inspect-nav-h">类别</div>
          <button className={"inspect-cat" + (filter === "全部" ? " active" : "")} onClick={() => setFilter("全部")}>
            <span>全部</span><span className="cnt">16</span>
          </button>
          {CATS.map(c => (
            <button key={c.k} className={"inspect-cat" + (filter === c.k ? " active" : "")} onClick={() => setFilter(c.k)}>
              <span style={{ width: 16, textAlign: "center", color: c.k === "一致性" ? "var(--accent)" : "var(--ink-3)" }}>{c.icon}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{c.k}</span>
              <span className="cnt">{c.n}</span>
            </button>
          ))}
          <div className="inspect-nav-foot">
            <div className="muted" style={{ fontSize: 11 }}>本周已修</div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 600, color: "var(--accent)" }}>11</div>
            <div className="muted" style={{ fontSize: 11 }}>采纳 9 · 自动 2</div>
          </div>
        </aside>

        <div className="inspect-list">
          {filtered.map(a => {
            const isOpen = expanded === a.id;
            const fix = aiFixes[a.id];
            return (
              <div key={a.id} className={"alert-card" + (isOpen ? " open" : "")} style={{ borderColor: isOpen ? sevColor(a.sev) : "var(--line)" }}>
                <div className="alert-head" onClick={() => setExpanded(isOpen ? null : a.id)}>
                  <span className="alert-sev" style={{ background: sevColor(a.sev) }}>{a.sev}</span>
                  <span className="alert-title" style={{ color: isOpen ? sevColor(a.sev) : "var(--ink)" }}>{a.title}</span>
                  <span className="alert-cat">{a.cat}</span>
                  <span className="alert-caret">{isOpen ? "▾" : "▸"}</span>
                </div>
                <div className="alert-ctx">{a.ctxA}{a.ctxB && <><br/>{a.ctxB}</>}</div>
                {isOpen && (
                  <div className="alert-detail">
                    <div className="alert-sug"><span className="ai-tag">✦ AI 建议</span> {a.sug}</div>
                    {fix && (
                      <div className="alert-aifix">
                        {fix.loading ? (
                          <span className="ai-thinking"><span className="d"/><span className="d"/><span className="d"/> AI 生成修订方案…</span>
                        ) : (
                          <><span className="ai-tag">✦ 修订方案</span> {fix.text}</>
                        )}
                      </div>
                    )}
                    <div className="alert-actions">
                      <button className="btn-accent sm" onClick={() => runFix(a)}>✦ 让 AI 给方案</button>
                      {a.actions.map((act, i) => (
                        <button key={i} className="btn-soft sm" onClick={() => showToast({ text: `已${act}` })}>{act}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {toast && <div className="overlay-toast">{toast.text}</div>}
    </div>
  );
}

function Gauge({ score, label }) {
  const r = 52, c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: 130, height: 130 }}>
      <svg viewBox="0 0 130 130" width="130" height="130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--accent)" strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset 600ms ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="serif" style={{ fontSize: 42, fontWeight: 600, color: "var(--accent)", lineHeight: 1 }}>{score}</div>
        <div className="muted" style={{ fontSize: 11 }}>{label}</div>
      </div>
    </div>
  );
}

function HealthOverlay({ onClose }) {
  const [toast, setToast] = useStateO(null);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 2200); };

  return (
    <div className="overlay-page">
      <div className="overlay-head">
        <div>
          <div className="overlay-title">全书健康度</div>
          <div className="overlay-sub">《剑入星海》· 玄幻武侠 · 42/约 80 章 · 每周一自动汇总</div>
        </div>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </div>

      <div className="overlay-body health-body">
        {/* hero */}
        <div className="health-hero">
          <Gauge score={78} label="/ 100 · 良好" />
          <div className="health-hero-mid">
            <div className="muted" style={{ fontSize: 12 }}>本周变化</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="serif" style={{ fontSize: 30, fontWeight: 600, color: "var(--accent)" }}>+4</span>
              <span className="muted">74 → 78</span>
            </div>
            <div className="serif" style={{ fontSize: 12.5, lineHeight: 1.7, marginTop: 6, color: "var(--ink-2)" }}>
              贡献：回收伏笔 1 · 修一致性 2 · 张力更平衡<br/>拖累：本章对话密度偏高
            </div>
          </div>
        </div>

        {/* 4 quadrants */}
        <div className="health-grid">
          {[
            { n: "① 进度", s: 86, rows: [["已写", "127k"], ["日均", "1,632"], ["连码", "18 天"], ["预估总章", "≈ 78"]] },
            { n: "② 结构", s: 72, rows: [["卷长方差", "偏大"], ["节奏起伏", "较好"], ["当前", "42/80"], ["高潮预测", "60 章"]] },
            { n: "③ 一致性 & 伏笔", s: 68, rows: [["待修角色", "2"], ["伏笔回收", "1/7"], ["最久未收", "铜牌 25 章"], ["新埋", "灯"]] },
            { n: "④ 风格 & 合规", s: 84, rows: [["风格匹配", "87%"], ['"AI 味"', "低"], ["本章敏感", "2/5"], ["平台兼容", "3/4"]] },
          ].map((q, i) => (
            <div key={i} className="health-card">
              <div className="health-card-head">
                <span className="serif" style={{ fontSize: 17, fontWeight: 600 }}>{q.n}</span>
                <span className="serif" style={{ fontSize: 22, fontWeight: 600, color: q.s < 70 ? "var(--warm)" : "var(--accent)" }}>{q.s}</span>
              </div>
              <div className="health-rows">
                {q.rows.map((r, j) => (
                  <div key={j} className="health-row">
                    <span className="muted">{r[0]}</span>
                    <span className="serif" style={{ fontWeight: 500 }}>{r[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* this-week actions */}
        <div className="health-actions">
          <div className="health-actions-head">
            <span className="ai-tag">✦ 本周建议</span>
            <span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>提升空间 22 分 · 估计 3 个动作可加 12 分</span>
          </div>
          <div className="health-actions-grid">
            {[
              { n: 1, t: "在 43-50 章给「半枚铜牌」一次小回响", v: "+5 分 · 一致性 & 伏笔", act: "AI 起 3 版" },
              { n: 2, t: "卷二字数补到与卷一接近（再 18 章）", v: "+4 分 · 结构", act: "重排大纲" },
              { n: 3, t: "修第 7 段「刺杀」的七猫兼容问题", v: "+3 分 · 合规", act: "一键替换" },
            ].map((it, i) => (
              <div key={i} className="health-action-card">
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="serif" style={{ fontSize: 20, fontWeight: 600, color: "var(--accent)" }}>{it.n}</span>
                  <span className="serif" style={{ fontSize: 13, lineHeight: 1.5 }}>{it.t}</span>
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{it.v}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                  <button className="btn-accent sm" onClick={() => showToast({ text: `执行：${it.act}` })}>{it.act}</button>
                  <button className="btn-soft sm" onClick={() => showToast({ text: "已忽略" })}>忽略</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && <div className="overlay-toast">{toast.text}</div>}
    </div>
  );
}

/* ============================================================
   修订历史 overlay
   ============================================================ */
const VERSIONS = [
  { id: "v0", t: "刚刚 16:48", who: "我", by: "手写", size: "+128 字", label: "未保存" },
  { id: "v1", t: "16:35", who: "AI", by: "续写 200 字 (⌥W)", size: "+212 字", label: "对比基准", base: true },
  { id: "v2", t: "16:22", who: "我", by: "改写 (⌘K · 紧绷化)", size: "−42 +88", label: "⌘K 采纳" },
  { id: "v3", t: "16:08", who: "AI", by: "灯无人添油（新伏笔）", size: "+38 字" },
  { id: "v4", t: "15:51", who: "我", by: "手写", size: "+520 字" },
  { id: "v5", t: "15:42", who: "自动", by: "快照 · 每 15 分", size: "·" },
  { id: "v6", t: "15:30", who: "我", by: "开篇 + 2 段对话", size: "+412 字" },
];

function HistoryOverlay({ onClose }) {
  const [sel, setSel] = useStateO("v0");
  const [toast, setToast] = useStateO(null);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 2200); };

  const whoColor = (w) => w === "AI" ? "var(--warm)" : w === "自动" ? "var(--ink-3)" : "var(--ink-2)";

  // diff text (16:35 AI version vs 16:48 current)
  const oldLines = [
    { t: "沈砚没答话。他从怀里摸出半枚铜牌，铜牌缺角的地方还沾着旧血。", k: "same" },
    { t: "守门兵的脸色一下变了，矛尖收回去比抽出来还快。他低声说了句什么，沈砚没听清，然后做了一个让的手势。", k: "del" },
    { t: "城门吱呀打开，雪卷着进来。沈砚低下头，把铜牌重新塞回怀里，跨过门槛。", k: "del" },
    { t: "城里没有灯。", k: "same" },
    { t: "守门兵在他身后又站了很久，雪积满了肩。", k: "del" },
  ];
  const newLines = [
    { t: "沈砚没答话。他从怀里摸出半枚铜牌，铜牌缺角的地方还沾着旧血。", k: "same" },
    { t: "守门兵没再说话。矛尖斜着收回，半寸。", k: "add" },
    { t: "城门吱呀。雪卷着进来，扑了沈砚一身。他没回头。城楼上那盏灯今夜竟没人去添油。", k: "add" },
    { t: "城里没有灯。", k: "same" },
    { t: "守门兵把矛靠回墙上，又靠了第二次。", k: "add" },
  ];

  return (
    <div className="overlay-page">
      <div className="overlay-head">
        <div>
          <div className="overlay-title">修订历史</div>
          <div className="overlay-sub">《剑入星海》/ 第 42 章 · 雪夜城下 · 每次保存 + 每 15 分自动快照 · 保留 90 天</div>
        </div>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </div>

      <div className="overlay-body history-body">
        {/* left: timeline */}
        <aside className="history-nav">
          <div className="inspect-nav-h">历史 · 18 次 · 仅本章</div>
          <div className="hist-chips">
            <button className="chip-mini active">全部</button>
            <button className="chip-mini">我</button>
            <button className="chip-mini">AI</button>
            <button className="chip-mini">📍 里程碑</button>
          </div>
          <div className="hist-milestones">
            <div className="hist-ms">📍 第 1 稿 · 05-15</div>
            <div className="hist-ms">📍 编辑过稿 · 05-16 14:02</div>
            <div className="hist-ms">📍 巡检通过 · 16:38</div>
          </div>
          <div className="hist-timeline">
            {VERSIONS.map(v => (
              <div
                key={v.id}
                className={"hist-ver" + (sel === v.id ? " sel" : "")}
                onClick={() => setSel(v.id)}
              >
                <span className="hist-dot" style={{ background: v.who === "AI" ? "var(--warm)" : v.who === "自动" ? "transparent" : "var(--ink)", borderColor: whoColor(v.who) }} />
                <div className="hist-ver-body">
                  <div className="hist-ver-top">
                    <span style={{ color: whoColor(v.who), fontSize: 11.5 }}>{v.t}</span>
                    <span className="muted" style={{ marginLeft: "auto", fontSize: 10.5, fontFamily: "JetBrains Mono, monospace" }}>{v.size}</span>
                  </div>
                  <div className="hist-ver-by">
                    <span style={{ color: whoColor(v.who) }}>{v.who === "AI" ? "✦ " : ""}{v.who}</span> · {v.by}
                  </div>
                  {v.label && <span className="hist-label">{v.label}</span>}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* right: diff */}
        <div className="history-diff">
          <div className="diff-toolbar">
            <span className="serif" style={{ fontWeight: 600 }}>对比</span>
            <span className="chip-mini">16:35 ← AI 续写</span>
            <span className="muted">vs</span>
            <span className="chip-mini active">16:48 ← 当前 · 我</span>
            <span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>+128 / −42 · 净 +86 字</span>
          </div>

          <div className="diff-cols">
            <div className="diff-col">
              <div className="diff-col-head" style={{ color: "var(--warm)" }}>16:35 · AI 续写 200 字 · 1,115 字</div>
              <div className="diff-text">
                {oldLines.map((l, i) => (
                  <p key={i} className={l.k === "del" ? "diff-del" : ""}>{l.t}</p>
                ))}
              </div>
            </div>
            <div className="diff-col cur">
              <div className="diff-col-head" style={{ color: "var(--accent)" }}>16:48 · 我 · 当前 · 1,201 字</div>
              <div className="diff-text">
                {newLines.map((l, i) => (
                  <p key={i} className={l.k === "add" ? "diff-add" : ""}>{l.t}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="diff-foot">
            <span className="ai-tag">✦ AI 点评</span>
            <span className="serif" style={{ flex: 1, fontSize: 13 }}>你的版本：对话占比 41% → 18% · 句均 14 → 9 字 · 伏笔密度 +1。更克制，和卷一前 38 章风格更接近。</span>
            <button className="btn-soft sm" onClick={() => showToast({ text: "已回到 16:35 版本" })}>回到 16:35</button>
            <button className="btn-soft sm" onClick={() => showToast({ text: "选择要回退的句子…" })}>只回某一句</button>
            <button className="btn-accent sm" onClick={onClose}>保留当前 · 关闭</button>
          </div>
        </div>
      </div>

      {toast && <div className="overlay-toast">{toast.text}</div>}
    </div>
  );
}

/* ============================================================
   AI 设置 overlay
   ============================================================ */
function Segmented({ levels, cur, onChange }) {
  return (
    <div className="segmented">
      {levels.map((l, i) => (
        <button key={i} className={"seg" + (i === cur ? " active" : "")} onClick={() => onChange(i)}>{l}</button>
      ))}
    </div>
  );
}

function SettingsOverlay({ onClose }) {
  const [toast, setToast] = useStateO(null);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 1800); };

  const [intervene, setIntervene] = useStateO({
    ghost: 2, palette: 1, inspect: 1, beat: 1, comment: 1, title: 1,
  });
  const [sources, setSources] = useStateO({ self: true, other: false, upload: true, market: false });
  const setIv = (k, v) => setIntervene(p => ({ ...p, [k]: v }));

  return (
    <div className="overlay-page">
      <div className="overlay-head">
        <div>
          <div className="overlay-title">AI 设置</div>
          <div className="overlay-sub">控制 AI 在写作时的"性格" · 所有改动实时生效 · 本月用量 2.4M / 5M token</div>
        </div>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </div>

      <div className="overlay-body settings-body">
        {/* 模型 */}
        <div className="set-card full">
          <div className="set-card-head"><span className="serif set-n">① 模型</span><span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>不同场景可用不同模型</span></div>
          <div className="model-grid">
            {[
              { scene: "行内续写", model: "小说-Lite", note: "快 · 0.3s", hot: true },
              { scene: "长段改写", model: "小说-Pro", note: "细 · 1.2s", hot: true },
              { scene: "巡检 & 一致性", model: "通用大模型", note: "深 · 离线" },
              { scene: "评论聚类", model: "通用 Embedding", note: "·" },
            ].map((m, i) => (
              <div key={i} className="model-cell">
                <div className="muted" style={{ fontSize: 11 }}>{m.scene}</div>
                <div className="serif" style={{ fontSize: 14, color: m.hot ? "var(--accent)" : "var(--ink)", fontWeight: 500 }}>{m.model}</div>
                <div className="muted" style={{ fontSize: 11 }}>{m.note}</div>
                <button className="link-btn" onClick={() => showToast({ text: "切换模型…" })}>切换 ›</button>
              </div>
            ))}
          </div>
        </div>

        {/* 风格喂养 */}
        <div className="set-card">
          <div className="set-card-head"><span className="serif set-n">② 风格喂养</span><span className="chip-mini warm" style={{ marginLeft: "auto" }}>已学 41 章 · 12.7 万字</span></div>
          <div className="set-sub">学习来源</div>
          {[
            { k: "self", l: "《剑入星海》本书前文", n: "41 章" },
            { k: "other", l: "《夜读 · 都市修真录》", n: "26 章 · 跨书" },
            { k: "upload", l: "上传参考文（仅匿名提取风格）", n: "3 个 epub" },
            { k: "market", l: "市售网文 · 排行榜样本", n: "100 本 · 类型趋势" },
          ].map(src => (
            <label key={src.k} className="set-checkrow" onClick={() => setSources(p => ({ ...p, [src.k]: !p[src.k] }))}>
              <span className={"checkbox" + (sources[src.k] ? " on" : "")}>{sources[src.k] ? "✓" : ""}</span>
              <span style={{ flex: 1 }}>{src.l}</span>
              <span className="muted" style={{ fontSize: 11 }}>{src.n}</span>
            </label>
          ))}
          <div className="set-inline-ai">✦ 你的"句子长度"和"克制比喻"已学得很准，可一键锁定。</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="btn-accent sm" onClick={() => showToast({ text: "上传参考文…" })}>+ 上传新参考</button>
            <button className="btn-soft sm" onClick={() => showToast({ text: "重新学习中…" })}>重新学习</button>
          </div>
        </div>

        {/* 介入强度 */}
        <div className="set-card">
          <div className="set-card-head"><span className="serif set-n">③ 介入强度</span><span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>AI 多主动 / 多安静</span></div>
          {[
            { k: "ghost", l: "行内续写 (ghost-text)", levels: ["关", "Tab 唤起", "自动"] },
            { k: "palette", l: "⌘K 命令面板", levels: ["关", "开"] },
            { k: "inspect", l: "一致性巡检", levels: ["手动", "每 6 章", "实时"] },
            { k: "beat", l: "节拍/张力建议", levels: ["关", "卷尾", "每章"] },
            { k: "comment", l: "评论聚类", levels: ["关", "每日", "每小时"] },
            { k: "title", l: "AI 起草标题", levels: ["手动", "发布前提示", "自动选最佳"] },
          ].map(row => (
            <div key={row.k} className="set-iv-row">
              <span style={{ flex: 1, fontSize: 13 }}>{row.l}</span>
              <Segmented levels={row.levels} cur={intervene[row.k]} onChange={v => setIv(row.k, v)} />
            </div>
          ))}
        </div>

        {/* 自定义指令 */}
        <div className="set-card">
          <div className="set-card-head"><span className="serif set-n">④ ⌘K 自定义指令</span><span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>22 内置 · 3 自定义</span></div>
          {[
            { k: "⌥V", n: "加一处感官细节（视觉为主）", pin: true },
            { k: "⌥M", n: "把这段改成「沈砚视角」内心独白", pin: true },
            { k: "⌥Z", n: "如果我是网友，会怎么吐槽这段？" },
          ].map((c, i) => (
            <div key={i} className="set-cmd-row">
              <kbd>{c.k}</kbd>
              <span style={{ flex: 1, fontSize: 13 }}>{c.n}</span>
              {c.pin && <span style={{ color: "var(--accent)", fontSize: 11 }}>📌</span>}
              <button className="link-btn" onClick={() => showToast({ text: "编辑指令…" })}>编辑</button>
            </div>
          ))}
          <button className="set-cmd-add" onClick={() => showToast({ text: "新建自定义指令…" })}>+ 新建指令 · 把常用提示词存为一键</button>
        </div>

        {/* 隐私 */}
        <div className="set-card full">
          <div className="set-card-head"><span className="serif set-n">⑤ 隐私 & 归属</span><span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>关于"你的字"</span></div>
          <div className="privacy-grid">
            <div className="privacy-cell">
              <div className="serif" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>不用于平台训练</div>
              <p>你的稿子不会被拿去训练通用大模型 · 默认开启</p>
              <span className="privacy-on">✓ 已开</span>
            </div>
            <div className="privacy-cell">
              <div className="serif" style={{ fontSize: 13, fontWeight: 500 }}>AI 贡献统计</div>
              <p>本书 AI 字数占比 <b>22%</b> · 计入版权声明？</p>
              <span className="muted" style={{ fontSize: 11 }}>不声明 / 章末标注 / 详细日志</span>
            </div>
            <div className="privacy-cell">
              <div className="serif" style={{ fontSize: 13, fontWeight: 500 }}>本地优先</div>
              <p>风格喂养、巡检在本地跑 · 续写仍走云端</p>
              <span className="privacy-on">✓ 部分本地</span>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="overlay-toast">{toast.text}</div>}
    </div>
  );
}

/* ============================================================
   发布面板 overlay —— 多平台一键发布 + AI 起标题/作者说
   ============================================================ */
async function aiAuthorNote() {
  const prompt = `你是网文作者。为刚写完的章节写一段"章末作者说"，30-50 字，口语、亲切、能引导读者追更或互动。本章是《剑入星海》第 42 章「雪夜城下」，沈砚冒雪入城，埋了"灯无人添油"的伏笔。直接输出，不要引号。`;
  try {
    const r = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return (r || "").trim().replace(/^["「『]/, "").replace(/["」』]$/, "").slice(0, 120);
  } catch (e) { return null; }
}

async function aiTitleVariants() {
  const prompt = `为网文《剑入星海》第 42 章写 3 个不同风格的章节标题。本章：沈砚冒雪抵达雪夜城，城门口灯火将熄，守门兵盘问，铜牌身份初露端倪。
输出格式（每行一个，前面标风格）：
古风 | 标题
钩子 | 标题
玩梗 | 标题
只输出 3 行，不要解释。`;
  try {
    const r = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return (r || "").split("\n").map(l => l.trim()).filter(l => l.includes("|")).map(l => {
      const [k, t] = l.split("|").map(x => x.trim());
      return { k, t };
    }).slice(0, 3);
  } catch (e) { return null; }
}

function PublishOverlay({ onClose }) {
  const [toast, setToast] = useStateO(null);
  const [note, setNote] = useStateO("城下这盏灯，留到 45 章再说。各位读者帮我盯一下沈砚的酒量——上一章我可能写漏了。明天同一时间见。");
  const [noteLoading, setNoteLoading] = useStateO(false);
  const [titles, setTitles] = useStateO(null);
  const [titlesLoading, setTitlesLoading] = useStateO(false);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 2000); };

  const regenNote = async () => {
    setNoteLoading(true);
    const n = await aiAuthorNote();
    setNoteLoading(false);
    if (n) { setNote(n); showToast({ text: "AI 已重写作者说" }); }
  };
  const genTitles = async () => {
    setTitlesLoading(true);
    const t = await aiTitleVariants();
    setTitlesLoading(false);
    if (t) setTitles(t);
  };

  const platforms = [
    { n: "起点", st: "ok", title: "雪夜城下", sched: "今天 16:50", flag: "主战场" },
    { n: "番茄", st: "ok", title: "第42章 雪夜入城（沈砚的铜牌再次发烫）", sched: "今天 16:50", flag: "高曝光", note: "番茄推荐钩子型长标题" },
    { n: "七猫", st: "warn", title: "雪夜城下", sched: "待修后", issues: ["刺杀 → 暗杀", "血 → 暗痕"] },
    { n: "微信读书", st: "ok", title: "雪夜城下", sched: "明天 20:00" },
    { n: "晋江", st: "none", flag: "未关联账号" },
  ];
  const stInfo = {
    ok:   { lbl: "✓ 可发", c: "var(--accent)", cf: "#fff" },
    warn: { lbl: "⚠ 待修", c: "var(--warm)", cf: "#fff" },
    none: { lbl: "未关联", c: "var(--surface)", cf: "var(--ink-3)" },
  };

  return (
    <div className="overlay-page">
      <div className="overlay-head">
        <div>
          <div className="overlay-title">发布 · 第 42 章 雪夜城下</div>
          <div className="overlay-sub">1,243 字 · 巡检通过 14/16 · ⚠ 七猫 2 处待修 · 健康度 +1</div>
        </div>
        <button className="btn-soft" onClick={() => showToast({ text: "预览本章…" })}>预览</button>
        <button className="btn-soft" onClick={() => showToast({ text: "已存草稿" })}>仅存草稿</button>
        <button className="btn-accent" onClick={() => showToast({ text: "🪶 已排程发布 4 个平台" })}>🪶 一键发布 4 平台</button>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </div>

      <div className="overlay-body publish-body">
        {/* left: platforms */}
        <div className="pub-platforms">
          <div className="inspect-nav-h" style={{ marginBottom: 8 }}>平台清单 · 4 个已选</div>
          {platforms.map((p, i) => {
            const s = stInfo[p.st];
            return (
              <div key={i} className={"pub-card" + (p.st === "none" ? " off" : "")}>
                <div className="pub-card-head">
                  <span className={"checkbox" + (p.st !== "none" ? " on" : "")}>{p.st !== "none" ? "✓" : ""}</span>
                  <span className="serif" style={{ fontSize: 17, fontWeight: 600, minWidth: 64 }}>{p.n}</span>
                  <span className="chip-mini" style={{ background: s.c, color: s.cf, borderColor: s.c === "var(--surface)" ? "var(--line-2)" : s.c }}>{s.lbl}</span>
                  {p.flag && <span className="chip-mini warm">{p.flag}</span>}
                  <span className="muted" style={{ marginLeft: "auto", fontSize: 11.5 }}>⏱ {p.sched}</span>
                </div>
                {p.st !== "none" && (
                  <div className="pub-card-body">
                    <div className="muted" style={{ fontSize: 11 }}>标题</div>
                    <div className="serif pub-title">{p.title}</div>
                    {p.note && <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>✦ {p.note}</div>}
                    {p.issues && (
                      <div className="pub-issues">
                        <div style={{ fontSize: 11, color: "var(--warm)" }}>⚠ 待修 {p.issues.length}</div>
                        {p.issues.map((it, k) => <div key={k} className="serif" style={{ fontSize: 12 }}>{it}</div>)}
                        <button className="btn-accent sm" style={{ marginTop: 5 }} onClick={() => showToast({ text: "AI 已替换 2 处" })}>一键 AI 替换</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* right: author note + schedule */}
        <div className="pub-side">
          <div className="set-card">
            <div className="set-card-head">
              <span className="serif" style={{ fontSize: 15, fontWeight: 600 }}>章末作者说</span>
              <button className="btn-soft sm" style={{ marginLeft: "auto" }} onClick={regenNote} disabled={noteLoading}>{noteLoading ? "✦ 生成中…" : "✦ AI 重写"}</button>
            </div>
            {noteLoading ? (
              <div className="ai-thinking" style={{ padding: "12px 0" }}><span className="d"/><span className="d"/><span className="d"/> AI 起草作者说…</div>
            ) : (
              <div className="pub-note serif">{note}</div>
            )}
            <div className="muted" style={{ fontSize: 11, marginTop: 4, textAlign: "right" }}>{note.length} 字 · 全平台一致</div>
          </div>

          <div className="set-card">
            <div className="set-card-head"><span className="serif" style={{ fontSize: 15, fontWeight: 600 }}>AI 起 3 个标题</span>
              <button className="btn-soft sm" style={{ marginLeft: "auto" }} onClick={genTitles} disabled={titlesLoading}>{titlesLoading ? "✦ 生成中…" : "✦ 生成"}</button>
            </div>
            {titlesLoading && <div className="ai-thinking" style={{ padding: "12px 0" }}><span className="d"/><span className="d"/><span className="d"/> AI 起标题…</div>}
            {!titlesLoading && titles && titles.map((t, i) => (
              <div key={i} className="pub-title-opt" onClick={() => showToast({ text: `已用：${t.t}` })}>
                <span className="chip-mini">{t.k}</span>
                <span className="serif" style={{ fontSize: 13 }}>{t.t}</span>
              </div>
            ))}
            {!titlesLoading && !titles && <div className="muted" style={{ fontSize: 12, padding: "8px 0" }}>点"生成"让 AI 起 3 个不同风格的标题</div>}
          </div>

          <div className="set-card">
            <div className="serif" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>发布时间表</div>
            {[
              { p: "起点", t: "今天 16:50（5 分钟后）", c: "var(--accent)" },
              { p: "番茄", t: "今天 16:50（同步）" },
              { p: "七猫", t: "待修后 立即", c: "var(--warm)" },
              { p: "微读", t: "明天 20:00 · 定时", c: "var(--ink-3)" },
            ].map((s, i) => (
              <div key={i} className="pub-sched-row">
                <span className="serif" style={{ fontWeight: 500, color: s.c || "var(--ink)", minWidth: 48 }}>{s.p}</span>
                <span style={{ fontSize: 13 }}>{s.t}</span>
              </div>
            ))}
            <div className="set-inline-ai">✦ 起点/番茄 17:00 转化最高（基于过去 10 章追读数据），建议保持 16:50。</div>
          </div>
        </div>
      </div>

      {toast && <div className="overlay-toast">{toast.text}</div>}
    </div>
  );
}

/* ============================================================
   读者数据 overlay
   ============================================================ */
function AnalyticsOverlay({ onClose }) {
  const [toast, setToast] = useStateO(null);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 2000); };

  return (
    <div className="overlay-page">
      <div className="overlay-head">
        <div>
          <div className="overlay-title">读者数据</div>
          <div className="overlay-sub">《剑入星海》· 数据回流 · 每小时同步</div>
        </div>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </div>

      <div className="overlay-body analytics-body">
        {/* KPI row */}
        <div className="kpi-row">
          {[
            { l: "追读人数 (近 7 章)", v: "12,840", d: "+8.2%", hot: true },
            { l: "收藏", v: "4,326", d: "+126" },
            { l: "推荐票 / 本周", v: "1,802", d: "+340" },
            { l: "评论 / 本章", v: "218", d: "AI 已聚类" },
            { l: "完读率 (前 5 章)", v: "71%", d: "行业 ≈ 58%", hot: true },
          ].map((k, i) => (
            <div key={i} className="kpi-card">
              <div className="muted" style={{ fontSize: 11 }}>{k.l}</div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 600, color: k.hot ? "var(--accent)" : "var(--ink)" }}>{k.v}</div>
              <div className="muted" style={{ fontSize: 11 }}>{k.d}</div>
            </div>
          ))}
        </div>

        <div className="analytics-grid">
          {/* 追读曲线 */}
          <div className="set-card" style={{ gridColumn: "1 / 2", gridRow: "1 / 3" }}>
            <div className="set-card-head">
              <span className="serif" style={{ fontSize: 16, fontWeight: 600 }}>追读曲线</span>
              <span className="muted" style={{ fontSize: 11, marginLeft: 8 }}>每章入水率 · 全本</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 10, fontSize: 11 }}>
                <span style={{ color: "var(--accent)" }}>— 起点</span>
                <span style={{ color: "var(--warm)" }}>— 番茄</span>
                <span className="muted">- - 七猫</span>
              </span>
            </div>
            <svg viewBox="0 0 720 300" style={{ width: "100%", height: 260 }}>
              <line x1="40" y1="250" x2="700" y2="250" stroke="var(--line-2)" />
              <line x1="40" y1="20" x2="40" y2="250" stroke="var(--line-2)" />
              {[1, 10, 20, 30, 40].map((c, i) => (
                <text key={i} x={40 + (c / 42) * 640} y="268" fontSize="11" textAnchor="middle" fontFamily="Noto Sans SC" fill="var(--ink-3)">第{c}</text>
              ))}
              {[100, 75, 50, 25].map((v, i) => (
                <text key={i} x="34" y={26 + i * 56} fontSize="10" textAnchor="end" fontFamily="JetBrains Mono" fill="var(--ink-3)">{v}%</text>
              ))}
              <path d="M 56 28 Q 100 36 140 50 T 220 90 T 300 100 T 380 130 T 460 146 T 540 162 T 620 156 T 692 142" fill="none" stroke="var(--accent)" strokeWidth="2.2" />
              <path d="M 56 52 Q 100 72 140 94 T 220 126 T 300 152 T 380 172 T 460 178 T 540 196 T 620 198 T 692 190" fill="none" stroke="var(--warm)" strokeWidth="2.2" />
              <path d="M 56 104 Q 140 132 220 156 T 380 192 T 540 210 T 692 220" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="380" cy="130" r="6" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="388" y="122" fontSize="11" fontFamily="Noto Sans SC" fill="var(--accent)">23 章流失 ↓</text>
            </svg>
            <div className="set-inline-ai">✦ 23 章入水率下降明显（那章铺得慢）。我能帮你在那章加一个 200 字小高潮，回流测试预计 +6%。
              <button className="btn-accent sm" style={{ marginLeft: 8 }} onClick={() => showToast({ text: "AI 起草小高潮…" })}>让 AI 试</button>
            </div>
          </div>

          {/* 留存漏斗 */}
          <div className="set-card">
            <div className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>留存漏斗 <span className="muted" style={{ fontSize: 11, fontWeight: 400 }}>前 5 章 → 完读</span></div>
            {[
              { l: "打开第 1 章", v: 100, n: "42,000" },
              { l: "读完第 1 章", v: 88, n: "36,960" },
              { l: "读到第 3 章", v: 79, n: "33,180" },
              { l: "读到第 5 章", v: 71, n: "29,820" },
              { l: "追到当前 42 章", v: 31, n: "13,020", hot: true },
            ].map((s, i) => (
              <div key={i} className="funnel-row">
                <span style={{ fontSize: 12, width: 96 }}>{s.l}</span>
                <div className="funnel-bar"><div style={{ width: `${s.v}%`, background: s.hot ? "var(--accent)" : "var(--ink-2)" }} /></div>
                <span style={{ fontSize: 11, width: 34, textAlign: "right", color: s.hot ? "var(--accent)" : "var(--ink)" }}>{s.v}%</span>
                <span className="muted" style={{ fontSize: 11, width: 48, textAlign: "right" }}>{s.n}</span>
              </div>
            ))}
          </div>

          {/* 平台对比 */}
          <div className="set-card">
            <div className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>平台对比 <span className="muted" style={{ fontSize: 11, fontWeight: 400 }}>本章 24h</span></div>
            {[
              { p: "起点", v: "9,800", w: 88, c: "var(--accent)" },
              { p: "番茄", v: "7,320", w: 66, c: "var(--warm)" },
              { p: "微读", v: "1,430", w: 13, c: "var(--ink-2)" },
              { p: "七猫", v: "待修后", w: 2, c: "var(--ink-4)" },
            ].map((s, i) => (
              <div key={i} className="funnel-row">
                <span style={{ fontSize: 13, width: 46 }}>{s.p}</span>
                <div className="funnel-bar"><div style={{ width: `${s.w}%`, background: s.c }} /></div>
                <span className="serif" style={{ fontSize: 14, color: s.c, width: 60, textAlign: "right", fontWeight: 500 }}>{s.v}</span>
              </div>
            ))}
            <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>起点占 53%（主战场）· 番茄崛起中 (+18%)</div>
          </div>
        </div>

        {/* comments cluster */}
        <div className="health-actions" style={{ marginTop: 0 }}>
          <div className="health-actions-head">
            <span className="serif" style={{ fontSize: 16, fontWeight: 600 }}>读者声音 · AI 聚类</span>
            <span className="muted" style={{ fontSize: 11, marginLeft: 8 }}>本章 218 条评论 · 7 个话题</span>
          </div>
          <div className="comments-grid">
            {[
              { t: "想看铜牌伏笔", n: "+86", c: "var(--accent)", q: '"灯无人添油是不是铜牌真主的暗号" "求 45 章把伏笔收一收"', ai: "考虑 44 章给一个小回响" },
              { t: "沈砚酒量矛盾", n: "+24", c: "var(--warm)", q: '"22 章不喝 31 章连饮我以为我看错了"', ai: "已在巡检 · 待你决定" },
              { t: "节奏太慢", n: "+18", c: "var(--warm)", q: '"卷二开始有点拖" "雪夜城下铺得久"', ai: null },
              { t: "白如霜何时出场", n: "+33", c: "var(--accent)", q: '"催更白如霜！" "女主下线太久"', ai: null },
            ].map((t, i) => (
              <div key={i} className="comment-card">
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="serif" style={{ fontSize: 13.5, fontWeight: 600 }}>{t.t}</span>
                  <span style={{ color: t.c, fontSize: 11 }}>{t.n}</span>
                </div>
                <div className="serif" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.6 }}>{t.q}</div>
                {t.ai && <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>✦ {t.ai}</div>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span className="muted" style={{ fontSize: 11 }}>+3 个更小话题：</span>
            <span className="chip-mini">钱二意外讨喜</span>
            <span className="chip-mini">季元戏份少</span>
            <span className="chip-mini">古风句式好评</span>
            <button className="btn-accent sm" style={{ marginLeft: "auto" }} onClick={() => showToast({ text: '已把"+86 铜牌"加入伏笔规划' })}>把 +86 铜牌加入伏笔规划</button>
          </div>
        </div>
      </div>

      {toast && <div className="overlay-toast">{toast.text}</div>}
    </div>
  );
}

window.PROTO_OVERLAYS = { InspectOverlay, HealthOverlay, HistoryOverlay, SettingsOverlay, PublishOverlay, AnalyticsOverlay, ShelfOverlay, CharacterOverlay };

/* ============================================================
   书架 overlay —— 项目首页：多书 + 码字仪表盘 + AI 提醒
   ============================================================ */
function ShelfOverlay({ onClose, onOpenBook }) {
  const [toast, setToast] = useStateO(null);
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 2000); };

  const books = [
    { t: "剑入星海", g: "玄幻", w: "127k", c: 42, status: "连载", today: "2,140 字", streak: 18, plat: "起点 · 番茄", current: true, last: "第 42 章 · 雪夜城下 · 1,243 字" },
    { t: "夜读 · 都市修真录", g: "都市", w: "83k", c: 26, status: "连载", today: "840 字", streak: 6, plat: "番茄" },
    { t: "乙女与剑（短篇集）", g: "言情", w: "21k", c: 5, status: "试稿", today: "—", streak: 0, plat: "未发布", draft: true },
  ];

  return (
    <div className="overlay-page">
      <div className="overlay-head">
        <div>
          <div className="overlay-title">书架</div>
          <div className="overlay-sub">2026-05-29 · 周五 · 你已连续码字 18 天</div>
        </div>
        <button className="btn-soft" onClick={() => showToast({ text: "导入旧稿…" })}>导入旧稿</button>
        <a href={encodeURI("网文studio · 新书向导.html")} className="btn-accent" style={{ textDecoration: "none" }}>+ 新书</a>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </div>

      <div className="overlay-body shelf-body">
        {/* stat strip */}
        <div className="shelf-stats">
          {[
            ["本周累计", "11,420 字"],
            ["日均", "1,632 字"],
            ["最长连码", "2h 14m"],
            ["待回收伏笔", "7"],
            ["AI 续写采纳率", "61%"],
          ].map((s, i) => (
            <div key={i} className="shelf-stat">
              <div className="muted" style={{ fontSize: 11 }}>{s[0]}</div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 600 }}>{s[1]}</div>
            </div>
          ))}
        </div>

        <div className="shelf-mid">
          {/* heatmap */}
          <div className="set-card" style={{ flex: 1 }}>
            <div className="set-card-head"><span className="serif" style={{ fontSize: 15, fontWeight: 600 }}>码字热度</span><span className="muted" style={{ marginLeft: "auto", fontSize: 11 }}>过去 12 周</span></div>
            <div className="heatmap">
              {Array.from({ length: 84 }).map((_, i) => {
                const v = Math.random();
                const c = v < 0.2 ? "var(--paper-2)" : v < 0.4 ? "#f0cdb8" : v < 0.7 ? "#dd9a6e" : "var(--accent)";
                return <div key={i} style={{ background: c }} />;
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span className="muted" style={{ fontSize: 11 }}>少</span>
              {["var(--paper-2)", "#f0cdb8", "#dd9a6e", "var(--accent)"].map((c, i) => <div key={i} style={{ width: 12, height: 12, background: c, borderRadius: 3 }} />)}
              <span className="muted" style={{ fontSize: 11 }}>多</span>
              <span className="chip-mini warm" style={{ marginLeft: "auto" }}>🔥 连续 18 天</span>
            </div>
          </div>

          {/* AI nudges */}
          <div className="set-card" style={{ flex: 1, background: "var(--accent-soft)", borderColor: "var(--accent-line)" }}>
            <div className="set-card-head"><span className="ai-tag" style={{ fontSize: 14 }}>✦ AI 提醒</span><span className="muted" style={{ marginLeft: "auto", fontSize: 11 }}>2 条</span></div>
            <div className="serif" style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
              ▌ <span style={{ color: "var(--accent)" }}>《剑入星海》</span>第 38 章埋下的"铜牌"伏笔已 4 章未提及，距计划回收还有 18 章。
            </div>
            <div className="serif" style={{ fontSize: 13, lineHeight: 1.7 }}>
              ▌ <span style={{ color: "var(--accent)" }}>《夜读》</span>主角"陈砚"与《剑入星海》"沈砚"重名，是否合并设定？
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button className="btn-accent sm" onClick={() => showToast({ text: "打开伏笔表…" })}>查看伏笔表</button>
              <button className="btn-soft sm" onClick={() => showToast({ text: "AI 起改名建议…" })}>改名建议</button>
            </div>
          </div>
        </div>

        {/* books */}
        <div className="shelf-books">
          {books.map((b, i) => (
            <div key={i} className={"book-card" + (b.current ? " current" : "")}>
              {b.current && <span className="book-badge">当前</span>}
              <div className="serif book-title">《{b.t}》</div>
              <div className="muted" style={{ fontSize: 12 }}>{b.g} · {b.status} · {b.plat}</div>
              <div className="book-nums">
                <div><div className="muted" style={{ fontSize: 10 }}>总字数</div><div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{b.w}</div></div>
                <div><div className="muted" style={{ fontSize: 10 }}>章节</div><div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{b.c}</div></div>
                <div><div className="muted" style={{ fontSize: 10 }}>今日</div><div className="serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>{b.today}</div></div>
              </div>
              {b.current && <div className="book-last">上次写到 · {b.last}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                {b.streak > 0 && <span className="chip-mini warm">🔥 {b.streak} 天</span>}
                {b.draft && <span className="muted" style={{ fontSize: 12 }}>未发布 · 试稿中</span>}
                <button className={(b.current ? "btn-accent" : "btn-soft") + " sm"} style={{ marginLeft: "auto" }}
                  onClick={() => b.current ? onOpenBook() : showToast({ text: `打开《${b.t}》` })}>
                  {b.current ? "继续写 →" : "打开"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && <div className="overlay-toast">{toast.text}</div>}
    </div>
  );
}

/* ============================================================
   人物设定卡 overlay —— 关系图谱 + 时间线 + 风格样本
   ============================================================ */
function CharacterOverlay({ onClose, name = "沈砚" }) {
  const [toast, setToast] = useStateO(null);
  const [tab, setTab] = useStateO("性格");
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(null), 2000); };

  const rels = [
    { n: "白如霜", x: 18, y: 18, r: "未知", style: "dash", color: "var(--ink)" },
    { n: "卫衍", x: 78, y: 18, r: "师", style: "solid", color: "var(--ink)" },
    { n: "林九郎", x: 14, y: 80, r: "友", style: "solid", color: "var(--ink)" },
    { n: "季元", x: 82, y: 78, r: "敌", style: "solid", color: "var(--accent)" },
  ];
  const timeline = [
    { c: "01", t: "父死，下山，得半枚铜牌" },
    { c: "08", t: "第一次出剑，杀劫匪" },
    { c: "17", t: "⚐ 铜牌身份被认出（伏笔）" },
    { c: "33", t: "遇白如霜，结伴北行" },
    { c: "42", t: "▌ 雪夜入城（当前）", cur: true },
    { c: "?", t: "⚐ 计划：铜牌回收 · 第 60 章前后", future: true },
  ];

  return (
    <div className="overlay-page">
      <div className="overlay-head">
        <div>
          <div className="overlay-title">人物设定 · {name}</div>
          <div className="overlay-sub">《剑入星海》/ 设定库 / 人物 · 出场 41 章 · 首次 第 1 章</div>
        </div>
        <button className="btn-soft" onClick={() => showToast({ text: "导出 JSON" })}>导出</button>
        <button className="overlay-close" onClick={onClose}>✕</button>
      </div>

      <div className="overlay-body char-body">
        {/* top: portrait + basics + AI */}
        <div className="char-top">
          <div className="char-portrait">
            <div className="muted" style={{ fontSize: 12, textAlign: "center" }}>头像 / 立绘<br/>拖入图片</div>
          </div>
          <div className="char-basics">
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span className="serif" style={{ fontSize: 32, fontWeight: 600 }}>沈 砚</span>
              <span className="chip-mini active">主角</span>
              <span className="chip-mini warm">视角人物</span>
            </div>
            <div className="char-rows">
              {[
                ["年龄", "17（卷一）→ 19（当前）"],
                ["籍贯", "北疆 · 朔风城（已破）"],
                ["身份", "叛军遗孤 · 持半枚铜牌"],
                ["武学", "家传「问雪」剑式 · 残篇 4/9"],
                ["外貌", "瘦高，冻青脸，右手有冻疮"],
              ].map((r, i) => (
                <div key={i} className="char-row"><span className="muted">{r[0]}</span><span className="serif">{r[1]}</span></div>
              ))}
            </div>
          </div>
          <div className="char-ai">
            <span className="ai-tag">✦ AI 助手</span>
            <p className="serif">检测到沈砚在第 22/31 章出现"性格漂移"（酒量），是否标注？</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-accent sm" onClick={() => showToast({ text: "打开差异对比" })}>查看</button>
              <button className="btn-soft sm" onClick={() => showToast({ text: "已忽略" })}>忽略</button>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="char-tabs">
          {["性格", "关系图谱", "时间线", "风格样本"].map(t => (
            <button key={t} className={"char-tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="char-tab-body">
          {tab === "性格" && (
            <div className="char-cols">
              <div className="set-card">
                <div className="serif" style={{ fontWeight: 600, marginBottom: 6 }}>性格 & 口癖</div>
                <p className="serif" style={{ fontSize: 13, lineHeight: 1.8 }}>寡言。冷峻。重诺。喝酒不沾。<br/>对刀剑的反应快于对人。<br/>说"嗯"代替"是"。生气时只是更安静。</p>
              </div>
              <div className="set-card">
                <div className="serif" style={{ fontWeight: 600, marginBottom: 6 }}>句式样本 <span className="muted" style={{ fontSize: 11, fontWeight: 400 }}>取自前 41 章</span></div>
                <p className="serif" style={{ fontSize: 13, lineHeight: 1.9, color: "var(--ink-2)" }}>"雪要停了。"<br/>"我不喝。"<br/>"你说的不算。"</p>
              </div>
            </div>
          )}
          {tab === "关系图谱" && (
            <div className="set-card" style={{ maxWidth: 460, margin: "0 auto" }}>
              <div style={{ position: "relative", height: 280 }}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  {rels.map((p, i) => (
                    <line key={i} x1="50%" y1="50%" x2={`${p.x}%`} y2={`${p.y}%`}
                      stroke={p.color} strokeWidth={p.color === "var(--accent)" ? 2 : 1.2}
                      strokeDasharray={p.style === "dash" ? "4 4" : "0"} />
                  ))}
                </svg>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
                  <div className="char-node center">沈砚</div>
                </div>
                {rels.map((p, i) => (
                  <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}>
                    <div className="char-node"><div>{p.n}</div><div className="muted" style={{ fontSize: 10 }}>{p.r}</div></div>
                  </div>
                ))}
              </div>
              <div className="muted" style={{ fontSize: 11, textAlign: "center" }}>实线=明牌 · 虚线=暧昧 · 朱砂=敌对</div>
            </div>
          )}
          {tab === "时间线" && (
            <div className="set-card" style={{ maxWidth: 520, margin: "0 auto" }}>
              <div className="char-timeline">
                {timeline.map((n, i) => (
                  <div key={i} className="char-tl-row">
                    <span className="char-tl-dot" style={{ background: n.cur ? "var(--accent)" : n.future ? "transparent" : "var(--ink)", borderColor: n.cur ? "var(--accent)" : "var(--ink)" }} />
                    <span className="char-tl-ch" style={{ color: n.cur ? "var(--accent)" : n.future ? "var(--ink-3)" : "var(--ink-2)" }}>第 {n.c} 章</span>
                    <span className="serif" style={{ fontSize: 13, color: n.cur ? "var(--accent)" : "var(--ink)" }}>{n.t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "风格样本" && (
            <div className="char-cols">
              <div className="set-card">
                <div className="serif" style={{ fontWeight: 600, marginBottom: 6 }}>语气规则 <span className="muted" style={{ fontSize: 11, fontWeight: 400 }}>🔒 续写时遵守</span></div>
                <p className="serif" style={{ fontSize: 13, lineHeight: 1.8 }}>句末多用句号 · 不说"是"说"嗯" · 不主动开口 · 短句优先</p>
              </div>
              <div className="set-card">
                <div className="serif" style={{ fontWeight: 600, marginBottom: 6 }}>对白片段</div>
                <p className="serif" style={{ fontSize: 13, lineHeight: 1.9, color: "var(--ink-2)" }}>"外乡人？" —— 别人问<br/>"嗯。" —— 沈砚答<br/>"……"（更多时候不答）</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="overlay-toast">{toast.text}</div>}
    </div>
  );
}

