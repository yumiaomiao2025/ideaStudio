/* global React */
/* ============================================================
   Right panel content for each tab
   ============================================================ */

const { useState } = React;

function PanelContext({ chapter, words }) {
  return (
    <>
      <div className="panel-section">
        <h5 className="row">上下文用量 <span className="end">4,820 / 8,000 token</span></h5>
        <div className="token-bar">
          <div style={{ flex: 18, background: "#c44a2c" }} />
          <div style={{ flex: 14, background: "#e29a78" }} />
          <div style={{ flex: 9,  background: "#c9a227" }} />
          <div style={{ flex: 7,  background: "#1a1816" }} />
          <div style={{ flex: 12, background: "#e8e2d2" }} />
        </div>
        <div className="token-legend">
          <span style={{ "--c": "#c44a2c" }}><span style={{ background: "#c44a2c" }} />正文 30%</span>
          <span><span style={{ background: "#e29a78" }} />人物 24%</span>
          <span><span style={{ background: "#c9a227" }} />设定 15%</span>
          <span><span style={{ background: "#1a1816" }} />风格 12%</span>
        </div>
      </div>

      <div className="panel-section">
        <h5 className="row">已注入正文 <span className="end">自动 · 可编辑</span></h5>
        <div className="card">
          <div className="card-head"><span className="ttl">第 41 章 · 摘要</span><span className="meta">AI 生成</span></div>
          <p>城外老者断剑，留下「半枚铜牌可入北十二城」暗语；沈砚冒雪南下抵雪夜城。</p>
        </div>
        <div className="card warn">
          <div className="card-head"><span className="ttl" style={{ color: "var(--accent)" }}>本章 · 正文</span><span className="meta">{words} 字 · 全文</span></div>
          <p style={{ color: "var(--ink-2)" }}>"雪线压着城墙，像一道压了三天三夜的眉……"</p>
        </div>
      </div>

      <div className="panel-section">
        <h5>自动钉住</h5>
        <div className="chips-row">
          <span className="chip accent">沈砚 · 主</span>
          <span className="chip">守门兵 · 角</span>
          <span className="chip warm">⚐ 半枚铜牌</span>
          <span className="chip">雪夜城</span>
        </div>
      </div>

      <div className="panel-section">
        <h5>手动锁定</h5>
        <div className="card" style={{ borderStyle: "dashed", background: "transparent" }}>
          <p style={{ margin: 0, fontSize: 12 }}>把"老者临终独白"永远塞进每次生成<br /><span className="muted">第 41 章 P3 · 已锁定</span></p>
          <div className="card-actions">
            <button className="chip">编辑</button>
            <button className="chip">解锁</button>
          </div>
        </div>
      </div>

      <div className="panel-section" style={{ marginTop: 18 }}>
        <button className="chip accent" style={{ padding: "5px 12px" }}>重建上下文</button>
        <button className="chip" style={{ marginLeft: 6, padding: "5px 12px" }}>查看 prompt</button>
      </div>
    </>
  );
}

function PanelPeople({ onCharacterClick }) {
  const ppl = [
    { n: "沈砚", r: "主角", app: 41, t: "寡言 · 持半枚铜牌", bar: 100, alert: "22/31 章酒量漂移", cur: true },
    { n: "白如霜", r: "女主", app: 9, t: "剑客之女 · 嗜甜", bar: 32 },
    { n: "卫衍", r: "师 · 亡", app: 6, t: "断剑老者 · 北疆遗将", bar: 18, dim: true },
    { n: "林九郎", r: "友", app: 14, t: "江南书生 · 实为暗探", bar: 48, alert: "设定矛盾 35 章" },
    { n: "季元", r: "反派", app: 5, t: "雪夜城主 · 持完整铜牌", bar: 14 },
    { n: "钱二", r: "守门兵", app: 1, t: "本章新增", bar: 2, fresh: true },
  ];
  return (
    <>
      <div className="panel-section">
        <div className="chips-row">
          <button className="chip accent">全部 23</button>
          <button className="chip">主角 1</button>
          <button className="chip">配角 6</button>
          <button className="chip danger">⚠ 2</button>
        </div>
      </div>

      <div className="panel-section">
        <div className="card warn">
          <div className="card-head"><span className="ttl" style={{ color: "var(--accent)" }}>✦ 一致性扫描</span></div>
          <p>沈砚 22 章自称"我不喝"，31 章"连饮三盏"。</p>
          <div className="card-actions">
            <button className="chip accent">查看差异</button>
            <button className="chip">登记成长</button>
            <button className="chip">忽略</button>
          </div>
        </div>
      </div>

      <div className="panel-section">
        {ppl.map((p, i) => (
          <div key={i} className={"card" + (p.cur ? " warn" : "")} style={{ opacity: p.dim ? 0.7 : 1, padding: "8px 10px", marginBottom: 6, cursor: "pointer" }} onClick={() => onCharacterClick && onCharacterClick(p.n)} title="查看人物设定卡">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--paper-2)", border: "1px dashed var(--line-2)", flex: "0 0 26px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="serif" style={{ fontSize: 13, fontWeight: 600, color: p.cur ? "var(--accent)" : "var(--ink)" }}>{p.n}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>· {p.r}</span>
                  {p.fresh && <span className="chip warm" style={{ fontSize: 10, padding: "0 5px", marginLeft: "auto" }}>本章新</span>}
                  {!p.fresh && <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--ink-3)", fontFamily: "JetBrains Mono, monospace" }}>{p.app} 章</span>}
                </div>
                <div className="serif" style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 1 }}>{p.t}</div>
                {p.alert && <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>⚠ {p.alert}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PanelFore() {
  const items = [
    { n: "半枚铜牌", p: "第 17 章", r: "计划 第 60 章 · 距 18 章", state: "open" },
    { n: "老者断剑", p: "第 29 章", r: "计划 第 45 章 · 距 3 章", state: "near" },
    { n: "灯无人添油", p: "第 42 章 · 本章", r: "未规划", state: "fresh" },
    { n: "林玉佩", p: "第 11 章", r: "已回收 第 38 章 ✓", state: "done" },
  ];
  return (
    <>
      <div className="panel-section">
        <h5 className="row">伏笔 · 7 <span className="end">3 待回收 · 1 已收</span></h5>
        <div className="chips-row">
          <button className="chip accent">全部</button>
          <button className="chip">待回收 3</button>
          <button className="chip">临近 1</button>
          <button className="chip">已收 1</button>
        </div>
      </div>

      <div className="panel-section">
        <div className="card">
          <h5 style={{ margin: "0 0 6px" }}>节奏提醒</h5>
          <p style={{ margin: 0, fontSize: 12 }}>连续 3 章无新伏笔，43-44 章可埋一个小钩子。</p>
        </div>

        {items.map((f, i) => {
          const colors = {
            open:  { c: "var(--accent)", lbl: "待回收", lbg: "var(--accent)", ltc: "#fff" },
            near:  { c: "var(--warm)",   lbl: "临近",   lbg: "var(--warm)",   ltc: "#fff" },
            fresh: { c: "var(--accent)", lbl: "新埋",   lbg: "var(--accent-soft)", ltc: "var(--accent)" },
            done:  { c: "var(--ink-3)",  lbl: "已收 ✓", lbg: "var(--paper-2)",      ltc: "var(--ink-2)" },
          }[f.state];
          return (
            <div key={i} className="card" style={{ borderColor: f.state==="open"?"var(--accent-line)":"var(--line)", background: f.state==="open"?"var(--accent-soft)":"var(--surface)", opacity: f.state==="done"?0.7:1 }}>
              <div className="card-head">
                <span className="ttl" style={{ color: colors.c }}>⚐ {f.n}</span>
                <span className="chip" style={{ marginLeft: "auto", background: colors.lbg, color: colors.ltc, borderColor: "transparent", fontSize: 10 }}>{f.lbl}</span>
              </div>
              <p style={{ fontSize: 11.5, margin: "4px 0 0" }}>埋：{f.p}<br/>收：{f.r}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

function PanelStyle() {
  return (
    <>
      <div className="panel-section">
        <h5 className="row">风格记忆 <span className="end">自学 41 章 · 12.7 万字</span></h5>
        <div className="card">
          <h5 style={{ marginBottom: 6 }}>笔触指标</h5>
          {[
            { l: "平均句长", v: "14.2 字", t: "偏短 · 紧凑" },
            { l: "对话占比", v: "23%", t: "低 · 偏叙述" },
            { l: "比喻密度", v: "1.4 / 千字", t: "克制" },
            { l: "被动句", v: "3%", t: "几乎不用" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 12, margin: "4px 0" }}>
              <span style={{ color: "var(--ink-3)", width: 60 }}>{m.l}</span>
              <span className="serif" style={{ fontWeight: 600, color: "var(--accent)", width: 70 }}>{m.v}</span>
              <span style={{ color: "var(--ink-2)", flex: 1 }}>{m.t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h5>词频偏好</h5>
        <div style={{ display: "flex", gap: 6 }}>
          <div className="card" style={{ flex: 1, padding: "8px 10px", margin: 0 }}>
            <h5 style={{ margin: 0, color: "var(--green)" }}>多用</h5>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>压 · 冻 · 沉 · 刃<br />不应 · 半枚</p>
          </div>
          <div className="card" style={{ flex: 1, padding: "8px 10px", margin: 0, borderStyle: "dashed" }}>
            <h5 style={{ margin: 0, color: "var(--accent)" }}>少用</h5>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>突然 · 忽然<br />道 · 说 · 表示</p>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h5>人物语气样本</h5>
        {[
          { n: "沈砚", r: '句末多句号 · 不说"是" 说"嗯" · 不主动开口' },
          { n: "卫衍", r: '用"小子" · 半文半白 · 喜引《诗》' },
          { n: "白如霜", r: "句末偏问号 · 主语常省 · 爱用反问" },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding: "7px 10px" }}>
            <div className="card-head"><span className="ttl">👤 {c.n}</span><span className="meta">🔒 锁定</span></div>
            <p style={{ fontSize: 11.5, margin: "3px 0 0" }}>{c.r}</p>
          </div>
        ))}
      </div>

      <div className="panel-section">
        <div className="card warn">
          <div className="card-head"><span className="ttl" style={{ color: "var(--accent)" }}>✦ 本章相似度 87%</span></div>
          <p>风格匹配良好。第 3 段比喻密度偏高（4.1/千字），可精简。</p>
        </div>
      </div>
    </>
  );
}

function PanelWorld() {
  return (
    <>
      <div className="panel-section">
        <h5 className="row">设定库 · 42 条</h5>
        <div className="chips-row">
          <button className="chip accent">地点 11</button>
          <button className="chip">门派 7</button>
          <button className="chip">物品 9</button>
          <button className="chip">术语 12</button>
          <button className="chip">时间 3</button>
        </div>
      </div>

      <div className="panel-section">
        <div className="card warn">
          <div className="card-head"><span className="ttl" style={{ color: "var(--accent)" }}>✦ 建议</span></div>
          <p>「北疆军营 · 寒鸦坞」在 3 章中被提及但无内部布局。</p>
          <div className="card-actions">
            <button className="chip accent">AI 起草</button>
            <button className="chip">我自己写</button>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h5>地点 · 11</h5>
        {[
          { n: "雪夜城", g: "边境重镇", d: "城主季元世袭。冬日封城。", tag: "当前", cur: true },
          { n: "朔风城（已破）", g: "故乡", d: "沈砚出身地。三年前焚毁。", tag: "已废" },
          { n: "寒鸦坞", g: "军事", d: "← AI 建议补充", tag: "待补", dashed: true },
        ].map((p, i) => (
          <div key={i} className="card" style={{ padding: "8px 10px", borderColor: p.cur ? "var(--accent-line)" : "var(--line)", background: p.cur ? "var(--accent-soft)" : "var(--surface)", borderStyle: p.dashed ? "dashed" : "solid" }}>
            <div className="card-head">
              <span className="ttl" style={{ color: p.cur ? "var(--accent)" : "var(--ink)" }}>{p.n}</span>
              <span className="meta">{p.g}</span>
              <span className="chip" style={{ marginLeft: "auto", fontSize: 10 }}>{p.tag}</span>
            </div>
            <p style={{ fontSize: 11.5, margin: "3px 0 0" }}>{p.d}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function PanelRule({ onJump, onReplace }) {
  const hits = window.PROTO_DATA.SENSITIVE.map((s, i) => ({
    sev: s.sev, c: s.sev === "高" ? "var(--accent)" : s.sev === "中" ? "var(--warm)" : "var(--ink-3)",
    w: s.word, rep: s.rep, sug: s.note,
  }));
  return (
    <>
      <div className="panel-section">
        <h5 className="row">合规与口味 <span className="end">实时</span></h5>
        <div className="chips-row">
          <button className="chip accent">✓ 起点</button>
          <button className="chip accent">✓ 番茄</button>
          <button className="chip">七猫</button>
          <button className="chip">微读</button>
        </div>
      </div>

      <div className="panel-section">
        <h5>本章扫描</h5>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { l: "高危", v: 0, c: "var(--accent)" },
            { l: "中敏", v: 2, c: "var(--warm)" },
            { l: "低敏", v: 5, c: "var(--ink-2)" },
            { l: "AI 味", v: "低", c: "var(--green)" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ flex: 1, padding: "6px 8px", textAlign: "center" }}>
              <div className="serif" style={{ fontSize: 20, fontWeight: 600, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h5 className="row">命中 · 正文标黄 <span className="end">点"跳到"高亮</span></h5>
        {hits.map((it, i) => (
          <div key={i} className="card" style={{ padding: "8px 10px" }}>
            <div className="card-head">
              <span className="chip" style={{ background: it.c, color: "#fff", borderColor: "transparent", fontSize: 10 }}>{it.sev}</span>
              <span className="ttl" style={{ marginLeft: 6 }}>"{it.w}"</span>
              <span className="meta">→ {it.rep}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>↳ {it.sug}</div>
            <div className="card-actions">
              <button className="chip accent" onClick={() => onReplace && onReplace(it.w, it.rep)}>替换为「{it.rep}」</button>
              <button className="chip" onClick={() => onJump && onJump(it.w)}>跳到</button>
              <button className="chip">忽略</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

window.PROTO_PANELS = { PanelContext, PanelPeople, PanelFore, PanelStyle, PanelWorld, PanelRule };
