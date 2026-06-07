/* global React */
/* ============================================================
   v1 三大视图细化
   - V1Kanban: 看板视图（节拍 + 卡片状态机 + AI 建议）
   - V1Timeline: 时间线（多轨 + 伏笔连线 + 节奏曲线）
   - V1Palette: ⌘K 命令面板全集
   ============================================================ */

/* ===== 看板视图 ============================================ */
function V1Kanban(){
  const arcs = [
    {
      title:"卷一 · 少年入江湖", sub:"第 1 – 38 章", tension:[10,18,30,42,38,60,72,55,40],
      cards:[
        {n:"01 雨夜下山",s:"少年 / 师父 / 出门",w:"3.2k",state:"done"},
        {n:"08 第一次出剑",s:"杀劫匪 · 名声起",w:"3.4k",state:"done"},
        {n:"17 父亲遗物",s:"⚐ 半枚铜牌（伏笔 #1）",w:"3.1k",state:"done",fl:true},
        {n:"29 老者断剑",s:"⚐ 卫衍临终 · 伏笔 #2",w:"3.0k",state:"done",fl:true},
        {n:"… 34 章已完成 …",muted:true},
      ]
    },
    {
      title:"卷二 · 雪夜入城", sub:"第 39 – ? 章", tension:[55,70,85,92,78,90], current:true,
      cards:[
        {n:"41 城门密谈",s:"老者出剑 · 半枚铜牌",w:"3.1k",state:"done"},
        {n:"42 雪夜城下",s:"沈砚入城 · ⚐ 灯无人添油",w:"1.2k",state:"writing",cur:true,fl:true},
        {n:"43 城主之女",s:"AI 草稿 · 待润色",w:"0.8k",state:"ai-draft"},
        {n:"44 ?",s:"⚐ 计划：铜牌身份揭",state:"placeholder"},
        {n:"45 老者断剑回收",s:"伏笔 #2 兑现",state:"outlined",fl:true},
        {n:"+ 新章节",add:true},
      ]
    },
    {
      title:"卷三 · 北望（规划）", sub:"概念阶段", tension:[60,55,68,80,95,88],
      cards:[
        {n:"⌗ 主线 · 沈砚 vs 季元",note:true},
        {n:"⌗ 副线 · 铜牌身世",note:true},
        {n:"⌗ 反派塑造",sub:"AI 候选：3 版",note:true,ai:true},
        {n:"⌗ 卷三高潮节点",sub:"待 AI 起 3 种走向",note:true,ai:true},
      ]
    },
  ];

  return (
    <div className="ab">
      {/* top bar reusing pattern */}
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 《剑入星海》 / 看板</span>
        <span style={{flex:1}}/>
        <div className="sk-box" style={{padding:"2px 4px", display:"flex", gap:2, background:"#fff"}}>
          <span className="hand-en muted" style={{padding:"2px 10px"}}>✎ 写作</span>
          <span className="hand-en" style={{padding:"2px 10px", background:"var(--accent)", color:"#fff", borderRadius:4}}>▦ 看板</span>
          <span className="hand-en muted" style={{padding:"2px 10px"}}>☱ 时间线</span>
        </div>
        <span className="hand-en muted">⌘K</span>
      </div>

      {/* toolbar */}
      <div style={{position:"absolute", left:14, top:46, right:14, height:46, display:"flex", alignItems:"center", gap:10, borderBottom:"1.25px dashed #1a1a1a", paddingBottom:8}}>
        <span className="hand-cn" style={{fontSize:15}}>显示</span>
        {[["全部",true],["主线"],["支线"],["⚐ 伏笔"],["⛌ 矛盾"]].map(([t,a],i)=>(
          <span key={i} className={"tag "+(a?"accent":"")} style={{fontSize:12}}>{t}</span>
        ))}
        <span className="muted">|</span>
        <span className="hand-cn" style={{fontSize:15}}>分组</span>
        {[["按卷",true],["按节拍"],["按 POV"]].map(([t,a],i)=>(
          <span key={i} className={"tag "+(a?"accent":"")} style={{fontSize:12}}>{t}</span>
        ))}
        <span style={{flex:1}}/>
        <span className="hand-en muted">42 章 · 127k 字</span>
        <span className="tag accent">AI 续写大纲</span>
        <span className="tag">+ 新卷</span>
      </div>

      {/* tension curve strip */}
      <div className="sk-box thin" style={{position:"absolute", left:14, right:14, top:104, height:78, padding:"6px 10px", background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div style={{display:"flex", justifyContent:"space-between"}}>
          <span className="hand-en" style={{fontSize:13, color:"var(--accent)"}}>♪ 张力曲线 · 按章节</span>
          <span className="hand-en" style={{fontSize:12, color:"var(--ink-3)"}}>建议：在 44 章前插入"喘息" · 在 60 章铺最高潮</span>
        </div>
        <svg viewBox="0 0 1240 50" preserveAspectRatio="none" style={{width:"100%", height:46, marginTop:2}}>
          <line x1="0" y1="45" x2="1240" y2="45" stroke="#1a1a1a" strokeWidth="0.8"/>
          {/* curve */}
          <path d="M 10 38 Q 80 35 140 28 T 280 20 T 420 18 T 560 22 T 680 8 T 820 6 T 920 12 T 1040 4 T 1180 14"
                fill="none" stroke="#d9542b" strokeWidth="1.8"/>
          {/* current marker */}
          <line x1="660" y1="2" x2="660" y2="48" stroke="#d9542b" strokeDasharray="3 3"/>
          <text x="660" y="14" fontSize="10" textAnchor="middle" fontFamily="Caveat" fill="#d9542b" fontWeight="bold">42 ↓</text>
          {/* climax mark */}
          <circle cx="1040" cy="4" r="4" fill="#d9542b"/>
          <text x="1040" y="-1" fontSize="10" textAnchor="middle" fontFamily="Caveat" fill="#d9542b">高潮?</text>
          {/* breath mark */}
          <circle cx="740" cy="14" r="3" fill="none" stroke="#c9a227" strokeWidth="1.4"/>
          <text x="740" y="32" fontSize="9" textAnchor="middle" fontFamily="Caveat" fill="#c9a227">喘息建议</text>
        </svg>
      </div>

      {/* columns */}
      <div style={{position:"absolute", left:14, right:14, top:192, bottom:14, display:"grid", gridTemplateColumns:"1fr 1.2fr 1fr", gap:14}}>
        {arcs.map((arc,i)=>(
          <div key={i} className={"sk-box "+(arc.current?"thick":"")} style={{padding:"12px 12px", background:arc.current?"#fff":"#fafaf6", position:"relative", overflow:"hidden"}}>
            <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between"}}>
              <div>
                <div className="hand-cn" style={{fontSize:18, color:arc.current?"var(--accent)":"var(--ink)"}}>{arc.current?"▌ ":""}{arc.title}</div>
                <div className="hand-en muted" style={{fontSize:12}}>{arc.sub}</div>
              </div>
              <span className="hand-en muted" style={{fontSize:12}}>{arc.cards.filter(c=>c.state==="done").length}/{arc.cards.length}</span>
            </div>
            <div className="squiggle" style={{margin:"8px 0"}}/>

            <div style={{display:"flex", flexDirection:"column", gap:8, overflow:"hidden"}}>
              {arc.cards.map((c,j)=>{
                if(c.add){
                  return <div key={j} className="sk-box thin dashed" style={{padding:"8px 10px", textAlign:"center"}}>
                    <span className="hand-cn" style={{color:"var(--accent)"}}>{c.n}</span>
                  </div>;
                }
                if(c.muted){
                  return <div key={j} className="hand-en muted" style={{fontSize:13, textAlign:"center", padding:"4px 0"}}>{c.n}</div>;
                }
                if(c.note){
                  return <div key={j} className="sk-box thin" style={{padding:"7px 9px", background:"#f3f1e8"}}>
                    <div className="hand-cn" style={{fontSize:13}}>{c.n}</div>
                    {c.sub && <div className="hand-en" style={{fontSize:11, color:c.ai?"var(--accent)":"var(--ink-3)", marginTop:2}}>{c.sub}</div>}
                  </div>;
                }
                const state = c.state;
                const styles = {
                  done:        {bg:"#fff",     bd:"#1a1a1a", chip:"#1a1a1a", lbl:"已完",   chipColor:"#fff"},
                  writing:     {bg:"#fff",     bd:"var(--accent)", chip:"var(--accent)", lbl:"🖊 进行中", chipColor:"#fff"},
                  "ai-draft":  {bg:"#fff8e8",  bd:"var(--accent)", chip:"#c9a227", lbl:"AI 草稿", chipColor:"#fff"},
                  outlined:    {bg:"#fafaf6",  bd:"#1a1a1a", chip:"#fff", lbl:"已大纲", chipColor:"#1a1a1a"},
                  placeholder: {bg:"transparent", bd:"#1a1a1a", chip:"#fff", lbl:"待写", chipColor:"#1a1a1a", dashed:true},
                }[state];
                return (
                  <div key={j} className={"sk-box thin"+(styles.dashed?" dashed":"")} style={{padding:"7px 9px", background:styles.bg, borderColor:styles.bd, position:"relative"}}>
                    <div style={{display:"flex", alignItems:"center", gap:6}}>
                      <span className={"check"+(state==="done"?" done":"")}/>
                      <span className="hand-cn" style={{fontSize:14, color: c.cur?"var(--accent)":(state==="placeholder"?"var(--ink-3)":"var(--ink)"), flex:1}}>{c.n}</span>
                      {c.w && <span className="hand-en muted" style={{fontSize:11}}>{c.w}</span>}
                      <span className="tag" style={{fontSize:10, padding:"0 6px", background:styles.chip, color:styles.chipColor, borderColor:styles.chip==="#fff"?"#1a1a1a":"transparent"}}>{styles.lbl}</span>
                    </div>
                    <div className="hand-cn" style={{fontSize:12, color:"var(--ink-2)", marginLeft:20, marginTop:2}}>{c.s}</div>
                    {c.fl && <span className="tag warm" style={{fontSize:10, marginLeft:20, marginTop:3, display:"inline-block", padding:"0 6px"}}>⚐ 伏笔</span>}
                  </div>
                );
              })}
            </div>

            {/* per-column AI suggestion footer */}
            {arc.current && (
              <div className="sk-box thin" style={{padding:"6px 8px", marginTop:8, background:"#fff8e8", borderColor:"var(--accent)"}}>
                <div className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>✦ AI</div>
                <div className="hand-cn" style={{fontSize:12, lineHeight:"18px"}}>本卷 6 章已铺 2 处冲突，44 章插入"沈砚与白如霜短暂相处"可放缓节奏。</div>
                <div style={{display:"flex", gap:4, marginTop:3}}>
                  <span className="tag accent" style={{fontSize:11}}>插入空卡</span>
                  <span className="tag" style={{fontSize:11}}>AI 起 3 版</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="annot" style={{left:230, top:128, transform:"rotate(-2deg)"}}>
        <span className="lbl">朱砂线 = 张力 · 圆点 = 高潮</span>
      </div>
      <div className="annot" style={{left:740, top:280, transform:"rotate(3deg)"}}>
        <span className="lbl">卡片状态机 5 档</span>
      </div>
    </div>
  );
}

/* ===== 时间线视图 ============================================ */
function V1Timeline(){
  const tracks = [
    {n:"沈砚",  r:"主角",  bands:[[1,42,"solid","accent"]]},
    {n:"白如霜",r:"女主",  bands:[[33,42,"solid","ink"]]},
    {n:"卫衍",  r:"师 · 亡",bands:[[1,29,"solid","ink"],[29,29,"dot","muted"]]},
    {n:"林九郎",r:"友/暗探",bands:[[11,38,"solid","ink"]]},
    {n:"季元",  r:"反派",  bands:[[38,42,"solid","ink"]]},
  ];
  // foreshadow arcs: from plantCh to payoffCh
  const arcs = [
    {n:"半枚铜牌", from:17, to:60, state:"open"},     // dashed
    {n:"老者断剑", from:29, to:45, state:"near"},     // gold
    {n:"灯无人添油", from:42, to:null, state:"fresh"},// just planted
    {n:"林玉佩",   from:11, to:38, state:"done"},     // solid done
  ];
  const totalCh = 80;
  const xOf = (ch)=> 90 + (ch/totalCh)*1120;

  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 《剑入星海》 / 时间线</span>
        <span style={{flex:1}}/>
        <div className="sk-box" style={{padding:"2px 4px", display:"flex", gap:2, background:"#fff"}}>
          <span className="hand-en muted" style={{padding:"2px 10px"}}>✎ 写作</span>
          <span className="hand-en muted" style={{padding:"2px 10px"}}>▦ 看板</span>
          <span className="hand-en" style={{padding:"2px 10px", background:"var(--accent)", color:"#fff", borderRadius:4}}>☱ 时间线</span>
        </div>
        <span className="hand-en muted">⌘K</span>
      </div>

      {/* toolbar */}
      <div style={{position:"absolute", left:14, top:46, right:14, height:42, display:"flex", alignItems:"center", gap:10, borderBottom:"1.25px dashed #1a1a1a"}}>
        <span className="hand-cn" style={{fontSize:14}}>轨道</span>
        {[["人物 5",true],["伏笔 4"],["事件"],["地点"],["AI 节拍"]].map(([t,a],i)=>(
          <span key={i} className={"tag "+(a?"accent":"")} style={{fontSize:12}}>{t}</span>
        ))}
        <span className="muted">|</span>
        <span className="hand-cn" style={{fontSize:14}}>缩放</span>
        <span className="tag" style={{fontSize:12}}>章</span>
        <span className="tag" style={{fontSize:12}}>卷</span>
        <span className="tag" style={{fontSize:12}}>幕</span>
        <span style={{flex:1}}/>
        <span className="hand-en muted">已写 42 / 规划 80 章</span>
      </div>

      {/* main timeline */}
      <div className="sk-box fill-w" style={{position:"absolute", left:14, right:14, top:96, bottom:14, padding:"12px 0 12px", overflow:"hidden"}}>

        {/* axis with chapter ticks */}
        <svg width="100%" height="32" style={{position:"absolute", left:0, right:0, top:8}}>
          <line x1="90" y1="22" x2={xOf(totalCh)} y2="22" stroke="#1a1a1a" strokeWidth="1.2"/>
          {[1,10,20,30,40,50,60,70,80].map((c,i)=>(
            <g key={i}>
              <line x1={xOf(c)} y1="18" x2={xOf(c)} y2="26" stroke="#1a1a1a"/>
              <text x={xOf(c)} y="14" fontSize="10" textAnchor="middle" fontFamily="Caveat" fill="#4a4a4a">{c}</text>
            </g>
          ))}
          {/* current marker */}
          <line x1={xOf(42)} y1="0" x2={xOf(42)} y2="32" stroke="#d9542b" strokeWidth="1.8"/>
          <text x={xOf(42)+4} y="10" fontSize="11" fontFamily="Caveat" fill="#d9542b" fontWeight="bold">▌当前 42</text>
          {/* arc dividers */}
          {[1, 38, 60].map((c,i)=>(
            <line key={i} x1={xOf(c)} y1="0" x2={xOf(c)} y2="32" stroke="#1a1a1a" strokeDasharray="3 3" opacity="0.5"/>
          ))}
          <text x={xOf(20)} y="32" fontSize="11" textAnchor="middle" fontFamily="Ma Shan Zheng" fill="#1a1a1a">卷一</text>
          <text x={xOf(49)} y="32" fontSize="11" textAnchor="middle" fontFamily="Ma Shan Zheng" fill="#d9542b">卷二</text>
          <text x={xOf(70)} y="32" fontSize="11" textAnchor="middle" fontFamily="Ma Shan Zheng" fill="#1a1a1a">卷三</text>
        </svg>

        {/* character tracks */}
        <div style={{position:"absolute", left:0, right:0, top:48, bottom:200}}>
          {tracks.map((t,i)=>(
            <div key={i} style={{position:"relative", height:48, borderBottom:"1px dashed rgba(0,0,0,0.15)"}}>
              <div style={{position:"absolute", left:8, top:8, width:78}}>
                <div className="hand-cn" style={{fontSize:13, color: t.r.includes('亡')?"var(--ink-3)":(i===0?"var(--accent)":"var(--ink)")}}>{t.n}</div>
                <div className="hand-en muted" style={{fontSize:10}}>{t.r}</div>
              </div>
              <svg width="100%" height="48" style={{position:"absolute", left:0, top:0}}>
                {t.bands.map((b,j)=>{
                  const [from,to,type,clr] = b;
                  const x1 = xOf(from), x2 = xOf(to);
                  const colors = {accent:"#d9542b", ink:"#1a1a1a", muted:"#8a8a8a"};
                  if(type==="dot"){
                    return <g key={j}>
                      <line x1={x1} y1="14" x2={x1} y2="38" stroke={colors[clr]} strokeWidth="1.2"/>
                      <text x={x1+4} y="42" fontSize="10" fontFamily="Caveat" fill="#8a8a8a">死</text>
                    </g>;
                  }
                  return <rect key={j} x={x1} y="14" width={Math.max(8,x2-x1)} height="20" fill={colors[clr]} opacity={clr==="muted"?0.3:0.85} rx="3"/>;
                })}
              </svg>
            </div>
          ))}
        </div>

        {/* foreshadow band */}
        <div style={{position:"absolute", left:0, right:0, bottom:96, height:108, borderTop:"1.5px solid #1a1a1a", borderBottom:"1.5px solid #1a1a1a", background:"#fff8e8"}}>
          <div className="hand-cn" style={{position:"absolute", left:8, top:6, fontSize:13, color:"var(--accent)"}}>⚐ 伏笔</div>
          <svg width="100%" height="108" style={{position:"absolute", left:0, top:0}}>
            {arcs.map((a,i)=>{
              const x1 = xOf(a.from);
              const x2 = a.to ? xOf(a.to) : xOf(a.from+8);
              const y = 38 + i*16;
              const colors = {
                open:{c:"#d9542b", dash:"4 4", endStroke:"#d9542b", endFill:"none"},
                near:{c:"#c9a227", dash:"4 4", endStroke:"#c9a227", endFill:"#c9a227"},
                fresh:{c:"#d9542b", dash:"2 3", endStroke:"none", endFill:"none"},
                done:{c:"#1a1a1a", dash:"0", endStroke:"#1a1a1a", endFill:"#1a1a1a"},
              }[a.state];
              return (
                <g key={i}>
                  <circle cx={x1} cy={y} r="4" fill={colors.c}/>
                  <line x1={x1} y1={y} x2={x2} y2={y} stroke={colors.c} strokeDasharray={colors.dash} strokeWidth="1.4"/>
                  {a.to && <circle cx={x2} cy={y} r="4" fill={colors.endFill} stroke={colors.endStroke} strokeWidth="1.4"/>}
                  <text x={x1+8} y={y-6} fontSize="10" fontFamily="Ma Shan Zheng" fill={colors.c}>{a.n}</text>
                  {!a.to && <text x={x1+8} y={y+4} fontSize="9" fontFamily="Caveat" fill={colors.c}>未规划</text>}
                </g>
              );
            })}
          </svg>
        </div>

        {/* tension curve */}
        <div style={{position:"absolute", left:0, right:0, bottom:0, height:92, borderTop:"1px dashed rgba(0,0,0,0.3)"}}>
          <div className="hand-cn" style={{position:"absolute", left:8, top:6, fontSize:13}}>♪ 张力</div>
          <svg width="100%" height="92" preserveAspectRatio="none" style={{position:"absolute", left:0, top:0}}>
            <path d={`M ${xOf(1)} 70 Q ${xOf(8)} 58 ${xOf(15)} 48 T ${xOf(25)} 38 T ${xOf(35)} 26 T ${xOf(42)} 30 T ${xOf(50)} 20 T ${xOf(60)} 12 T ${xOf(70)} 22 T ${xOf(80)} 8`}
                  fill="none" stroke="#d9542b" strokeWidth="2"/>
            {/* current */}
            <line x1={xOf(42)} y1="0" x2={xOf(42)} y2="92" stroke="#d9542b" strokeWidth="1.5" strokeDasharray="3 3"/>
            <circle cx={xOf(42)} cy="30" r="4" fill="#d9542b"/>
            {/* climax */}
            <circle cx={xOf(60)} cy="12" r="5" fill="#d9542b"/>
            <text x={xOf(60)} y="6" fontSize="10" textAnchor="middle" fontFamily="Caveat" fill="#d9542b" fontWeight="bold">高潮 ?</text>
            {/* breath */}
            <circle cx={xOf(44)} cy="32" r="4" fill="none" stroke="#c9a227" strokeWidth="1.5"/>
            <text x={xOf(44)+8} y="36" fontSize="9" fontFamily="Caveat" fill="#c9a227">建议喘息</text>
          </svg>
        </div>

      </div>

      <div className="annot" style={{left:150, top:130, transform:"rotate(-2deg)"}}>
        <span className="lbl">每个轨道 = 一条线</span>
      </div>
      <div className="annot" style={{left:450, top:560, transform:"rotate(3deg)"}}>
        <span className="lbl">伏笔弧 · 拖动两端改埋/收</span>
      </div>
    </div>
  );
}

/* ===== ⌘K 命令面板全集 =================================== */
function V1Palette(){
  const groups = [
    {
      g:"写作", k:"✦",
      items:[
        {k:"⌥W", t:"在此处续写 N 字", s:"接着光标，按当前章上下文 · 默认 200 字 · 可指定情绪/节奏"},
        {k:"⌥B", t:"在两段间补一段", s:"AI 在选中两段之间生成 1 段过渡"},
        {k:"⌥D", t:"展开这一句", s:"把简略的「他点头」展成动作 + 心理 + 环境"},
        {k:"⌥S", t:"为这一章起 3 个开头", s:"用不同笔触/钩子各起一版"},
        {k:"⌥E", t:"写本章结尾钩子", s:"3 选 1：悬念 / 转折 / 留白"},
      ]
    },
    {
      g:"改写", k:"✎",
      items:[
        {k:"⌥1", t:"换一种语气", s:"冷峻 / 戏谑 / 古风 / 网络化 / 口语 / 文艺"},
        {k:"⌥2", t:"删冗余 · 紧凑化", s:"目标比例 80% · 90% · 70%"},
        {k:"⌥3", t:"加细节 · 五感", s:"补 1-2 个视觉/听觉/触觉锚点"},
        {k:"⌥4", t:"对话紧绷化", s:"减字 · 加潜台词 · 砍「道」「说」"},
        {k:"⌥5", t:"降 \"AI 味\"", s:"避免列举 · 减形容词堆叠 · 多用动词"},
      ]
    },
    {
      g:"角色 & 设定", k:"☱",
      items:[
        {k:"@", t:"插入人物 / 设定 / 章节", s:"自动带入设定卡作为上下文"},
        {k:"⌥C", t:"用此角色的口吻改写", s:"按人物语气样本（沈砚=短句 / 卫衍=半文）"},
        {k:"⌥X", t:"检查人物一致性", s:"扫描当前段是否违背已有设定"},
        {k:"⌥N", t:"为这个新角色起 3 个名 + 立绘描述", s:""},
      ]
    },
    {
      g:"节奏 & 结构", k:"♪",
      items:[
        {k:"⌥H", t:"让 AI 起 3 版节奏走向", s:"基于本卷张力曲线 + 已有伏笔"},
        {k:"⌥F", t:"标记伏笔 · 计划回收", s:"自动加入「⚐ 伏笔」面板"},
        {k:"⌥R", t:"回收某个伏笔", s:"列出待回收清单"},
        {k:"⌥G", t:"给本章打分", s:"节奏 / 信息密度 / 钩子 / 风格一致"},
      ]
    },
    {
      g:"发布 & 合规", k:"⚖",
      items:[
        {k:"⌥P", t:"按平台扫描", s:"起点 / 番茄 / 七猫 各自规则一键查"},
        {k:"⌥T", t:"生成章节标题 3 版", s:"古风 / 钩子型 / 玩梗"},
        {k:"⌥Q", t:"写本章 30 字简介 + 章末作者说", s:""},
      ]
    },
  ];

  return (
    <div className="ab" style={{background:"rgba(0,0,0,0.12)"}}>
      {/* dim editor underneath (sketchy) */}
      <div style={{position:"absolute", inset:0, opacity:0.35, filter:"blur(0.5px)"}}>
        <div className="titlebar" style={{background:"#f3f1e8"}}>
          <span className="lights"><i/><i/><i/></span>
          <span className="brush" style={{fontSize:22}}>小说studio</span>
        </div>
        <div style={{position:"absolute", left:80, right:80, top:80, bottom:30}} className="sk-box fill-w ruled">
          <div style={{padding:24}}>
            <div className="brush" style={{fontSize:30}}>第 42 章 · 雪夜城下</div>
            <div className="serif" style={{fontSize:14, lineHeight:"28px", marginTop:14, color:"var(--ink-2)"}}>
              <div style={{textIndent:"2em"}}>雪线压着城墙，像一道压了三天三夜的眉。沈砚把斗篷往下扯…</div>
              <div style={{textIndent:"2em"}}>"外乡人？" 守门兵的矛尖斜下来，带着雪。</div>
            </div>
          </div>
        </div>
      </div>

      {/* palette */}
      <div className="sk-box thick" style={{
        position:"absolute", left:"50%", top:"50%",
        transform:"translate(-50%,-50%) rotate(-0.4deg)",
        width:1080, height:680,
        background:"#fafaf6", padding:0, overflow:"hidden",
        boxShadow:"8px 10px 0 rgba(0,0,0,0.18)",
        display:"flex", flexDirection:"column",
      }}>
        {/* search */}
        <div style={{display:"flex", alignItems:"center", gap:10, padding:"14px 18px", borderBottom:"1.5px solid #1a1a1a", background:"#fff"}}>
          <span className="hand-en" style={{fontSize:22, color:"var(--accent)"}}>✦</span>
          <input className="hand-cn" defaultValue="让对话更紧绷，再加一个让沈砚迟疑的细节"
            style={{flex:1, border:0, outline:"none", fontSize:20, background:"transparent"}}/>
          <span className="tag" style={{fontSize:12}}>⌘K</span>
          <span className="tag" style={{fontSize:12}}>⎋ 关闭</span>
        </div>

        {/* top chips: scope */}
        <div style={{display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderBottom:"1.25px dashed #1a1a1a", background:"#fff8e8"}}>
          <span className="hand-en" style={{fontSize:13, color:"var(--ink-3)"}}>作用于：</span>
          <span className="tag accent" style={{fontSize:12}}>✓ 选中文字</span>
          <span className="tag" style={{fontSize:12}}>当前段</span>
          <span className="tag" style={{fontSize:12}}>当前章</span>
          <span className="tag" style={{fontSize:12}}>光标处插入</span>
          <span style={{flex:1}}/>
          <span className="hand-en" style={{fontSize:13, color:"var(--ink-3)"}}>引用：</span>
          <span className="tag" style={{fontSize:12}}>@沈砚</span>
          <span className="tag warm" style={{fontSize:12}}>@铜牌</span>
          <span className="tag" style={{fontSize:12}}>+ @</span>
        </div>

        {/* body 2 col */}
        <div style={{flex:1, display:"flex", overflow:"hidden"}}>
          {/* left: groups */}
          <div style={{width:680, padding:"10px 18px 14px", overflow:"hidden", borderRight:"1.25px dashed #1a1a1a"}}>
            {groups.map((gr,i)=>(
              <div key={i} style={{marginBottom:10}}>
                <div style={{display:"flex", alignItems:"baseline", gap:6}}>
                  <span className="hand-en" style={{color:"var(--accent)", fontSize:15}}>{gr.k}</span>
                  <span className="hand-cn" style={{fontSize:15}}>{gr.g}</span>
                  <span className="hand-en muted" style={{fontSize:11}}>{gr.items.length} 条</span>
                </div>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", columnGap:10, rowGap:1, marginTop:2}}>
                  {gr.items.map((it,j)=>(
                    <div key={j} className={i===0&&j===3?"sk-box thin":""} style={{
                      padding: i===0&&j===3 ? "4px 6px" : "3px 6px",
                      background: i===0&&j===3 ? "#fff8e8":"transparent",
                      borderColor: i===0&&j===3 ? "var(--accent)":"transparent",
                      borderRadius:5,
                    }}>
                      <div style={{display:"flex", alignItems:"baseline", gap:6}}>
                        <span className="hand-en" style={{fontSize:11, color: i===0&&j===3?"var(--accent)":"var(--ink-3)", minWidth:30}}>{it.k}</span>
                        <span className="hand-cn" style={{fontSize:13, color: i===0&&j===3?"var(--accent)":"var(--ink)"}}>{it.t}</span>
                      </div>
                      {it.s && <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginLeft:36, lineHeight:"15px"}}>{it.s}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* right: preview */}
          <div style={{flex:1, padding:"10px 18px", overflow:"hidden", display:"flex", flexDirection:"column"}}>
            <div className="hand-cn" style={{fontSize:14}}>预览 · ⌥S 为本章起 3 个开头</div>
            <div className="hand-en muted" style={{fontSize:11, marginBottom:6}}>选中后回车将插入到光标处</div>

            <div className="sk-box thin" style={{padding:"8px 10px", marginBottom:6, background:"#fff", borderColor:"var(--accent)"}}>
              <div className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>候选 1 · 冷峻</div>
              <div className="serif" style={{fontSize:13, lineHeight:"21px"}}>雪压着城。沈砚走到城门下时，灯笼正灭。</div>
            </div>
            <div className="sk-box thin" style={{padding:"8px 10px", marginBottom:6, background:"#fff"}}>
              <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>候选 2 · 钩子型</div>
              <div className="serif" style={{fontSize:13, lineHeight:"21px"}}>这是沈砚记忆里第三盏不该灭的灯——前两盏，都是他父亲身边的。</div>
            </div>
            <div className="sk-box thin" style={{padding:"8px 10px", marginBottom:6, background:"#fff"}}>
              <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>候选 3 · 古风</div>
              <div className="serif" style={{fontSize:13, lineHeight:"21px"}}>朔风未止，雪夜城下，一人一剑。城门未开，铜牌已凉。</div>
            </div>

            <div style={{flex:1}}/>

            <div className="sk-rule dashed" style={{margin:"6px 0"}}/>
            <div className="hand-en" style={{fontSize:12, color:"var(--ink-3)"}}>最近</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:4, marginTop:4}}>
              <span className="tag" style={{fontSize:11}}>⌥1 戏谑</span>
              <span className="tag" style={{fontSize:11}}>⌥3 五感</span>
              <span className="tag" style={{fontSize:11}}>@白如霜</span>
              <span className="tag" style={{fontSize:11}}>⌥F 标伏笔</span>
            </div>
          </div>
        </div>

        {/* footer hints */}
        <div style={{display:"flex", alignItems:"center", gap:14, padding:"8px 18px", borderTop:"1.5px solid #1a1a1a", background:"#f3f1e8"}} className="hand-en">
          <span><b style={{color:"var(--accent)"}}>↑↓</b> 选择</span>
          <span><b style={{color:"var(--accent)"}}>↩</b> 执行</span>
          <span><b style={{color:"var(--accent)"}}>⇥</b> 试一下</span>
          <span><b style={{color:"var(--accent)"}}>⌘↩</b> 取多版</span>
          <span><b style={{color:"var(--accent)"}}>⎋</b> 关闭</span>
          <span style={{flex:1}}/>
          <span style={{color:"var(--ink-3)"}}>· 5 组 · 22 条指令 · 也可直接用自然语言</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { V1Kanban, V1Timeline, V1Palette });
