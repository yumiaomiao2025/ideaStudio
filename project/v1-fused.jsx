/* global React */
/* ============================================================
   v1 主方案：融合 4 个方向的亮点
   - 中央：② 的"宣纸"舞台 + 行内续写（④）
   - 左侧：① 的章节树（可收起为 rail）
   - 右侧：④ 的"AI 看到的上下文"（可收起为 rail）
   - 顶部：[写作 | 看板] 切换（③ 入口）
   - 召唤 AI：⌘K 浮层（②）+ 行内 ghost-text（④）+ 聊天抽屉（①）
   ============================================================ */

/* ---- shared bits reused/local (avoid name collisions) ------- */
const v1FakeText = ({ lines = 6, indent = true }) =>
<div>
    {Array.from({ length: lines }).map((_, i) =>
  <div key={i} style={{
    height: 9, margin: "8px 0",
    background: "#1a1a1a",
    opacity: i === lines - 1 ? 0.35 : 0.78,
    width: i === 0 && indent ? "62%" : i === lines - 1 ? `${30 + Math.random() * 30}%` : `${78 + Math.random() * 18}%`,
    borderRadius: 2
  }} />
  )}
  </div>;


const V1Para = ({ children, dim = false }) =>
<div className="serif" style={{
  fontSize: 15, lineHeight: "30px",
  color: dim ? "var(--ink-3)" : "var(--ink)",
  textIndent: "2em", marginBottom: 6
}}>{children}</div>;


const V1Annot = ({ x, y, w = 180, children, rotate = -3 }) =>
<div className="annot" style={{ left: x, top: y, width: w, transform: `rotate(${rotate}deg)` }}>
    <span className="lbl">{children}</span>
  </div>;


/* ===== Main: V1 Fused ============================================ */
function V1Main({
  paper = "#fafaf6",
  ink = "#1a1a1a",
  ink2 = "#4a4a4a",
  accent = "#d9542b",
  showGhost = true,
  showPalette = false,
  showBeat = true,
  leftMode = "rail", // "rail" | "drawer"
  rightMode = "drawer", // "rail" | "drawer"
  variantLabel = null,
  bg = null
}) {
  const isDark = paper === "#1a1a1a";
  const surface = isDark ? "#26241f" : "#fff";
  const surface2 = isDark ? "#2f2c26" : "#fafaf6";
  const ruleColor = isDark ? "#e9e5d8" : "#1a1a1a";
  const muted = isDark ? "#a8a39a" : "#8a8a8a";
  const leftWidth = leftMode === "drawer" ? 240 : 58;
  const rightWidth = rightMode === "drawer" ? 318 : 58;

  return (
    <div className="ab" style={{ background: bg || paper, color: ink }}>
      {variantLabel &&
      <div className="sk-ribbon" style={{ position: "absolute", left: 14, top: -12, zIndex: 5 }}>{variantLabel}</div>
      }

      {/* topbar */}
      <div className="titlebar" style={{
        background: surface2, borderColor: ruleColor, color: ink,
        height: 40
      }}>
        <span className="lights"><i style={{ borderColor: ruleColor, background: isDark ? "transparent" : "#fff" }} /><i style={{ borderColor: ruleColor, background: isDark ? "transparent" : "#fff" }} /><i style={{ borderColor: ruleColor, background: isDark ? "transparent" : "#fff" }} /></span>
        <span className="brush" style={{ fontSize: 22, color: ink }}>小说studio</span>
        <span className="hand-en" style={{ fontSize: 15, color: muted }}>· 《剑入星海》</span>
        <span style={{ flex: 1 }} />
        {/* view toggle */}
        <div className="sk-box" style={{ padding: "2px 4px", display: "flex", gap: 2, background: surface, borderColor: ruleColor, color: ink }}>
          <span className="hand-en" style={{
            padding: "2px 10px", background: accent, color: "#fff", borderRadius: 4
          }}>✎ 写作</span>
          <span className="hand-en" style={{ padding: "2px 10px", color: muted }}>▦ 看板</span>
          <span className="hand-en" style={{ padding: "2px 10px", color: muted }}>☱ 时间线</span>
        </div>
        <span className="hand-en" style={{ color: muted, fontSize: 14 }}>⌘K 任何指令</span>
        <span className="hand-en" style={{ color: muted, fontSize: 14 }}>✓ 已同步</span>
        <span className="stamp" style={{ width: 32, height: 32, fontSize: 10, borderColor: accent, color: accent }}>小说<br />studio</span>
      </div>

      {/* ============ LEFT ============= */}
      {leftMode === "rail" ?
      <div className="sk-box" style={{ position: "absolute", left: 14, top: 54, width: leftWidth, bottom: 14, padding: "12px 0", background: surface, borderColor: ruleColor, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {[
        ["☰", "章节", true], ["✦", "设定", false], ["⌗", "大纲", false], ["⏱", "历史", false], ["☻", "人物", false], ["⚑", "伏笔", false]].
        map(([i, t, active], k) =>
        <div key={k} style={{ textAlign: "center" }}>
              <div className="hand-en" style={{ fontSize: 18, color: active ? accent : ink2 }}>{i}</div>
              <div className="hand-cn" style={{ fontSize: 10, color: active ? accent : muted, marginTop: 2 }}>{t}</div>
            </div>
        )}
          <span style={{ flex: 1 }} />
          <div className="hand-en" style={{ fontSize: 16, color: muted }}>›</div>
        </div> :

      <div className="sk-box" style={{ position: "absolute", left: 14, top: 54, width: leftWidth, bottom: 14, padding: "12px 12px", background: surface, borderColor: ruleColor, overflow: "hidden", color: ink }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="hand-cn" style={{ fontSize: 17 }}>章节目录</span>
            <span className="hand-en" style={{ fontSize: 14, color: muted }}>‹ 收起</span>
          </div>
          <div className="squiggle" />
          <input className="hand-en" placeholder="🔍 搜索章节 / @人物" style={{ width: "100%", padding: "3px 8px", border: "1.25px dashed " + ruleColor, borderRadius: 6, background: "transparent", fontSize: 13, margin: "8px 0", color: ink }} />

          <div style={{ height: "calc(100% - 100px)", overflow: "hidden" }}>
            {[
          { t: "卷一 · 少年入江湖", open: false, kids: 6, w: "19.2k" },
          { t: "卷二 · 雪夜入城", open: true, current: true, kids: [
            { t: "41 城门密谈", w: "3.1k", done: true },
            { t: "42 雪夜城下", w: "1.2k", current: true },
            { t: "43 城主之女", w: "0.8k", draft: true },
            { t: "+ 新章节", add: true }]
          },
          { t: "卷三 · 北望（规划）", open: false }].
          map((c, i) =>
          <div key={i} style={{ marginBottom: 8 }}>
                <div className="hand-cn" style={{ fontSize: 14, color: c.current ? accent : ink, display: "flex" }}>
                  <span>{c.open ? "▾" : "▸"} {c.t}</span>
                  <span style={{ flex: 1 }} />
                  <span className="hand-en" style={{ fontSize: 12, color: muted }}>{c.w}</span>
                </div>
                {c.open && Array.isArray(c.kids) && c.kids.map((k, j) =>
            <div key={j} className="hand-en" style={{
              fontSize: 14, margin: "3px 0 3px 16px",
              color: k.current ? accent : k.draft ? muted : ink2,
              display: "flex", alignItems: "center", gap: 6
            }}>
                    {k.add ? <span style={{ color: accent }}>{k.t}</span> :
              <>
                        <span className={"dot" + (k.current ? "" : " hollow")} style={{ background: k.current ? ink : "transparent", borderColor: ink }} />
                        <span style={{ flex: 1 }}>{k.t}</span>
                        <span style={{ fontSize: 12, color: muted }}>{k.w}</span>
                      </>
              }
                  </div>
            )}
              </div>
          )}
          </div>

          <div style={{ position: "absolute", left: 12, right: 12, bottom: 10 }}>
            <div className="sk-rule dashed" style={{ borderColor: ruleColor }} />
            <div className="hand-cn" style={{ fontSize: 13, marginTop: 6 }}>今日 · 2,140 字</div>
            <div style={{ height: 6, background: isDark ? "#3a362f" : "#eee", borderRadius: 99, overflow: "hidden", marginTop: 4 }}>
              <div style={{ height: "100%", width: "71%", background: accent }} />
            </div>
            <div className="hand-en" style={{ fontSize: 12, color: muted, marginTop: 2 }}>目标 3,000 · 还差 860</div>
          </div>
        </div>
      }

      {/* ============ CENTER: paper ============= */}
      <div style={{ position: "absolute", left: leftWidth + 22, right: rightWidth + 22, top: 54, bottom: 14 }}>
        {/* chapter beat strip (③ 的 AI 节拍) */}
        {showBeat &&
        <div className="sk-box thin" style={{ padding: "6px 12px", background: isDark ? "#26241f" : "#fff8e8", borderColor: accent, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <span className="hand-en" style={{ color: accent, fontSize: 15 }}>♪ 章节节拍</span>
            <span className="hand-cn" style={{ fontSize: 13, color: ink, flex: 1 }}>已铺垫 3 处冲突，建议结尾给一个"喘息"段落让 43 章发力。</span>
            <span className="tag" style={{ background: surface, borderColor: ruleColor, color: ink }}>采纳</span>
            <span className="tag" style={{ background: surface, borderColor: ruleColor, color: ink }}>忽略</span>
            <span className="tag" style={{ background: accent, borderColor: accent, color: "#fff" }}>AI 起 3 版</span>
          </div>
        }

        {/* paper */}
        <div className="sk-box fill-w corner-curl" style={{
          position: "absolute", left: 0, right: 0,
          top: showBeat ? 42 : 0, bottom: 0,
          padding: "24px 56px", overflow: "hidden",
          background: surface, borderColor: ruleColor, color: ink
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div className="brush" style={{ fontSize: 32, color: ink }}>第 42 章 · 雪夜城下</div>
            <div className="hand-en" style={{ fontSize: 14, color: muted }}>1,243 / 3,000 字 · 41%</div>
          </div>
          <div className="squiggle accent" style={{ margin: "6px 0 18px" }} />

          <V1Para>雪线压着城墙，像一道压了三天三夜的眉。沈砚把斗篷往下扯，露出半张冻青的脸——城门口的灯笼在风里晃，像是要熄，又像是有人正在里头喘气。</V1Para>
          <V1Para>"外乡人？" 守门兵的矛尖斜下来，带着雪。</V1Para>
          <V1Para>沈砚没答话。他从怀里摸出半枚<span style={{ borderBottom: "1.25px dotted " + accent, paddingBottom: 1 }}>铜牌</span>，铜牌缺角的地方还沾着旧血。</V1Para>

          {/* ghost text */}
          {showGhost &&
          <V1Para>
              守门兵的脸色一下变了。
              <span style={{ color: accent, background: isDark ? "rgba(217,84,43,0.18)" : "rgba(217,84,43,0.10)", padding: "0 2px", borderRadius: 3 }}>
                {" "}他喉头滚了一下，把矛尖收得比抽出来还快，又下意识地往身后看了一眼——城楼上那盏灯，今夜竟没人去添油。
              </span>
              <span className="hand-en" style={{ color: accent, marginLeft: 6, fontSize: 13 }}>⇥ Tab 接受 · Esc 拒绝 · ⌥⏎ 换一版</span>
            </V1Para>
          }

          {/* bottom toolbar */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, borderTop: "1.5px solid " + ruleColor, height: 34, padding: "6px 16px", display: "flex", alignItems: "center", gap: 14, background: surface2 }}>
            <span className="hand-en" style={{ color: ink2 }}>B  I  U</span>
            <span style={{ color: muted }}>|</span>
            <span className="hand-en" style={{ color: ink2 }}>"对话"</span>
            <span className="hand-en" style={{ color: ink2 }}>— 分隔 —</span>
            <span className="hand-en" style={{ color: ink2 }}>⚐ 伏笔</span>
            <span style={{ flex: 1 }} />
            <span className="tag" style={{ background: accent, borderColor: accent, color: "#fff" }}>敏感词 0</span>
            <span className="hand-en" style={{ color: muted }}>衬线 · 17px · 单倍行距</span>
          </div>
        </div>
      </div>

      {/* ============ RIGHT ============= */}
      {rightMode === "rail" ?
      <div className="sk-box" style={{ position: "absolute", right: 14, top: 54, width: rightWidth, bottom: 14, padding: "12px 0", background: surface, borderColor: ruleColor, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }} data-comment-anchor="7139b8b9a2-div-217-9">
          {[
        ["✦", "上下文", true], ["人", "人物", false], ["☱", "设定", false], ["⚐", "伏笔", false], ["✎", "风格", false], ["⚖", "合规", false]].
        map(([i, t, active], k) =>
        <div key={k} style={{ textAlign: "center" }}>
              <div className="hand-en" style={{ fontSize: 18, color: active ? accent : ink2 }}>{i}</div>
              <div className="hand-cn" style={{ fontSize: 10, color: active ? accent : muted, marginTop: 2 }}>{t}</div>
            </div>
        )}
          <span style={{ flex: 1 }} />
          <div className="hand-en" style={{ fontSize: 16, color: muted }}>‹</div>
        </div> :

      <div className="sk-box" style={{ position: "absolute", right: 14, top: 54, width: rightWidth, bottom: 14, padding: "14px 14px", background: surface, borderColor: ruleColor, color: ink, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="sk-ribbon">AI 上下文</span>
            <span style={{ flex: 1 }} />
            <span className="hand-en" style={{ color: muted, fontSize: 13 }}>这就是 AI 看到的</span>
          </div>
          <div className="hand-en" style={{ fontSize: 12, color: muted, marginTop: 4 }}>第 42 章 · 自动 · 可编辑</div>
          <div className="squiggle" style={{ margin: "8px 0" }} />

          {/* chips */}
          <div className="hand-cn" style={{ fontSize: 13, marginBottom: 4 }}>本章涉及</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            <span className="tag accent">沈砚</span>
            <span className="tag" style={{ background: surface, color: ink, borderColor: ruleColor }}>守门兵</span>
            <span className="tag warm">⚐ 半枚铜牌</span>
            <span className="tag" style={{ background: surface, color: ink, borderColor: ruleColor }}>雪夜城下</span>
          </div>

          {/* character card */}
          <div className="sk-box thin" style={{ padding: "8px 10px", marginBottom: 8, background: surface2, borderColor: ruleColor }}>
            <div className="hand-cn" style={{ fontSize: 14 }}>👤 沈砚 <span style={{ color: muted, fontSize: 12 }} className="hand-en">· 主角 · 17</span></div>
            <div className="serif" style={{ fontSize: 12, lineHeight: "19px", color: ink2 }}>话少，握剑的右手有冻疮。父亲死于北疆。常用短句。</div>
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              <span className="tag" style={{ background: surface, color: ink, borderColor: ruleColor, fontSize: 12 }}>口头禅</span>
              <span className="tag" style={{ background: surface, color: ink, borderColor: ruleColor, fontSize: 12 }}>关系图</span>
              <span className="tag" style={{ background: surface, color: ink, borderColor: ruleColor, fontSize: 12 }}>历史出场</span>
            </div>
          </div>

          {/* setting card */}
          <div className="sk-box thin" style={{ padding: "8px 10px", marginBottom: 8, background: surface2, borderColor: ruleColor }}>
            <div className="hand-cn" style={{ fontSize: 14 }}>⚐ 伏笔 · 半枚铜牌</div>
            <div className="serif" style={{ fontSize: 12, lineHeight: "19px", color: ink2 }}>北疆军中信物，缺角者为叛逃之证。首次出现 · 第 17 章。</div>
            <span className="tag warm" style={{ marginTop: 4, fontSize: 12, display: "inline-block" }}>计划回收 · 距 18 章</span>
          </div>

          {/* style memory */}
          <div className="hand-cn" style={{ fontSize: 13, margin: "8px 0 4px" }}>风格记忆 <span className="hand-en" style={{ color: muted, fontSize: 11 }}>· 来自前 41 章</span></div>
          <div className="sk-box thin dashed" style={{ padding: "6px 8px", borderColor: ruleColor, background: "transparent" }}>
            <div className="serif" style={{ fontSize: 12, lineHeight: "18px", color: ink }}>短句。比喻偏冷。少用"突然"。对话不写"道""说"。</div>
          </div>

          {/* compliance */}
          <div style={{ position: "absolute", left: 14, right: 14, bottom: 14 }}>
            <div className="sk-rule dashed" style={{ borderColor: ruleColor }} />
            <div className="hand-cn" style={{ fontSize: 13, marginTop: 6 }}>合规与口味</div>
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              <span className="tag" style={{ background: surface, color: ink, borderColor: ruleColor, fontSize: 12 }}>敏感词 0</span>
              <span className="tag" style={{ background: surface, color: ink, borderColor: ruleColor, fontSize: 12 }}>"AI 味" 低</span>
              <span className="tag warm" style={{ fontSize: 12 }}>爽点中</span>
            </div>
          </div>
        </div>
      }

      {/* floating ⌘K palette */}
      {showPalette &&
      <div className="sk-box thick" style={{
        position: "absolute", left: "50%", top: "34%",
        transform: "translate(-50%,-20%) rotate(-0.6deg)",
        width: 540, padding: "12px 14px", background: isDark ? "#2f2c26" : "#fff", borderColor: ruleColor, color: ink,
        boxShadow: "6px 8px 0 rgba(0,0,0,0.15)", zIndex: 10
      }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="hand-en" style={{ fontSize: 18, color: accent }}>✦</span>
            <input className="hand-cn" defaultValue="让对话更紧绷，再加一个让沈砚迟疑的细节" style={{ flex: 1, border: 0, outline: "none", fontSize: 16, background: "transparent", color: ink }} />
            <span className="tag" style={{ background: surface, color: ink, borderColor: ruleColor }}>⌘K</span>
          </div>
          <div className="sk-rule dashed" style={{ margin: "8px 0", borderColor: ruleColor }} />
          {[
        ["✎", "改写选中文字（更紧绷）", true],
        ["+", "在此处续写 200 字"],
        ["⇆", "换语气：冷峻 → 戏谑"],
        ["@", "引用沈砚 · 铜牌 · 第 41 章"],
        ["⚐", "标记伏笔 · 计划回收"]].
        map(([k, v, active], i) =>
        <div key={i} className="hand-cn" style={{
          display: "flex", gap: 10, padding: "5px 6px", borderRadius: 5,
          background: active ? isDark ? "#3a362f" : "#fff8e8" : "transparent",
          color: active ? accent : ink, fontSize: 15
        }}>
              <span style={{ width: 18, textAlign: "center" }} className="hand-en">{k}</span>
              <span style={{ flex: 1 }}>{v}</span>
              <span className="hand-en" style={{ color: muted, fontSize: 12 }}>↩</span>
            </div>
        )}
        </div>
      }
    </div>);

}

/* ===== Variants thumbnails (smaller artboards) ==================== */
function V1VarImmersive() {
  return <V1Main leftMode="rail" rightMode="rail" showBeat={false} showGhost={true} variantLabel="A · 最专注" />;
}
function V1VarPalette() {
  return <V1Main leftMode="drawer" rightMode="drawer" showBeat={true} showGhost={false} showPalette={true} variantLabel="B · ⌘K 唤起" />;
}
function V1VarDark() {
  return <V1Main paper="#1a1a1a" ink="#f0ece2" ink2="#c8c2b3" accent="#e6a86b" leftMode="rail" rightMode="drawer" showGhost={true} showBeat={true} variantLabel="C · 夜间码字" />;
}

/* ===== Supporting screens ========================================= */

/* 书架 / 项目主页 */
function V1Bookshelf() {
  const books = [
  { t: "剑入星海", g: "玄幻", w: "127k", c: 42, status: "连载",
    today: "2,140 字", streak: 18, plat: "起点 · 番茄", current: true },
  { t: "夜读 · 都市修真录", g: "都市", w: "83k", c: 26, status: "连载",
    today: "840 字", streak: 6, plat: "番茄" },
  { t: "乙女与剑（短篇集）", g: "言情", w: "21k", c: 5, status: "试稿",
    today: "—", streak: 0, plat: "未发布", draft: true }];

  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i /><i /><i /></span>
        <span className="brush" style={{ fontSize: 22 }}>小说studio</span>
        <span className="hand-en muted" style={{ fontSize: 14 }}>· 书架</span>
        <span style={{ flex: 1 }} />
        <span className="hand-en muted">⌘N 新书 · ⌘K 任何指令</span>
        <span className="hand-en">L. · 砚秋</span>
      </div>

      {/* header */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 60, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="brush" style={{ fontSize: 36 }}>今天写点什么</div>
          <div className="hand-en muted" style={{ fontSize: 16 }}>2026-05-16 · 周六 · 你已连续码字 18 天</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="tag" style={{ padding: "4px 12px" }}>导入旧稿</span>
          <span className="tag" style={{ padding: "4px 12px" }}>从大纲开始</span>
          <span className="tag accent" style={{ padding: "4px 12px" }}>+ 新书</span>
        </div>
      </div>

      {/* stat strip */}
      <div className="sk-box" style={{ position: "absolute", left: 30, right: 30, top: 128, padding: "14px 20px", display: "flex", gap: 24, background: "#fff" }}>
        {[
        ["本周累计", "11,420 字"],
        ["日均", "1,632 字"],
        ["最长连码", "2h 14m"],
        ["待回收伏笔", "7"],
        ["AI 续写采纳率", "61%"]].
        map(([k, v], i) =>
        <div key={i} style={{ flex: 1, borderRight: i < 4 ? "1.25px dashed #1a1a1a" : "none", paddingRight: 24 }}>
            <div className="hand-en muted" style={{ fontSize: 13 }}>{k}</div>
            <div className="brush" style={{ fontSize: 24 }}>{v}</div>
          </div>
        )}
      </div>

      {/* heatmap calendar */}
      <div className="sk-box" style={{ position: "absolute", left: 30, top: 218, width: 560, padding: "14px 16px", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span className="hand-cn" style={{ fontSize: 16 }}>码字热度</span>
          <span className="hand-en muted" style={{ fontSize: 13 }}>过去 12 周</span>
        </div>
        <div className="squiggle" style={{ margin: "6px 0 10px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gridTemplateRows: "repeat(7, 1fr)", gap: 4, gridAutoFlow: "column" }}>
          {Array.from({ length: 84 }).map((_, i) => {
            const v = Math.random();
            const c = v < 0.2 ? "#f0ede2" : v < 0.4 ? "#f7d8c8" : v < 0.7 ? "#e8a685" : "#d9542b";
            return <div key={i} style={{ width: "100%", aspectRatio: "1/1", background: c, borderRadius: 3 }} />;
          })}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
          <span className="hand-en muted" style={{ fontSize: 12 }}>少</span>
          {["#f0ede2", "#f7d8c8", "#e8a685", "#d9542b"].map((c, i) => <div key={i} style={{ width: 14, height: 14, background: c, borderRadius: 3 }} />)}
          <span className="hand-en muted" style={{ fontSize: 12 }}>多</span>
          <span style={{ flex: 1 }} />
          <span className="tag warm hand-en" style={{ fontSize: 13 }}>🔥 连续 18 天</span>
        </div>
      </div>

      {/* AI nudge */}
      <div className="sk-box" style={{ position: "absolute", left: 610, top: 218, right: 30, padding: "14px 16px", background: "#fff8e8", borderColor: "var(--accent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="sk-ribbon">AI 提醒</span>
          <span style={{ flex: 1 }} />
          <span className="hand-en muted">2 条</span>
        </div>
        <div className="sk-rule dashed" style={{ margin: "8px 0" }} />
        <div className="hand-cn" style={{ fontSize: 14, lineHeight: "24px" }}>
          ▌ <span style={{ color: "var(--accent)" }}>《剑入星海》</span>第 38 章埋下的"铜牌"伏笔已 4 章未提及，距计划回收还有 18 章。
        </div>
        <div className="hand-cn" style={{ fontSize: 14, lineHeight: "24px", marginTop: 6 }}>
          ▌ <span style={{ color: "var(--accent)" }}>《夜读》</span>主角"陈砚"与《剑入星海》主角"沈砚"重名，是否合并设定？
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <span className="tag accent hand-en">查看伏笔表</span>
          <span className="tag hand-en">改名建议</span>
          <span className="tag hand-en">全部忽略</span>
        </div>
      </div>

      {/* books */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 404, bottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        {books.map((b, i) =>
        <div key={i} className={"sk-box " + (b.current ? "thick" : "")} style={{ padding: "16px 18px", background: b.current ? "#fff" : "#fafaf6", position: "relative" }}>
            {b.current && <div className="sk-ribbon" style={{ position: "absolute", right: 14, top: -12 }}>当前</div>}
            <div className="brush" style={{ fontSize: 28 }}>《{b.t}》</div>
            <div className="hand-en muted" style={{ fontSize: 14, marginTop: 2 }}>{b.g} · {b.status} · {b.plat}</div>
            <div className="squiggle" style={{ margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div className="hand-en muted" style={{ fontSize: 12 }}>总字数</div>
                <div className="brush" style={{ fontSize: 22 }}>{b.w}</div>
              </div>
              <div>
                <div className="hand-en muted" style={{ fontSize: 12 }}>章节</div>
                <div className="brush" style={{ fontSize: 22 }}>{b.c}</div>
              </div>
              <div>
                <div className="hand-en muted" style={{ fontSize: 12 }}>今日</div>
                <div className="brush" style={{ fontSize: 22, color: "var(--accent)" }}>{b.today}</div>
              </div>
            </div>
            {b.draft ?
          <div className="hand-en muted" style={{ fontSize: 13, marginTop: 16 }}>未发布 · 试稿中</div> :

          <div style={{ display: "flex", gap: 6, marginTop: 16, alignItems: "center" }}>
                <span className="tag warm">🔥 {b.streak} 天</span>
                <span style={{ flex: 1 }} />
                <span className={"tag " + (b.current ? "accent" : "")}>{b.current ? "继续写 →" : "打开"}</span>
              </div>
          }
            {b.current &&
          <>
                <div className="sk-rule dashed" style={{ margin: "14px 0 8px" }} />
                <div className="hand-en muted" style={{ fontSize: 12 }}>上次写到</div>
                <div className="hand-cn" style={{ fontSize: 14 }}>第 42 章 · 雪夜城下 · 1,243 字</div>
              </>
          }
          </div>
        )}
      </div>

      <V1Annot x={32} y={92} rotate={-3} w={200}>统计 + AI 提醒 = 仪表盘</V1Annot>
      <V1Annot x={620} y={380} rotate={-2} w={200}>"当前书"卡片更醒目</V1Annot>
    </div>);

}

/* 人物详情 / 设定卡 */
function V1Character() {
  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i /><i /><i /></span>
        <span className="brush" style={{ fontSize: 22 }}>小说studio</span>
        <span className="hand-en muted" style={{ fontSize: 14 }}>· 《剑入星海》 / 设定库 / 人物 / 沈砚</span>
        <span style={{ flex: 1 }} />
        <span className="hand-en muted">⌘K</span>
      </div>

      {/* breadcrumb tabs */}
      <div style={{ position: "absolute", left: 14, top: 48, right: 14, display: "flex", gap: 16, borderBottom: "1.5px solid #1a1a1a", padding: "10px 6px" }}>
        {["人物 23", "地点 11", "门派 7", "物品 9", "伏笔 7", "时间线", "术语"].map((t, i) =>
        <div key={t} className="hand-cn" style={{ fontSize: 15, position: "relative", color: i === 0 ? "var(--accent)" : "var(--ink)" }}>
            {t}
            {i === 0 && <div style={{ position: "absolute", left: -4, right: -4, bottom: -12, height: 3, background: "var(--accent)", borderRadius: 2 }} />}
          </div>
        )}
        <span style={{ flex: 1 }} />
        <span className="tag">导出 JSON</span>
        <span className="tag accent">+ 新人物</span>
      </div>

      {/* left list */}
      <div className="sk-box" style={{ position: "absolute", left: 14, top: 96, width: 200, bottom: 14, padding: "10px 10px", background: "#fff" }}>
        <input className="hand-en" placeholder="🔍 搜索人物" style={{ width: "100%", padding: "3px 8px", border: "1.25px dashed #1a1a1a", borderRadius: 6, background: "transparent", fontSize: 13, marginBottom: 8 }} />
        {[
        { n: "沈砚", r: "主角", c: true },
        { n: "白如霜", r: "女主" },
        { n: "老者 · 卫衍", r: "师" },
        { n: "林九郎", r: "配角" },
        { n: "守门兵 · 钱二", r: "路人+" },
        { n: "城主 · 季元", "r": "反派" },
        { n: "…", muted: true }].
        map((p, i) =>
        <div key={i} className="sk-box thin" style={{ padding: "6px 8px", marginBottom: 6, background: p.c ? "#fff8e8" : "#fafaf6", borderColor: p.c ? "var(--accent)" : "#1a1a1a", opacity: p.muted ? 0.5 : 1 }}>
            <div className="hand-cn" style={{ fontSize: 14, color: p.c ? "var(--accent)" : "var(--ink)" }}>{p.n}</div>
            {p.r && <div className="hand-en muted" style={{ fontSize: 11 }}>{p.r}</div>}
          </div>
        )}
      </div>

      {/* main card */}
      <div className="sk-box fill-w" style={{ position: "absolute", left: 228, top: 96, right: 14, bottom: 14, padding: "22px 28px", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* portrait placeholder */}
          <div className="sk-box dashed" style={{ width: 140, height: 160, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf6" }}>
            <div style={{ textAlign: "center" }}>
              <div className="hand-en muted" style={{ fontSize: 13 }}>头像 / 立绘</div>
              <div className="hand-en muted" style={{ fontSize: 12 }}>拖入图片</div>
            </div>
          </div>
          {/* basics */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <div className="brush" style={{ fontSize: 42 }}>沈 砚</div>
              <span className="tag accent">主角</span>
              <span className="tag warm">视角人物</span>
              <span style={{ flex: 1 }} />
              <span className="hand-en muted">出场 41 章 · 首次 第 1 章</span>
            </div>
            <div className="squiggle accent" style={{ margin: "6px 0 12px", maxWidth: 480 }} />
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", rowGap: 6, columnGap: 14, fontSize: 14 }} className="hand-cn">
              <span className="hand-en muted">年龄</span><span>17（卷一）→ 19（当前）</span>
              <span className="hand-en muted">籍贯</span><span>北疆 · 朔风城（已破）</span>
              <span className="hand-en muted">身份</span><span>叛军遗孤 · 持半枚铜牌</span>
              <span className="hand-en muted">武学</span><span>家传"问雪"剑式 · 残篇 4/9</span>
              <span className="hand-en muted">外貌</span><span>瘦高，冻青脸，右手有冻疮，眉骨偏低</span>
            </div>
          </div>
          {/* AI assist */}
          <div className="sk-box" style={{ width: 200, padding: "10px 12px", background: "#fff8e8", borderColor: "var(--accent)" }}>
            <span className="hand-en" style={{ color: "var(--accent)" }}>✦ AI 助手</span>
            <div className="sk-rule dashed" style={{ margin: "6px 0" }} />
            <div className="hand-cn" style={{ fontSize: 13, lineHeight: "20px" }}>检测到沈砚在第 22 章和 31 章出现"性格漂移"，是否标注？</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <span className="tag accent">查看</span>
              <span className="tag">忽略</span>
            </div>
          </div>
        </div>

        {/* tab sections */}
        <div style={{ display: "flex", gap: 22, marginTop: 18, borderBottom: "1.25px dashed #1a1a1a", paddingBottom: 6 }} className="hand-cn">
          {["性格 & 口癖", "关系图谱", "时间线", "出场章节", "风格样本", "设定一致性"].map((t, i) =>
          <span key={t} style={{ fontSize: 14, color: i === 0 ? "var(--accent)" : "var(--ink)", borderBottom: i === 0 ? "2px solid var(--accent)" : "none", paddingBottom: 4 }}>{t}</span>
          )}
        </div>

        {/* content grid */}
        <div style={{ position: "absolute", left: 28, right: 28, top: 240, bottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {/* 性格 */}
          <div className="sk-box" style={{ padding: "12px 14px", background: "#fff" }}>
            <div className="hand-cn" style={{ fontSize: 15 }}>性格 & 口癖</div>
            <div className="sk-rule dashed" style={{ margin: "6px 0" }} />
            <div className="hand-cn" style={{ fontSize: 13, lineHeight: "21px" }}>
              寡言。冷峻。重诺。喝酒不沾。<br />
              对刀剑的反应快于对人的反应。<br />
              说"嗯"代替"是"。<br />
              生气时只是更安静。
            </div>
            <div className="sk-rule dashed" style={{ margin: "8px 0 6px" }} />
            <div className="hand-en muted" style={{ fontSize: 12 }}>句式样本（取自前 41 章）</div>
            <div className="serif" style={{ fontSize: 12, lineHeight: "18px", color: "var(--ink-2)" }}>
              "雪要停了。"<br />
              "我不喝。"<br />
              "你说的不算。"
            </div>
          </div>

          {/* 关系 */}
          <div className="sk-box" style={{ padding: "12px 14px", background: "#fff", position: "relative" }}>
            <div className="hand-cn" style={{ fontSize: 15 }}>关系图谱</div>
            <div className="sk-rule dashed" style={{ margin: "6px 0" }} />
            <div style={{ position: "relative", height: 220 }}>
              {/* center node */}
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
                <div className="stamp" style={{ width: 60, height: 60, fontSize: 14 }}>沈砚</div>
              </div>
              {/* sat nodes */}
              {[
              { n: "白如霜", x: 18, y: 18, r: "未知" },
              { n: "卫衍", x: 78, y: 18, r: "师" },
              { n: "林九郎", x: 14, y: 80, r: "友" },
              { n: "季元", x: 82, y: 78, r: "敌" }].
              map((p, i) =>
              <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div className="sk-box thin" style={{ padding: "3px 8px", background: "#fafaf6" }}>
                    <div className="hand-cn" style={{ fontSize: 12 }}>{p.n}</div>
                    <div className="hand-en muted" style={{ fontSize: 10 }}>{p.r}</div>
                  </div>
                </div>
              )}
              {/* lines */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                <line x1="50%" y1="50%" x2="18%" y2="18%" stroke="#1a1a1a" strokeDasharray="4 4" strokeWidth="1.2" />
                <line x1="50%" y1="50%" x2="78%" y2="18%" stroke="#1a1a1a" strokeWidth="1.2" />
                <line x1="50%" y1="50%" x2="14%" y2="80%" stroke="#1a1a1a" strokeWidth="1.2" />
                <line x1="50%" y1="50%" x2="82%" y2="78%" stroke="#d9542b" strokeWidth="1.6" />
              </svg>
            </div>
            <div className="hand-en muted" style={{ fontSize: 12, textAlign: "center" }}>实线=明牌 · 虚线=暧昧 · 朱砂=敌对</div>
          </div>

          {/* 时间线 */}
          <div className="sk-box" style={{ padding: "12px 14px", background: "#fff" }}>
            <div className="hand-cn" style={{ fontSize: 15 }}>关键节点</div>
            <div className="sk-rule dashed" style={{ margin: "6px 0" }} />
            <div style={{ position: "relative", paddingLeft: 18 }}>
              <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: 1.5, background: "#1a1a1a" }} />
              {[
              { c: "01", t: "父死，下山，得半枚铜牌" },
              { c: "08", t: "第一次出剑，杀劫匪" },
              { c: "17", t: "⚐ 铜牌身份被认出（伏笔）" },
              { c: "33", t: "遇白如霜，结伴北行" },
              { c: "42", t: "▌ 雪夜入城（当前）", current: true },
              { c: "?", t: "⚐ 计划：铜牌回收 · 第 60 章前后", future: true }].
              map((n, i) =>
              <div key={i} style={{ position: "relative", marginBottom: 8 }}>
                  <div className={"dot" + (n.future ? " hollow" : "")} style={{ position: "absolute", left: -15, top: 6, background: n.current ? "var(--accent)" : n.future ? "transparent" : "#1a1a1a", borderColor: n.current ? "var(--accent)" : "#1a1a1a" }} />
                  <div className="hand-en" style={{ fontSize: 13, color: n.current ? "var(--accent)" : n.future ? "var(--ink-3)" : "var(--ink-2)" }}>第 {n.c} 章</div>
                  <div className="hand-cn" style={{ fontSize: 13, color: n.current ? "var(--accent)" : "var(--ink)" }}>{n.t}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <V1Annot x={460} y={300} w={220} rotate={-2}>沈砚 = 整本书的"主键"</V1Annot>
      <V1Annot x={1020} y={170} w={170} rotate={3}>AI 主动盯一致性</V1Annot>
    </div>);

}

Object.assign(window, { V1Main, V1VarImmersive, V1VarPalette, V1VarDark, V1Bookshelf, V1Character });