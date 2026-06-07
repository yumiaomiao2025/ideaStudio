/* global React, ReactDOM */
/* ============================================================
   网文studio 新书向导 — 6 步 0→1 引导
   每一步可独立预览，后 4 步真调用 AI
   ============================================================ */

const { useState, useEffect, useCallback, useRef, useMemo } = React;

const STEPS = [
  { id: 1, t: "题材 & 调性" },
  { id: 2, t: "主角 & 反派" },
  { id: 3, t: "卷 / 大纲" },
  { id: 4, t: "设定库" },
  { id: 5, t: "风格学习" },
  { id: 6, t: "写第 1 章" },
];

const GENRES = [
  { v: "玄幻", icon: "玄" },
  { v: "都市", icon: "都" },
  { v: "言情", icon: "情" },
  { v: "科幻", icon: "幻" },
  { v: "悬疑", icon: "悬" },
  { v: "历史", icon: "史" },
  { v: "武侠", icon: "侠" },
  { v: "灵异", icon: "灵" },
];

const MAIN_TYPES = [
  "成长 · 少年/少女的崛起",
  "复仇 · 旧账新算",
  "救世 · 命运之子",
  "探索 · 揭开世界真相",
  "宫斗 / 权谋",
  "种田 / 经营",
  "无系统 · 纯人物驱动",
];

const STYLE_PRESETS = [
  { id: "cold", n: "冷峻短句", d: "克制比喻 · 不写道说 · 雪铁意象" },
  { id: "ancient", n: "古风半文", d: "四字句多 · 半文半白 · 偶引诗词" },
  { id: "punchy", n: "网文爽快", d: "节奏快 · 钩子密 · 对话推进" },
  { id: "literary", n: "文艺细腻", d: "长句 · 心理 · 五感丰富" },
];

const initial = {
  // step 1
  genres: ["玄幻", "武侠"],
  subGenre: "少年成长向 · 不要无脑爽",
  tone: 30, // 0 爽 — 100 冷
  mainType: "成长 · 少年/少女的崛起",
  // step 2
  protagonist: "17 岁少年沈砚，话少，父亲死于北疆，怀里有半枚铜牌。",
  antagonist: "雪夜城主季元，持完整铜牌的另一半。",
  // step 3
  outline: null,        // { vols: [{title, sub, beats: [{n, text, fl}]}] }
  outlineLoading: false,
  // step 4
  entities: null,       // [{name, kind, desc, fl}]
  entitiesLoading: false,
  // step 5
  style: "cold",
  styleSample: null,    // string
  styleLoading: false,
  // step 6
  candidates: null,     // [{style, text}]
  candidatesLoading: false,
  selectedCandidate: null, // index
};

function toneLabel(v) {
  if (v < 25) return "甜宠 · 无脑爽 · 短平快";
  if (v < 45) return "偏爽快 · 钩子密集";
  if (v < 65) return "中性 · 起伏适度";
  if (v < 85) return "克制 · 慢热 · 留白多";
  return "极冷 · 文学性 · 反类型";
}

/* ============= AI calls ============= */

const SYSTEM_PROMPT_BASE = `你是一位资深网文编辑，帮作者把新书 0→1 起出来。要求：
- 输出严格按要求的格式
- 不要解释、不要 markdown、不要多余前后缀
- 中文写作，简洁有力
- 风格要贴合作者描述（短句 / 冷峻 / 留白）`;

function describeBookContext(s) {
  return `题材：${s.genres.join(" + ")}（${s.subGenre || "无子标签"}）
调性：${toneLabel(s.tone)}（${s.tone}/100，0=爽 100=冷）
主线：${s.mainType}
主角：${s.protagonist}
反派：${s.antagonist || "暂无"}`;
}

async function aiGenerateOutline(s) {
  const prompt = `${SYSTEM_PROMPT_BASE}

下面是一本新书的设定。请帮作者起 3 卷大纲，每卷 4-5 个节拍。

${describeBookContext(s)}

输出格式（每行一项，严格遵守）：
卷标题 | 副标题
- 节拍名 | 节拍内容 | F 或 N
- ...
卷标题 | 副标题
- ...

要求：
- 3 卷 · 每卷 4-5 个节拍
- 节拍名 2-4 字（开场 / 出门 / 导师 / 高潮 / 卷尾钩）
- 节拍内容 12-20 字
- F = 有伏笔/高潮节点（每卷 1-2 个），N = 普通
- 卷标题格式："卷一 · 名"
- 副标题格式："约 N 章 · 调性短描述"

例：
卷一 · 出山 | 约 12 章 · 慢热铺垫
- 开场 | 父死山下，半枚铜牌入怀 | F
- 出门 | 少年下山，雪夜遭伏 | N
- 师承 | 老者出剑，传授残篇 | N
- 出关 | 江湖初战，小有名声 | N
- 卷尾 | 北疆密令，铜牌身份暴露 | F

只输出上述格式，不要 JSON，不要解释。`;

  try {
    const result = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return parseOutlineText(result || "");
  } catch (e) {
    console.warn("aiGenerateOutline failed:", e.message);
    return null;
  }
}

function parseOutlineText(text) {
  // Each "卷X" line starts a new vol. Each "- " line is a beat.
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const vols = [];
  let cur = null;
  for (const line of lines) {
    if (line.startsWith("- ") || line.startsWith("· ")) {
      if (!cur) continue;
      const body = line.slice(2).trim();
      const parts = body.split("|").map(p => p.trim());
      if (parts.length < 2) continue;
      cur.beats.push({
        n: parts[0],
        text: parts[1],
        fl: (parts[2] || "").toUpperCase().startsWith("F"),
      });
    } else if (line.startsWith("卷")) {
      const parts = line.split("|").map(p => p.trim());
      cur = { title: parts[0], sub: parts[1] || "", beats: [] };
      vols.push(cur);
    }
  }
  return vols.length ? vols.slice(0, 3) : null;
}

async function aiExtractEntities(s) {
  const outlineText = s.outline
    ? s.outline.map(v => `${v.title}（${v.sub}）\n` + v.beats.map(b => `  · ${b.n}：${b.text}${b.fl ? " ⚐" : ""}`).join("\n")).join("\n\n")
    : "（暂未生成大纲）";

  const prompt = `${SYSTEM_PROMPT_BASE}

下面是一本网文的设定 + 大纲。请帮作者抽取关键的实体（人物 / 地点 / 物品 / 术语）到设定库。

${describeBookContext(s)}

大纲：
${outlineText}

输出格式（每行一个实体，严格遵守）：
名称 | 类型 | 描述 | F 或 N

类型 = 人物 / 地点 / 物品 / 术语
F = 关键伏笔（铜牌之类的关键道具应为 F），N = 普通
描述 12-22 字

例：
沈砚 | 人物 | 17 岁少年，话少，持半枚铜牌 | F
雪夜城 | 地点 | 北疆边境重镇，季元世袭 | N

要求：
- 6-8 个实体
- 必须包含主角、反派
- 至少 1 个地点
- 至少 1 个伏笔物品（F）
- 不要重复

只输出上述格式，不要 JSON，不要解释。`;

  try {
    const result = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return parseEntitiesText(result || "");
  } catch (e) {
    console.warn("aiExtractEntities failed:", e);
    return null;
  }
}

function parseEntitiesText(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const ents = [];
  for (const line of lines) {
    if (!line.includes("|")) continue;
    const parts = line.split("|").map(p => p.trim());
    if (parts.length < 3) continue;
    ents.push({
      name: parts[0].replace(/^[-·•]\s*/, ""),
      kind: parts[1],
      desc: parts[2],
      fl: (parts[3] || "").toUpperCase().startsWith("F"),
    });
  }
  return ents.length ? ents : null;
}

async function aiStyleSample(s) {
  const styleP = STYLE_PRESETS.find(p => p.id === s.style);
  const prompt = `${SYSTEM_PROMPT_BASE}

请按这个风格写一段 60-80 字的示例（用于演示笔触）：
风格：${styleP.n}（${styleP.d}）
内容主题：主角"${s.protagonist.slice(0, 30)}"出场的一个画面。

只输出这段示例，不要标题，不要解释，不要引号包裹。`;
  try {
    const result = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return (result || "").trim().replace(/^["「『]/, "").replace(/["」』]$/, "").slice(0, 200);
  } catch (e) {
    return null;
  }
}

async function aiOpenings(s) {
  const styleP = STYLE_PRESETS.find(p => p.id === s.style);
  const firstVol = s.outline?.[0];
  const firstBeat = firstVol?.beats?.[0];

  const prompt = `${SYSTEM_PROMPT_BASE}

为这本书的第 1 章写 3 个开头候选。每个候选 100-150 字（注意 token 限制，保持简短）。

${describeBookContext(s)}

第 1 章的核心节拍：${firstBeat?.n || "开场"} — ${firstBeat?.text || "主角出场"}

风格：${styleP.n}（${styleP.d}）

输出格式（严格按这种格式，3 个候选用 ---- 分隔）：
风格标签 5-8 字
正文 100-150 字
----
风格标签
正文
----
风格标签
正文

要求：
- 三个候选笔触明显不同（如：冷峻短句 / 钩子型 / 古风节奏）
- 每个开头自带钩子
- 不要重复开篇套路（如"天空下着雨"）
- 主角的关键设定要在某一两个候选里隐藏出现
- 不要标题，不要序号，不要引号

直接开始输出第一个风格标签。`;

  try {
    const result = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    return parseOpeningsText(result || "");
  } catch (e) {
    console.warn("aiOpenings failed:", e);
    return null;
  }
}

function parseOpeningsText(text) {
  const blocks = text.split(/\n----+\n?|\n-{3,}\n?/).map(b => b.trim()).filter(Boolean);
  const candidates = [];
  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const style = lines[0].replace(/^候选\s*\d+\s*[·:：]?\s*/, "");
    const body = lines.slice(1).join(" ").trim();
    if (!body) continue;
    candidates.push({ style: style.slice(0, 20), text: body });
  }
  return candidates.length ? candidates.slice(0, 3) : null;
}

/* ============= UI Components ============= */

function Stepper({ step, setStep, completedThrough }) {
  return (
    <div className="stepper">
      <div className="stepper-inner">
        {STEPS.map((s, i) => {
          const done = s.id < step;
          const cur = s.id === step;
          const reachable = s.id <= completedThrough + 1;
          return (
            <React.Fragment key={s.id}>
              <div
                className={"step" + (done ? " done" : "") + (cur ? " current" : "")}
                onClick={() => reachable && setStep(s.id)}
                style={{ cursor: reachable ? "pointer" : "not-allowed", opacity: reachable ? 1 : 0.5 }}
              >
                <div className="step-num">{done ? "✓" : s.id}</div>
                <div className="step-label">{s.t}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={"step-bar" + (done ? " done" : "")}/>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function StepGenre({ s, set }) {
  const toggle = (v) => set({ genres: s.genres.includes(v) ? s.genres.filter(x => x !== v) : [...s.genres, v] });
  return (
    <div className="panel">
      <h1>写本什么样的书？</h1>
      <p className="lede">不用想太多，后面随时能改。第一步定大方向。</p>

      <h2>题材 <span className="opt">· 可多选</span></h2>
      <div className="chip-row">
        {GENRES.map(g => (
          <span
            key={g.v}
            className={"chip" + (s.genres.includes(g.v) ? " selected" : "")}
            onClick={() => toggle(g.v)}
          >{g.icon} · {g.v}</span>
        ))}
      </div>

      <h2>更具体一点 <span className="opt">· 一句话</span></h2>
      <input
        type="text"
        value={s.subGenre}
        onChange={e => set({ subGenre: e.target.value })}
        placeholder="比如：少年成长向 · 不要无脑爽"
      />

      <h2>调性 <span className="opt">· 爽 ↔ 冷</span></h2>
      <div className="slider-row">
        <span className="label">爽</span>
        <input type="range" min="0" max="100" value={s.tone} onChange={e => set({ tone: +e.target.value })} />
        <span className="label right">冷</span>
      </div>
      <div className="slider-summary">{toneLabel(s.tone)}</div>

      <h2>主线类型</h2>
      <div className="chip-row">
        {MAIN_TYPES.map(m => (
          <span
            key={m}
            className={"chip" + (s.mainType === m ? " selected" : "")}
            onClick={() => set({ mainType: m })}
          >{m}</span>
        ))}
      </div>
    </div>
  );
}

function StepProtagonist({ s, set }) {
  return (
    <div className="panel">
      <h1>主角 & 反派</h1>
      <p className="lede">一句话就够。AI 会在后面的步骤里把它扩充成完整的人物卡。</p>

      <h2>主角 <span className="req">必填</span></h2>
      <textarea
        value={s.protagonist}
        onChange={e => set({ protagonist: e.target.value })}
        placeholder="例：17 岁少年沈砚，话少，父亲死于北疆，怀里有半枚铜牌。"
        rows={3}
      />
      <div className="input-hint">
        <span>· 越具体越好（动作、关键物品、年龄、口癖）</span>
        <span>{s.protagonist.length} / 200</span>
      </div>

      <h2>反派 <span className="opt">· 可选</span></h2>
      <textarea
        value={s.antagonist}
        onChange={e => set({ antagonist: e.target.value })}
        placeholder="例：雪夜城主季元，持完整铜牌的另一半。"
        rows={2}
      />

      <h2>下一步 AI 会用上面的信息做什么？</h2>
      <ul style={{ fontFamily: "Noto Serif SC, serif", fontSize: 14, color: "var(--ink-2)", lineHeight: 1.85, paddingLeft: 18 }}>
        <li>起 3 卷大纲（每卷 5-6 个节拍）</li>
        <li>抽取人物 / 地点 / 物品到设定库，自动标记伏笔</li>
        <li>按你选的"调性"决定卷长（爽 = 短卷；冷 = 慢热）</li>
        <li>最后给 3 个开头候选，挑一个直接开写</li>
      </ul>
    </div>
  );
}

function AILoading({ msg }) {
  return (
    <div className="ai-loading">
      <div className="dots">
        <span className="dot"/><span className="dot"/><span className="dot"/>
      </div>
      <div>{msg}</div>
    </div>
  );
}

function StepOutline({ s, set, formState }) {
  const [running, setRunning] = useState(false);
  const generate = async () => {
    setRunning(true);
    set({ outlineLoading: true });
    const out = await aiGenerateOutline(formState);
    set({ outline: out, outlineLoading: false });
    setRunning(false);
  };

  useEffect(() => {
    // Auto-generate on first arrival
    if (!s.outline && !s.outlineLoading) {
      generate();
    }
  }, []);

  return (
    <div className="panel" style={{ maxWidth: 1000 }}>
      <h1>AI 起 3 卷大纲</h1>
      <p className="lede">根据你前两步的输入。可以改稳健 / 改大胆 / 再起一版。每张卡都能直接编辑。</p>

      <div className="pill-row">
        <span className="pill">{s.genres.join(" + ")}</span>
        <span className="pill">{toneLabel(s.tone)}</span>
        <span className="pill">{s.mainType.split(" · ")[0]}</span>
        <span className="pill warm">主角：{s.protagonist.slice(0, 16)}…</span>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "10px 0 0" }}>
        <button className="ai-helper" onClick={generate} disabled={running}>
          {running ? "✦ 生成中…" : "✦ 再起一版"}
        </button>
        <button className="chip" onClick={() => { set({ tone: Math.max(0, s.tone - 20) }); generate(); }} disabled={running}>更稳健</button>
        <button className="chip" onClick={() => { set({ tone: Math.min(100, s.tone + 20) }); generate(); }} disabled={running}>更大胆</button>
        <button className="chip" onClick={() => generate()} disabled={running}>压紧节奏</button>
      </div>

      {running && <AILoading msg="读取你的设定 · 起 3 卷大纲 · 约需 5-10 秒…" />}

      {!running && s.outline && (
        <div className="vol-grid">
          {s.outline.slice(0, 3).map((v, i) => (
            <div key={i} className={"vol-card" + (i === 1 ? " middle" : "")}>
              <h3>{v.title}</h3>
              <div className="sub">{v.sub}</div>
              {v.beats?.map((b, j) => (
                <div key={j} className="beat">
                  <div className="beat-num">{b.n?.slice(0, 2) || j+1}</div>
                  <div className="beat-text">
                    {b.text} {b.fl && <span className="fl">⚐</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!running && !s.outline && (
        <div style={{ padding: 20, textAlign: "center", color: "var(--ink-3)" }}>
          AI 暂时没返回结果，请点"再起一版"重试。
        </div>
      )}
    </div>
  );
}

function StepWorld({ s, set, formState }) {
  const [running, setRunning] = useState(false);
  const generate = async () => {
    setRunning(true);
    set({ entitiesLoading: true });
    const ents = await aiExtractEntities(formState);
    set({ entities: ents, entitiesLoading: false });
    setRunning(false);
  };

  useEffect(() => {
    if (!s.entities && !s.entitiesLoading) generate();
  }, []);

  return (
    <div className="panel" style={{ maxWidth: 900 }}>
      <h1>抽取设定库</h1>
      <p className="lede">AI 从你的描述 + 大纲里挑出关键人物 / 地点 / 物品。点 ⚐ 标记伏笔，写到时会被自动追踪。</p>

      <div style={{ display: "flex", gap: 8, margin: "0 0 14px" }}>
        <button className="ai-helper" onClick={generate} disabled={running}>
          {running ? "✦ 抽取中…" : "✦ 重新抽取"}
        </button>
        <button className="chip" disabled={running}>+ 我来加一个</button>
      </div>

      {running && <AILoading msg="读取大纲 · 抽取关键设定 · 约需 3-6 秒…" />}

      {!running && s.entities && (
        <div className="entity-grid">
          {s.entities.map((e, i) => (
            <div key={i} className={"entity-card" + (e.fl ? " fl" : "")}>
              <h4>
                {e.fl && <span style={{ color: "var(--warm)" }}>⚐ </span>}
                {e.name}
                <span className="kind">· {e.kind}</span>
              </h4>
              <p>{e.desc}</p>
              <div className="actions">
                <button>编辑</button>
                <button>{e.fl ? "取消伏笔" : "标记伏笔"}</button>
                <button>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepStyle({ s, set, formState }) {
  const [running, setRunning] = useState(false);
  const generate = async (newStyle) => {
    if (newStyle) set({ style: newStyle });
    setRunning(true);
    set({ styleLoading: true });
    // Pass the new style or current
    const sample = await aiStyleSample({ ...formState, style: newStyle || s.style });
    set({ styleSample: sample, styleLoading: false });
    setRunning(false);
  };

  useEffect(() => {
    if (!s.styleSample && !s.styleLoading) generate();
  }, []);

  return (
    <div className="panel">
      <h1>风格学习</h1>
      <p className="lede">选一个起手风格，或上传一两章自己的旧稿让 AI 学。后面写作时，AI 续写会遵守这个风格。</p>

      <h2>起手风格</h2>
      <div className="chip-row">
        {STYLE_PRESETS.map(p => (
          <span
            key={p.id}
            className={"chip" + (s.style === p.id ? " selected" : "")}
            onClick={() => generate(p.id)}
          >{p.n}</span>
        ))}
      </div>

      <h2>风格样本 <span className="opt">· AI 按你选的风格写一段</span></h2>
      {running && <AILoading msg="AI 正在按风格起一段示例…" />}
      {!running && s.styleSample && (
        <div className="vol-card" style={{ padding: "18px 22px" }}>
          <div className="sub" style={{ marginBottom: 8 }}>
            ✦ 主角出场 · 风格：{STYLE_PRESETS.find(p => p.id === s.style)?.n}
          </div>
          <div style={{ fontFamily: "Noto Serif SC, serif", fontSize: 15, lineHeight: 1.9, textIndent: "2em" }}>
            {s.styleSample}
          </div>
        </div>
      )}

      <h2>上传自己的稿件 <span className="opt">· 让 AI 学你的笔触</span></h2>
      <div style={{
        border: "1.5px dashed var(--line-2)", borderRadius: 8,
        padding: 24, textAlign: "center", color: "var(--ink-3)",
        background: "var(--surface)",
      }}>
        <div style={{ fontSize: 14, marginBottom: 4 }}>📄 拖入 .txt / .epub / .docx</div>
        <div style={{ fontSize: 12 }}>仅本地学习风格，不上传到任何平台</div>
      </div>
    </div>
  );
}

function StepOpening({ s, set, formState }) {
  const [running, setRunning] = useState(false);
  const generate = async () => {
    setRunning(true);
    set({ candidatesLoading: true });
    const c = await aiOpenings(formState);
    set({ candidates: c, candidatesLoading: false, selectedCandidate: null });
    setRunning(false);
  };

  useEffect(() => {
    if (!s.candidates && !s.candidatesLoading) generate();
  }, []);

  return (
    <div className="panel" style={{ maxWidth: 820 }}>
      <h1>三个开头 · 挑一个开写</h1>
      <p className="lede">AI 用你前面所有的设定 + 风格写了 3 个开头。选一个会带入正式编辑器，作为第 1 章的起点。</p>

      <div style={{ display: "flex", gap: 8, margin: "0 0 14px" }}>
        <button className="ai-helper" onClick={generate} disabled={running}>
          {running ? "✦ 生成中…" : "✦ 再来 3 版"}
        </button>
        <button className="chip" disabled={running}>我自己起开头</button>
      </div>

      {running && <AILoading msg="AI 起 3 种笔触的开头 · 约需 8-15 秒…" />}

      {!running && s.candidates && s.candidates.map((c, i) => (
        <div
          key={i}
          className={"candidate" + (s.selectedCandidate === i ? " selected" : "")}
          onClick={() => set({ selectedCandidate: i })}
        >
          <div className="candidate-head">
            <span className="candidate-num">候选 {i + 1}</span>
            <span className="candidate-style">{c.style}</span>
            {s.selectedCandidate === i && <span className="candidate-check">↩ 已选</span>}
          </div>
          <div className="candidate-text">{c.text}</div>
          {s.selectedCandidate === i && (
            <div className="candidate-actions">
              <button onClick={e => e.stopPropagation()}>只取第一句</button>
              <button onClick={e => e.stopPropagation()}>再写一版相似的</button>
              <button onClick={e => e.stopPropagation()}>展开为 600 字</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============= Recap sidebar ============= */
function Recap({ s, step }) {
  return (
    <aside className="recap">
      <h3>起手锦囊</h3>
      <div className="sub">已收集 {step - 1} 步 · 共 6 步</div>

      <div className="recap-section">
        <h4>题材 · 调性</h4>
        {s.genres?.length ? (
          <>
            <div>{s.genres.map(g => <span key={g} className="recap-tag">{g}</span>)}</div>
            <div className="val" style={{ marginTop: 4 }}>{toneLabel(s.tone)}</div>
            {s.subGenre && <div className="val muted" style={{ fontSize: 12 }}>{s.subGenre}</div>}
          </>
        ) : <div className="pending">还没填</div>}
      </div>

      <div className="recap-section">
        <h4>主角</h4>
        {s.protagonist ? (
          <div className="val">{s.protagonist}</div>
        ) : <div className="pending">还没填</div>}
        {s.antagonist && (
          <>
            <h4 style={{ marginTop: 8 }}>反派</h4>
            <div className="val">{s.antagonist}</div>
          </>
        )}
      </div>

      <div className="recap-section">
        <h4>大纲</h4>
        {s.outline ? (
          <>
            {s.outline.slice(0, 3).map((v, i) => (
              <div key={i} className="val" style={{ marginBottom: 2 }}>
                · {v.title}
              </div>
            ))}
            <div className="val muted" style={{ fontSize: 11, marginTop: 4 }}>
              {s.outline.reduce((acc, v) => acc + (v.beats?.length || 0), 0)} 个节拍
            </div>
          </>
        ) : <div className="pending">{step >= 3 ? "AI 思考中…" : "等到 step 3"}</div>}
      </div>

      <div className="recap-section">
        <h4>设定库</h4>
        {s.entities ? (
          <div>
            {s.entities.slice(0, 6).map((e, i) => (
              <span key={i} className={"recap-tag" + (e.fl ? " fl" : "")}>
                {e.fl ? "⚐ " : ""}{e.name}
              </span>
            ))}
          </div>
        ) : <div className="pending">{step >= 4 ? "AI 思考中…" : "等到 step 4"}</div>}
      </div>

      <div className="recap-section">
        <h4>风格</h4>
        {s.style && step >= 5 ? (
          <div className="val">
            {STYLE_PRESETS.find(p => p.id === s.style)?.n}
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
              {STYLE_PRESETS.find(p => p.id === s.style)?.d}
            </div>
          </div>
        ) : <div className="pending">等到 step 5</div>}
      </div>

      <div className="recap-section">
        <h4>第 1 章</h4>
        {s.candidates && s.selectedCandidate !== null ? (
          <div className="val">
            <span className="recap-tag accent">候选 {s.selectedCandidate + 1} ✓</span>
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              {s.candidates[s.selectedCandidate]?.style}
            </div>
          </div>
        ) : <div className="pending">等到 step 6</div>}
      </div>
    </aside>
  );
}

/* ============= App ============= */
function App() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState(initial);
  const completedThrough = useMemo(() => {
    if (state.selectedCandidate !== null) return 6;
    if (state.styleSample) return 5;
    if (state.entities) return 4;
    if (state.outline) return 3;
    if (state.protagonist?.length > 4) return 2;
    if (state.genres?.length) return 1;
    return 0;
  }, [state]);

  const setS = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const canGoNext = useMemo(() => {
    if (step === 1) return state.genres.length > 0;
    if (step === 2) return state.protagonist.length > 4;
    if (step === 6) return state.selectedCandidate !== null;
    return true;
  }, [step, state]);

  const handleFinish = () => {
    // Save to localStorage for prototype to pick up
    try {
      const stash = {
        title: state.outline?.[0]?.title?.split(" · ")[1] || "新书",
        firstChapter: state.candidates?.[state.selectedCandidate]?.text || "",
        genres: state.genres,
        tone: state.tone,
        protagonist: state.protagonist,
        outline: state.outline,
        entities: state.entities,
        style: state.style,
        ts: Date.now(),
      };
      localStorage.setItem("xws_onboard", JSON.stringify(stash));
    } catch (e) { /* noop */ }
    // Jump to prototype
    window.location.href = encodeURI("网文studio · Prototype.html") + "?from=onboard";
  };

  return (
    <>
      <div className="topbar">
        <span className="brand"><span className="brand-dot"/>网文studio</span>
        <span className="crumb">· 新书向导 · 步骤 <b>{step}</b>/6</span>
        <div className="right">
          <span className="muted" style={{ fontSize: 12 }}>≈ 18 分钟可走完</span>
          <button className="ghost-btn">保存草稿</button>
          <button className="ghost-btn">退出</button>
        </div>
      </div>

      <Stepper step={step} setStep={setStep} completedThrough={completedThrough} />

      <div className="body">
        <div className="center">
          {step === 1 && <StepGenre s={state} set={setS} />}
          {step === 2 && <StepProtagonist s={state} set={setS} />}
          {step === 3 && <StepOutline s={state} set={setS} formState={state} />}
          {step === 4 && <StepWorld s={state} set={setS} formState={state} />}
          {step === 5 && <StepStyle s={state} set={setS} formState={state} />}
          {step === 6 && <StepOpening s={state} set={setS} formState={state} />}
        </div>
        <Recap s={state} step={step} />
      </div>

      <div className="nav-foot">
        <button className="btn" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          ‹ 上一步
        </button>
        <button className="btn" onClick={() => setStep(Math.min(6, step + 1))} disabled={!canGoNext || step === 6}>
          跳过
        </button>
        <span className="hint">
          {step === 6 ? "选一个候选 · 然后进入正式编辑器" :
           step === 5 ? "下一步 = AI 起 3 个开头" :
           step === 4 ? "下一步 = 喂养 AI 的写作风格" :
           step === 3 ? "下一步 = AI 抽取设定库" :
           step === 2 ? "下一步 = AI 起 3 卷大纲（5-10 秒）" :
                       "下一步 = 主角 & 反派"}
        </span>
        {step < 6 ? (
          <button className="btn primary" onClick={() => setStep(step + 1)} disabled={!canGoNext}>
            下一步 ›
          </button>
        ) : (
          <button className="btn primary" onClick={handleFinish} disabled={!canGoNext}>
            🪶 开始写第 1 章 ›
          </button>
        )}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
