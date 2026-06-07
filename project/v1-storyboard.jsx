/* global React */
/* ============================================================
   v1 动效故事板：写一段 ghost-text 的 6 帧
   每帧 = 一个小 artboard，展示一个关键时刻 + 时序注释
   ============================================================ */

/* --- shared frame chrome --- */
function SbFrame({n, title, ms, ease, caption, motion, children}){
  return (
    <div className="ab" style={{width:540, height:360, background:"#fafaf6"}}>
      {/* top label */}
      <div style={{position:"absolute", left:14, top:10, right:14, display:"flex", alignItems:"center", gap:8}}>
        <span className="sk-ribbon" style={{padding:"1px 8px", fontSize:14}}>{String(n).padStart(2,"0")}</span>
        <span className="brush" style={{fontSize:18}}>{title}</span>
        <span style={{flex:1}}/>
        {ms && <span className="tag hand-en" style={{fontSize:11}}>{ms}</span>}
        {ease && <span className="tag hand-en" style={{fontSize:11}}>{ease}</span>}
      </div>

      {/* mock editor (paper) */}
      <div className="sk-box fill-w" style={{position:"absolute", left:18, top:42, right:18, height:218, padding:"12px 16px", overflow:"hidden", background:"#fff"}}>
        {children}
      </div>

      {/* motion notes */}
      <div style={{position:"absolute", left:14, right:14, top:268, display:"flex", gap:10}}>
        <div style={{flex:1}}>
          <div className="hand-en" style={{fontSize:12, color:"var(--ink-3)"}}>意图</div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"18px", color:"var(--ink)"}}>{caption}</div>
        </div>
        <div style={{flex:1, paddingLeft:8, borderLeft:"1.25px dashed #1a1a1a"}}>
          <div className="hand-en" style={{fontSize:12, color:"var(--ink-3)"}}>动效</div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"18px", color:"var(--ink)"}}>{motion}</div>
        </div>
      </div>
    </div>
  );
}

/* helpers ---------------------------------------------- */
const L = ({ children, color="var(--ink)", indent=true, fontSize=14 }) => (
  <div className="serif" style={{fontSize, lineHeight:"24px", color, textIndent: indent?"2em":"0"}}>{children}</div>
);
const Caret = () => (
  <span style={{display:"inline-block", width:1.5, height:18, background:"var(--ink)", verticalAlign:"-3px", marginLeft:1, animation:"none"}}/>
);
/* tiny motion arrow svg */
const ArrowCurve = ({ x1,y1,x2,y2, color="#d9542b", dashed=true }) => (
  <svg style={{position:"absolute", inset:0, pointerEvents:"none"}} width="100%" height="100%">
    <defs>
      <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill={color}/>
      </marker>
    </defs>
    <path d={`M ${x1} ${y1} Q ${(x1+x2)/2} ${Math.min(y1,y2)-18} ${x2} ${y2}`} stroke={color} strokeWidth="1.4" fill="none" strokeDasharray={dashed?"4 4":"0"} markerEnd="url(#ar)"/>
  </svg>
);

/* ===== Frames =================================================== */
function Sb1(){
  return (
    <SbFrame n={1} title="静止" ms="0ms" caption='已写完"…还沾着旧血。"，光标停在段末。' motion="无 · 光标 800ms blink · 节拍条静态">
      <L>沈砚没答话。他从怀里摸出半枚铜牌，</L>
      <L>铜牌缺角的地方还沾着旧血。<Caret/></L>
      <div style={{position:"absolute", left:0, right:0, bottom:0, height:22, borderTop:"1.25px solid #1a1a1a", background:"#f3f1e8", display:"flex", alignItems:"center", padding:"0 8px"}} className="hand-en">
        <span style={{fontSize:11, color:"var(--ink-3)"}}>1,212 字</span>
        <span style={{flex:1}}/>
        <span style={{fontSize:11, color:"var(--ink-3)"}}>⌘K 任何指令</span>
      </div>
    </SbFrame>
  );
}

function Sb2(){
  return (
    <SbFrame n={2} title="AI 悄悄飘出 ghost" ms="120ms 停顿后 · 240ms" ease="ease-out · opacity 0→1 + Y +4→0" caption="停笔 120ms 后，AI 悄悄给出半段续写候选，朱砂色，比正文淡。" motion="向上漂入 4px · 不抢光标 · 不打断输入">
      <L>沈砚没答话。他从怀里摸出半枚铜牌，</L>
      <L>
        铜牌缺角的地方还沾着旧血。
        <span style={{color:"var(--accent)", opacity:0.85}}>守门兵的脸色一下变了。</span>
        <Caret/>
      </L>
      <L color="var(--accent)" indent={true} fontSize={14}>
        <span style={{opacity:0.85}}>他喉头滚了一下，把矛尖收得比抽出来还快——</span>
      </L>
      <div style={{position:"absolute", right:14, top:36, padding:"2px 6px", background:"#fff8e8", border:"1.25px dashed #d9542b", borderRadius:4}}>
        <span className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>↹ Tab 接受</span>
      </div>
    </SbFrame>
  );
}

function Sb3(){
  return (
    <SbFrame n={3} title="Tab 接收" ms="180ms" ease="opacity + 颜色 → 正文" caption="按 Tab：朱砂候选 fade 到正文色。微震 1 次（haptic）。" motion="color: accent → ink, 180ms · 同时弹出一个'已接受 · ⌘Z 撤'气泡 · 1.2s 自隐">
      <L>沈砚没答话。他从怀里摸出半枚铜牌，</L>
      <L>铜牌缺角的地方还沾着旧血。守门兵的脸色一下变了。</L>
      <L>他喉头滚了一下，把矛尖收得比抽出来还快——<Caret/></L>
      <div style={{position:"absolute", right:14, bottom:32, padding:"3px 8px", background:"#1a1a1a", color:"#fff", borderRadius:4}}>
        <span className="hand-en" style={{fontSize:11}}>✓ 已接受 · ⌘Z 撤</span>
      </div>
      {/* motion line */}
      <ArrowCurve x1={120} y1={70} x2={120} y2={90} color="#1a1a1a"/>
    </SbFrame>
  );
}

function Sb4(){
  return (
    <SbFrame n={4} title="⌘K 召唤命令面板" ms="220ms" ease="spring · 1.05 → 1.0 + dim 0→0.45" caption="按 ⌘K：编辑器整体压暗、轻微模糊；面板从中心 1.05× 弹到 1.0×。" motion="scale spring 220ms · backdrop dim 180ms · 输入框自动聚焦">
      <div style={{filter:"blur(0.6px)", opacity:0.4}}>
        <L>沈砚没答话。他从怀里摸出半枚铜牌，</L>
        <L>铜牌缺角的地方还沾着旧血。守门兵的脸色一下变了。</L>
      </div>
      <div style={{position:"absolute", inset:0, background:"rgba(0,0,0,0.18)"}}/>
      {/* palette */}
      <div className="sk-box thick" style={{position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%) rotate(-0.4deg) scale(1.0)", width:380, padding:"8px 10px", background:"#fff", boxShadow:"4px 5px 0 rgba(0,0,0,0.18)"}}>
        <div style={{display:"flex", alignItems:"center", gap:6}}>
          <span className="hand-en" style={{color:"var(--accent)"}}>✦</span>
          <span className="hand-cn" style={{fontSize:13, flex:1}}>让对话更紧绷…<Caret/></span>
          <span className="tag" style={{fontSize:10}}>⌘K</span>
        </div>
        <div className="sk-rule dashed" style={{margin:"4px 0"}}/>
        <div className="hand-cn" style={{fontSize:12, color:"var(--accent)", padding:"2px 4px", background:"#fff8e8", borderRadius:3}}>✎ 改写选中文字（更紧绷）</div>
        <div className="hand-cn" style={{fontSize:12, padding:"2px 4px"}}>+ 续写 200 字</div>
        <div className="hand-cn" style={{fontSize:12, padding:"2px 4px"}}>⇆ 换语气</div>
      </div>
    </SbFrame>
  );
}

function Sb5(){
  return (
    <SbFrame n={5} title="改写：原文 → 新版" ms="320ms" ease="高亮闪一下 → crossfade" caption="选中那段被高亮一下，旧文 fade out · 新文 fade in，长度差别 morph 处理。" motion="高亮 80ms · crossfade 240ms · 段落高度 spring 自动调整">
      <L>沈砚没答话。他从怀里摸出半枚铜牌，</L>
      <L>铜牌缺角的地方还沾着旧血。</L>
      {/* old (fading out) */}
      <L color="#d9542b" indent={true}>
        <span style={{textDecoration:"line-through", opacity:0.35}}>守门兵的脸色一下变了。他喉头滚了一下…</span>
      </L>
      {/* new (fading in) */}
      <L color="var(--ink)" indent={true}>
        <span style={{background:"rgba(217,84,43,0.08)", padding:"0 2px"}}>守门兵没再说话。矛尖斜着收回，半寸。</span>
        <Caret/>
      </L>
      {/* arrow showing morph */}
      <ArrowCurve x1={80} y1={88} x2={80} y2={120} color="#d9542b"/>
    </SbFrame>
  );
}

function Sb6(){
  return (
    <SbFrame n={6} title="节拍条更新" ms="900ms 后" ease="slide-down 200ms" caption="改写完成 0.9s 后，顶部节拍条悄悄滑下：'对话密度回到均值范围'。" motion="非阻塞 · 朱砂下划线脉动 1 次 · 8s 后自隐">
      {/* beat strip animating in */}
      <div className="sk-box thin" style={{position:"absolute", left:8, right:8, top:8, padding:"4px 8px", background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div style={{display:"flex", alignItems:"center", gap:6}}>
          <span className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>♪ 节拍</span>
          <span className="hand-cn" style={{fontSize:12, flex:1}}>对话密度从 41% → 28%，回到均值范围。</span>
          <span className="tag" style={{fontSize:10}}>很好</span>
          <span className="tag" style={{fontSize:10}}>×</span>
        </div>
      </div>
      <div style={{marginTop:36}}>
        <L>沈砚没答话。他从怀里摸出半枚铜牌，</L>
        <L>铜牌缺角的地方还沾着旧血。</L>
        <L>守门兵没再说话。矛尖斜着收回，半寸。<Caret/></L>
      </div>
    </SbFrame>
  );
}

/* compose 6 frames in a single artboard for overview */
function V1StoryboardAll(){
  return (
    <div className="ab" style={{width:1280, height:820, background:"#e9e5d8", padding:0}}>
      <div style={{position:"absolute", left:30, top:18, right:30, display:"flex", alignItems:"baseline", gap:14}}>
        <div className="brush" style={{fontSize:32}}>写一段 ghost-text 的 6 帧</div>
        <div className="hand-en muted" style={{fontSize:16}}>停笔 → AI 候选 → 接受 → ⌘K → 改写 → 节拍反馈</div>
        <span style={{flex:1}}/>
        <span className="tag" style={{fontSize:12}}>← → 切帧</span>
        <span className="tag accent" style={{fontSize:12}}>▷ 放映</span>
      </div>

      {/* timeline */}
      <div style={{position:"absolute", left:30, right:30, top:68, height:28}}>
        <svg width="100%" height="28">
          <line x1="0" y1="14" x2="100%" y2="14" stroke="#1a1a1a"/>
          {[0,120,360,540,760,1080,1980].map((ms,i,arr)=>{
            const pct = ms / 1980 * 100;
            return (
              <g key={i}>
                <line x1={`${pct}%`} y1="8" x2={`${pct}%`} y2="20" stroke="#1a1a1a"/>
                {i<6 && <text x={`${pct}%`} y="6" fontSize="10" textAnchor="middle" fontFamily="Caveat" fill="#4a4a4a">{ms}ms</text>}
                {i<6 && <circle cx={`${pct}%`} cy="14" r="5" fill={i===0?"#1a1a1a":(i===5?"#d9542b":"#fff")} stroke="#1a1a1a"/>}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 6 frames in 3x2 grid, scaled */}
      <div style={{position:"absolute", left:30, right:30, top:110, bottom:30, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gridTemplateRows:"1fr 1fr", gap:18}}>
        {[Sb1,Sb2,Sb3,Sb4,Sb5,Sb6].map((F,i)=>(
          <div key={i} style={{transformOrigin:"top left", overflow:"hidden", position:"relative"}}>
            <div style={{transform:"scale(0.74)", transformOrigin:"top left", width:540, height:360}}>
              <F/>
            </div>
          </div>
        ))}
      </div>

      <div className="annot" style={{left:30, top:96, transform:"rotate(-2deg)"}}>
        <span className="lbl">总时长 ≈ 2 秒 · 全部非阻塞</span>
      </div>
    </div>
  );
}

Object.assign(window, { V1StoryboardAll, Sb1, Sb2, Sb3, Sb4, Sb5, Sb6 });
