/* global React */
/* ============================================================
   Kanban + Timeline views for the prototype
   ============================================================ */

const { useState: useStateV, useMemo: useMemoV } = React;

/* ===== Kanban view ============================================ */
function KanbanView({ onOpenChapter, currentId }) {
  const arcs = [
    {
      id: "vol1",
      title: "卷一 · 少年入江湖",
      sub: "第 1 – 38 章 · 119k",
      done: true,
      tension: [10, 22, 35, 48, 42, 58, 70, 64, 52],
      cards: [
        { id: "c01", num: "01", t: "雨夜下山", s: "少年 / 师父 / 出门", w: "3.2k", state: "done" },
        { id: "c17", num: "17", t: "父亲遗物", s: "⚐ 半枚铜牌（伏笔 #1）", w: "3.1k", state: "done", fl: true },
        { id: "c29", num: "29", t: "老者断剑", s: "⚐ 卫衍临终 · 伏笔 #2", w: "3.0k", state: "done", fl: true },
        { id: "_mid1", muted: true, t: "… 余 35 章已完成 …" },
      ],
    },
    {
      id: "vol2",
      title: "卷二 · 雪夜入城",
      sub: "第 39 – ? 章 · 5.1k 已写",
      current: true,
      tension: [62, 76, 88, 94, 80, 92],
      cards: [
        { id: "c41", num: "41", t: "城门密谈", s: "老者出剑 · 半枚铜牌", w: "3.1k", state: "done" },
        { id: "c42", num: "42", t: "雪夜城下", s: "沈砚入城 · ⚐ 灯无人添油", w: "1.2k", state: "writing", cur: true, fl: true },
        { id: "c43", num: "43", t: "城主之女", s: "AI 草稿 · 待润色", w: "0.8k", state: "ai-draft" },
        { id: "c44", num: "44", t: "?", s: "⚐ 计划：铜牌身份揭", state: "placeholder" },
        { id: "c45", num: "45", t: "老者断剑回收", s: "伏笔 #2 兑现", state: "outlined", fl: true },
        { id: "_add", add: true },
      ],
    },
    {
      id: "vol3",
      title: "卷三 · 北望",
      sub: "概念阶段",
      cards: [
        { id: "n1", note: true, t: "⌗ 主线", s: "沈砚 vs 季元" },
        { id: "n2", note: true, t: "⌗ 副线", s: "铜牌身世" },
        { id: "n3", note: true, t: "⌗ 反派", s: "AI 候选 3 版", ai: true },
        { id: "n4", note: true, t: "⌗ 高潮节点", s: "AI 起 3 种走向", ai: true },
      ],
    },
  ];

  return (
    <div className="kanban-view">
      <div className="kb-toolbar">
        <span className="kb-label">显示</span>
        <button className="chip accent">全部</button>
        <button className="chip">主线</button>
        <button className="chip">支线</button>
        <button className="chip warm">⚐ 伏笔</button>
        <span className="kb-sep">|</span>
        <span className="kb-label">分组</span>
        <button className="chip accent">按卷</button>
        <button className="chip">按节拍</button>
        <button className="chip">按 POV</button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}>42 章 · 127k 字</span>
        <button className="chip">AI 续写大纲</button>
        <button className="chip accent">+ 新卷</button>
      </div>

      {/* tension curve */}
      <div className="kb-tension">
        <div className="kb-tension-head">
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>♪ 张力曲线</span>
          <span style={{ marginLeft: "auto", color: "var(--ink-3)", fontSize: 11.5 }}>
            建议：44 章前插入"喘息" · 60 章铺最高潮
          </span>
        </div>
        <svg viewBox="0 0 1240 60" preserveAspectRatio="none" style={{ width: "100%", height: 56, marginTop: 6 }}>
          <line x1="0" y1="50" x2="1240" y2="50" stroke="var(--ink-4)" strokeWidth="0.8" />
          <path
            d="M 10 38 Q 80 35 140 26 T 280 18 T 420 16 T 560 22 T 680 8 T 820 6 T 920 10 T 1040 4 T 1180 14"
            fill="none" stroke="var(--accent)" strokeWidth="1.8"
          />
          <line x1="660" y1="2" x2="660" y2="56" stroke="var(--accent)" strokeDasharray="3 3" />
          <text x="666" y="14" fontSize="11" fontFamily="Noto Sans SC" fill="var(--accent)" fontWeight="600">42 ↓ 当前</text>
          <circle cx="1040" cy="4" r="4" fill="var(--accent)" />
          <text x="1040" y="-1" fontSize="10" textAnchor="middle" fontFamily="Noto Sans SC" fill="var(--accent)">高潮?</text>
          <circle cx="740" cy="14" r="3" fill="none" stroke="var(--warm)" strokeWidth="1.4" />
          <text x="740" y="32" fontSize="10" textAnchor="middle" fontFamily="Noto Sans SC" fill="var(--warm)">建议喘息</text>
        </svg>
      </div>

      <div className="kb-cols">
        {arcs.map(arc => (
          <div key={arc.id} className={"kb-col" + (arc.current ? " current" : "")}>
            <div className="kb-col-head">
              <div>
                <div className="kb-col-title" style={{ color: arc.current ? "var(--accent)" : "var(--ink)" }}>
                  {arc.current ? "▌ " : ""}{arc.title}
                </div>
                <div className="kb-col-sub">{arc.sub}</div>
              </div>
              <span className="kb-col-count">
                {arc.cards.filter(c => c.state === "done").length}/{arc.cards.filter(c => !c.add && !c.muted && !c.note).length}
              </span>
            </div>

            {arc.cards.map(c => {
              if (c.add) {
                return (
                  <div key={c.id} className="kb-card kb-add">+ 新章节</div>
                );
              }
              if (c.muted) {
                return <div key={c.id} className="kb-muted">{c.t}</div>;
              }
              if (c.note) {
                return (
                  <div key={c.id} className="kb-card kb-note">
                    <div className="kb-card-title">{c.t}</div>
                    <div className="kb-card-sub" style={{ color: c.ai ? "var(--accent)" : "var(--ink-3)" }}>{c.s}</div>
                  </div>
                );
              }

              const stateInfo = {
                done:        { lbl: "已完",    bg: "var(--ink)",     fg: "#fff" },
                writing:     { lbl: "🖊 进行中", bg: "var(--accent)",  fg: "#fff" },
                "ai-draft":  { lbl: "AI 草稿", bg: "var(--warm)",    fg: "#fff" },
                outlined:    { lbl: "已大纲",  bg: "transparent",    fg: "var(--ink-2)", bordered: true },
                placeholder: { lbl: "待写",    bg: "transparent",    fg: "var(--ink-3)", bordered: true },
              }[c.state];

              const isCurrent = c.id === currentId;
              const isCardClickable = c.id && c.id.startsWith("c");

              return (
                <div
                  key={c.id}
                  className={"kb-card" + (isCurrent ? " current" : "") + (c.state === "placeholder" ? " dashed" : "") + (isCardClickable ? " clickable" : "")}
                  onClick={() => isCardClickable && onOpenChapter(c.id)}
                >
                  <div className="kb-card-head">
                    <span className="kb-card-num">{c.num}</span>
                    <span className="kb-card-title" style={{ color: c.cur ? "var(--accent)" : c.state === "placeholder" ? "var(--ink-3)" : "var(--ink)" }}>
                      {c.t}
                    </span>
                    {c.w && <span className="kb-card-w">{c.w}</span>}
                    <span
                      className="kb-state"
                      style={{
                        background: stateInfo.bg,
                        color: stateInfo.fg,
                        border: stateInfo.bordered ? "1px solid var(--line-2)" : "1px solid transparent",
                      }}
                    >
                      {stateInfo.lbl}
                    </span>
                  </div>
                  <div className="kb-card-sub">{c.s}</div>
                  {c.fl && <span className="chip warm" style={{ marginTop: 4, fontSize: 10 }}>⚐ 伏笔</span>}
                </div>
              );
            })}

            {arc.current && (
              <div className="kb-col-ai">
                <div className="kb-ai-head">✦ AI 节奏</div>
                <p>本卷 6 章已铺 2 处冲突，44 章插入"沈砚与白如霜短暂相处"可放缓节奏。</p>
                <div className="kb-ai-acts">
                  <button className="chip accent">插入空卡</button>
                  <button className="chip">AI 起 3 版</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Timeline view ========================================== */
function TimelineView({ onOpenChapter }) {
  const totalCh = 80;
  const xOf = ch => 90 + (ch / totalCh) * 1080;

  const tracks = [
    { n: "沈砚",   r: "主角",     bands: [[1, 42, "ink"]], color: "var(--accent)" },
    { n: "白如霜", r: "女主",     bands: [[33, 42, "ink"]] },
    { n: "卫衍",   r: "师 · 亡",  bands: [[1, 29, "ink"], [29, 29, "dot"]] },
    { n: "林九郎", r: "友/暗探",  bands: [[11, 38, "ink"]] },
    { n: "季元",   r: "反派",     bands: [[38, 42, "ink"]] },
  ];

  const arcs = [
    { n: "半枚铜牌",    from: 17, to: 60, state: "open" },
    { n: "老者断剑",    from: 29, to: 45, state: "near" },
    { n: "灯无人添油",  from: 42, to: null, state: "fresh" },
    { n: "林玉佩",      from: 11, to: 38, state: "done" },
  ];

  return (
    <div className="timeline-view">
      <div className="tl-toolbar">
        <span className="kb-label">轨道</span>
        <button className="chip accent">人物 5</button>
        <button className="chip">伏笔 4</button>
        <button className="chip">事件</button>
        <button className="chip">地点</button>
        <span className="kb-sep">|</span>
        <span className="kb-label">缩放</span>
        <button className="chip">章</button>
        <button className="chip accent">卷</button>
        <button className="chip">幕</button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}>已写 42 / 规划 80 章</span>
      </div>

      <div className="tl-canvas">
        {/* axis */}
        <svg width="100%" height="36" style={{ display: "block" }}>
          <line x1="90" y1="22" x2={xOf(totalCh)} y2="22" stroke="var(--ink)" strokeWidth="1.2" />
          {[1, 10, 20, 30, 40, 50, 60, 70, 80].map((c, i) => (
            <g key={i}>
              <line x1={xOf(c)} y1="18" x2={xOf(c)} y2="26" stroke="var(--ink-2)" />
              <text x={xOf(c)} y="14" fontSize="11" textAnchor="middle" fontFamily="Noto Sans SC" fill="var(--ink-2)">{c}</text>
            </g>
          ))}
          <line x1={xOf(42)} y1="0" x2={xOf(42)} y2="34" stroke="var(--accent)" strokeWidth="1.5" />
          <text x={xOf(42) + 6} y="10" fontSize="11" fontFamily="Noto Sans SC" fill="var(--accent)" fontWeight="600">▌ 42</text>
          {[1, 38, 60].map((c, i) => (
            <line key={i} x1={xOf(c)} y1="0" x2={xOf(c)} y2="34" stroke="var(--ink-3)" strokeDasharray="3 3" opacity="0.4" />
          ))}
          <text x={xOf(20)} y="34" fontSize="11" textAnchor="middle" fontFamily="Noto Serif SC" fill="var(--ink)">卷一</text>
          <text x={xOf(49)} y="34" fontSize="11" textAnchor="middle" fontFamily="Noto Serif SC" fill="var(--accent)">卷二</text>
          <text x={xOf(70)} y="34" fontSize="11" textAnchor="middle" fontFamily="Noto Serif SC" fill="var(--ink)">卷三</text>
        </svg>

        {/* character tracks */}
        <div className="tl-tracks">
          {tracks.map((t, i) => (
            <div key={i} className="tl-track">
              <div className="tl-track-label">
                <span className="tl-track-name" style={{ color: i === 0 ? "var(--accent)" : "var(--ink)" }}>{t.n}</span>
                <span className="tl-track-role">{t.r}</span>
              </div>
              <svg width="100%" height="44" style={{ position: "absolute", left: 0, top: 0 }}>
                {t.bands.map((b, j) => {
                  const [from, to, type] = b;
                  const x1 = xOf(from), x2 = xOf(to);
                  if (type === "dot") {
                    return (
                      <g key={j}>
                        <line x1={x1} y1="14" x2={x1} y2="34" stroke="var(--ink-3)" strokeWidth="1.2" />
                        <text x={x1 + 4} y="38" fontSize="10" fontFamily="Noto Sans SC" fill="var(--ink-3)">亡</text>
                      </g>
                    );
                  }
                  return (
                    <rect
                      key={j}
                      x={x1} y="14" width={Math.max(8, x2 - x1)} height="18"
                      fill={i === 0 ? "var(--accent)" : "var(--ink)"}
                      opacity={i === 0 ? 0.95 : 0.7}
                      rx="3"
                    />
                  );
                })}
              </svg>
            </div>
          ))}
        </div>

        {/* foreshadow */}
        <div className="tl-fore">
          <div className="tl-fore-label">⚐ 伏笔</div>
          <svg width="100%" height={28 + arcs.length * 18} style={{ position: "absolute", left: 0, top: 0 }}>
            {arcs.map((a, i) => {
              const x1 = xOf(a.from);
              const x2 = a.to ? xOf(a.to) : xOf(a.from + 8);
              const y = 18 + i * 18;
              const cmap = {
                open:  { c: "var(--accent)", dash: "4 4", endFill: "none",         endStroke: "var(--accent)" },
                near:  { c: "var(--warm)",   dash: "4 4", endFill: "var(--warm)",  endStroke: "var(--warm)" },
                fresh: { c: "var(--accent)", dash: "2 3", endFill: "none",         endStroke: "none" },
                done:  { c: "var(--ink)",    dash: "0",   endFill: "var(--ink)",   endStroke: "var(--ink)" },
              }[a.state];
              return (
                <g key={i}>
                  <circle cx={x1} cy={y} r="4" fill={cmap.c} />
                  <line x1={x1} y1={y} x2={x2} y2={y} stroke={cmap.c} strokeDasharray={cmap.dash} strokeWidth="1.4" />
                  {a.to && <circle cx={x2} cy={y} r="4" fill={cmap.endFill} stroke={cmap.endStroke} strokeWidth="1.4" />}
                  <text x={x1 + 8} y={y - 6} fontSize="10" fontFamily="Noto Serif SC" fill={cmap.c}>{a.n}</text>
                  {!a.to && <text x={x1 + 8} y={y + 4} fontSize="9" fontFamily="Noto Sans SC" fill={cmap.c}>未规划</text>}
                </g>
              );
            })}
          </svg>
        </div>

        {/* tension at bottom */}
        <div className="tl-tension">
          <div className="tl-tension-label">♪ 张力</div>
          <svg width="100%" height="90" preserveAspectRatio="none">
            <path
              d={`M ${xOf(1)} 70 Q ${xOf(8)} 56 ${xOf(15)} 46 T ${xOf(25)} 36 T ${xOf(35)} 26 T ${xOf(42)} 30 T ${xOf(50)} 20 T ${xOf(60)} 10 T ${xOf(70)} 22 T ${xOf(80)} 6`}
              fill="none" stroke="var(--accent)" strokeWidth="2"
            />
            <line x1={xOf(42)} y1="0" x2={xOf(42)} y2="88" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="3 3" />
            <circle cx={xOf(42)} cy="30" r="4" fill="var(--accent)" />
            <circle cx={xOf(60)} cy="10" r="5" fill="var(--accent)" />
            <text x={xOf(60)} y="4" fontSize="10" textAnchor="middle" fontFamily="Noto Sans SC" fill="var(--accent)" fontWeight="600">高潮 ?</text>
            <circle cx={xOf(44)} cy="32" r="4" fill="none" stroke="var(--warm)" strokeWidth="1.4" />
            <text x={xOf(44) + 8} y="36" fontSize="10" fontFamily="Noto Sans SC" fill="var(--warm)">建议喘息</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

window.PROTO_VIEWS = { KanbanView, TimelineView };
