/* global React */
const { useState } = React;

/* ===== Common bits ============================================== */
const TopBar = ({ title }) => (
  <div className="titlebar">
    <span className="lights"><i/><i/><i/></span>
    <span className="brush" style={{fontSize:22}}>小说studio</span>
    <span className="muted hand-en" style={{fontSize:16}}>/ {title}</span>
    <span style={{flex:1}}/>
    <span className="hand-en muted">⌘K · 召唤 AI</span>
    <span className="hand-en">自动保存 ✓</span>
    <span className="stamp" style={{width:34,height:34,fontSize:11,borderWidth:2}}>小说<br/>studio</span>
  </div>
);

const FakeText = ({ lines=6, indent=true, width="100%" }) => (
  <div style={{width}}>
    {Array.from({length:lines}).map((_,i)=>(
      <div key={i} style={{
        height:10, margin:"10px 0",
        background:"linear-gradient(90deg,#1a1a1a 0,#1a1a1a 100%)",
        opacity: i===lines-1? 0.35: 0.78,
        width: i===0 && indent ? "62%" : (i===lines-1 ? `${30+Math.random()*30}%`: `${78+Math.random()*18}%`),
        borderRadius:2,
      }}/>
    ))}
  </div>
);

const Para = ({ children, dim=false }) => (
  <div className="serif" style={{
    fontSize:15, lineHeight:"30px",
    color: dim? "var(--ink-3)":"var(--ink)",
    textIndent:"2em", marginBottom:6,
  }}>{children}</div>
);

/* annotation arrow w/ text */
const Annot = ({ x, y, w=180, children, rotate=-3, align="left" }) => (
  <div className="annot" style={{left:x, top:y, width:w, transform:`rotate(${rotate}deg)`, textAlign:align}}>
    <span className="lbl">{children}</span>
  </div>
);

/* ===== 1) Three-pane classic ===================================== */
function W1ThreePane(){
  return (
    <div className="ab">
      <TopBar title="《剑入星海》第 042 章 · 雪夜城下"/>

      {/* Left: chapter tree */}
      <div className="sk-box" style={{position:"absolute", left:14, top:48, width:230, bottom:14, padding:"14px 12px", background:"#fff"}}>
        <div className="hand-cn" style={{fontSize:18, marginBottom:6}}>章节目录</div>
        <div className="squiggle" style={{marginBottom:10}}/>
        <input className="hand-en" placeholder="🔍 搜索章节 / 人物" style={{width:"100%", padding:"4px 8px", border:"1.25px dashed #1a1a1a", borderRadius:6, background:"transparent", fontSize:14, marginBottom:10}}/>

        {[
          {t:"卷一 · 少年入江湖", open:true, kids:[
            {t:"01 雨夜下山", w:"3.2k"},
            {t:"02 镇上来客", w:"2.8k"},
            {t:"…"},
            {t:"40 老者出剑", w:"3.4k"},
            {t:"41 城门密谈", w:"3.1k"},
          ]},
          {t:"卷二 · 雪夜入城", open:true, current:true, kids:[
            {t:"42 雪夜城下", w:"1.2k", current:true},
            {t:"43 城主之女", w:"—", draft:true},
            {t:"+ 新建章节", add:true},
          ]},
          {t:"卷三 · 北望", open:false},
        ].map((c,i)=>(
          <div key={i} style={{marginBottom:10}}>
            <div className="hand-cn" style={{fontSize:15, color: c.current?"var(--accent)":"var(--ink)"}}>
              {c.open? "▾":"▸"} {c.t}
            </div>
            {c.kids && c.kids.map((k,j)=>(
              <div key={j} className="hand-en" style={{
                fontSize:15, margin:"4px 0 4px 16px",
                color: k.current?"var(--accent)": (k.draft?"var(--ink-3)":"var(--ink-2)"),
                display:"flex", alignItems:"center", gap:6
              }}>
                {k.add? <span className="hand-en" style={{color:"var(--accent)"}}>{k.t}</span> :
                  <>
                    <span className={"dot"+(k.current?"":" hollow")}/>
                    <span style={{flex:1}}>{k.t}</span>
                    <span className="muted" style={{fontSize:13}}>{k.w}</span>
                  </>
                }
              </div>
            ))}
          </div>
        ))}

        <div style={{position:"absolute", left:12, right:12, bottom:12}}>
          <div className="sk-rule dashed"/>
          <div className="hand-cn" style={{fontSize:14, marginTop:8}}>设定库 · 人物 · 时间线</div>
          <div style={{display:"flex", gap:6, marginTop:6, flexWrap:"wrap"}}>
            <span className="tag">人物 23</span>
            <span className="tag">地点 11</span>
            <span className="tag warm">伏笔 7</span>
          </div>
        </div>
      </div>

      {/* Center: editor */}
      <div className="sk-box fill-w corner-curl" style={{position:"absolute", left:258, right:362, top:48, bottom:14, padding:"22px 36px", overflow:"hidden"}}>
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:6}}>
          <div className="brush" style={{fontSize:32}}>第 42 章 · 雪夜城下</div>
          <div className="hand-en muted" style={{fontSize:15}}>1,243 / 3,000 字 · 目标 ▓▓▓▓▓░░░░░ 41%</div>
        </div>
        <div className="squiggle accent" style={{marginBottom:14}}/>

        <Para>
          雪线压着城墙，像一道压了三天三夜的眉。沈砚把斗篷往下扯，露出半张冻青的脸——城门口的灯笼在风里晃，像是要熄，又像是有人正在里头喘气。
        </Para>
        <Para>
          "外乡人？" 守门兵的矛尖斜下来，带着雪。
        </Para>
        <Para>
          沈砚没答话，从怀里摸出半枚铜牌，铜牌缺角的地方还沾着旧血。守门兵的脸色一下变了，矛尖收回去比抽出来还快。
        </Para>
        <Para dim>
          ▌ <span className="hand-en">AI 正在续写中…</span>
        </Para>

        {/* slash menu hint */}
        <div className="sk-box" style={{position:"absolute", left:120, bottom:130, padding:"6px 10px", background:"#fff8e8", borderColor:"var(--accent)"}}>
          <span className="hand-en" style={{color:"var(--accent)"}}>/续写 · /扩写 · /换个语气 · /冲突升级 · /反转</span>
        </div>

        {/* bottom toolbar */}
        <div style={{position:"absolute", left:0, right:0, bottom:0, borderTop:"1.5px solid #1a1a1a", height:34, padding:"6px 16px", display:"flex", alignItems:"center", gap:14, background:"#f3f1e8"}}>
          <span className="hand-en">B  I  U</span>
          <span className="muted">|</span>
          <span className="hand-en">"对话"</span>
          <span className="hand-en">— 分隔 —</span>
          <span style={{flex:1}}/>
          <span className="tag accent hand-en">敏感词 0</span>
          <span className="hand-en">字体 衬线 · 17px</span>
        </div>
      </div>

      {/* Right: AI chat */}
      <div className="sk-box" style={{position:"absolute", right:14, top:48, width:340, bottom:14, padding:"14px 14px", background:"#fff"}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span className="sk-ribbon">AI 编辑助手</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted">⌘.</span>
        </div>
        <div className="hand-cn" style={{fontSize:13, color:"var(--ink-3)", margin:"6px 0 10px"}}>
          上下文：第 42 章 · 沈砚 / 守门兵 / 雪夜
        </div>
        <div className="sk-rule dashed"/>

        {/* preset chips */}
        <div style={{display:"flex", flexWrap:"wrap", gap:6, margin:"10px 0"}}>
          {["续写一段","让对话更紧绷","加一个伏笔","校对错字","降低 AI 味","查一下设定"].map(t=>(
            <span key={t} className="tag">{t}</span>
          ))}
        </div>

        {/* chat bubbles */}
        <div className="sk-box thin fill-2" style={{padding:"8px 10px", marginBottom:8}}>
          <div className="hand-en" style={{fontSize:14, color:"var(--ink-2)"}}>你 · 11:42</div>
          <div className="hand-cn" style={{fontSize:15}}>守门兵让步太快了，能让他多怀疑一点吗？</div>
        </div>
        <div className="sk-box thin" style={{padding:"8px 10px", background:"#fff8e8", borderColor:"var(--accent)", marginBottom:8}}>
          <div className="hand-en" style={{fontSize:14, color:"var(--accent)"}}>AI · 11:42</div>
          <FakeText lines={4} indent={false}/>
          <div style={{display:"flex", gap:6, marginTop:4}}>
            <span className="tag accent">替换正文</span>
            <span className="tag">追加</span>
            <span className="tag">再来一个</span>
          </div>
        </div>

        {/* input */}
        <div className="sk-box dashed" style={{position:"absolute", left:14, right:14, bottom:14, padding:"8px 10px", background:"#fff"}}>
          <div className="hand-en muted" style={{fontSize:14}}>↩ 提问 · ⇧↩ 换行 · @ 引用人物/章节</div>
          <div style={{height:36}}/>
          <div style={{display:"flex", gap:6}}>
            <span className="tag">@沈砚</span>
            <span className="tag warm">@第 41 章</span>
            <span style={{flex:1}}/>
            <span className="tag accent">发送 ⏎</span>
          </div>
        </div>
      </div>

      {/* annotations */}
      <Annot x={20} y={420} w={170}>章节树 · 拖拽排序</Annot>
      <Annot x={500} y={70} w={170} rotate={2}>正文 = 主舞台</Annot>
      <Annot x={960} y={60} w={170} rotate={3}>AI 永远在右</Annot>
      <Annot x={150} y={620} w={210} rotate={-4}>设定库一键 @ 引用</Annot>
    </div>
  );
}

/* ===== 2) Focus + floating command palette ====================== */
function W2Focus(){
  return (
    <div className="ab" style={{background:"#fbf9f1"}}>
      <TopBar title="《剑入星海》· 专注模式"/>

      {/* edge dock - left */}
      <div style={{position:"absolute", left:10, top:80, display:"flex", flexDirection:"column", gap:14}}>
        {[
          ["☰","目录"],["✦","设定"],["⌘","命令"],["⌖","专注"],["↺","历史"]
        ].map(([i,t],k)=>(
          <div key={k} className="sk-box thin" style={{width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", background:"#fff"}}>
            <span className="hand-en" style={{fontSize:18}}>{i}</span>
          </div>
        ))}
      </div>

      {/* edge dock - right (minimap) */}
      <div className="sk-box thin" style={{position:"absolute", right:10, top:80, width:50, bottom:80, background:"#fff", padding:"8px 6px"}}>
        <div className="hand-en muted" style={{fontSize:12, textAlign:"center", marginBottom:6}}>章</div>
        {Array.from({length:14}).map((_,i)=>(
          <div key={i} style={{height:14, marginBottom:6, background: i===5?"var(--accent)":"#1a1a1a", opacity: i===5?1:0.18, borderRadius:2}}/>
        ))}
        <div className="hand-en" style={{fontSize:12, textAlign:"center", color:"var(--accent)"}}>42</div>
      </div>

      {/* paper */}
      <div style={{position:"absolute", left:80, right:80, top:60, bottom:50, display:"flex", justifyContent:"center"}}>
        <div className="sk-box fill-w corner-curl ruled" style={{width:720, padding:"40px 64px", position:"relative"}}>
          <div className="brush" style={{fontSize:38, textAlign:"center"}}>雪 夜 城 下</div>
          <div className="hand-en muted" style={{textAlign:"center", marginBottom:18}}>chapter 42 · draft</div>
          <div className="squiggle" style={{margin:"0 80px 24px"}}/>

          <Para>雪线压着城墙，像一道压了三天三夜的眉。沈砚把斗篷往下扯，露出半张冻青的脸。</Para>
          <Para>"外乡人？" 守门兵的矛尖斜下来，带着雪。</Para>
          <Para>沈砚没答话。他从怀里摸出半枚铜牌，铜牌缺角的地方还沾着旧血。</Para>
          <Para dim>—— 选中以下文字以唤起 AI ——</Para>
          <Para>
            <span style={{background:"#fff2cf", padding:"0 2px"}}>守门兵的脸色一下变了，矛尖收回去比抽出来还快。</span>
          </Para>

          {/* hovering AI chip near selection */}
          <div className="sk-box" style={{position:"absolute", right:30, top:300, padding:"4px 8px", background:"var(--accent)", color:"#fff", borderColor:"var(--accent)"}}>
            <span className="hand-en" style={{fontSize:14, color:"#fff"}}>✦ 改写 · 扩写 · 解释</span>
          </div>

          {/* footer status */}
          <div style={{position:"absolute", left:30, right:30, bottom:18, display:"flex", justifyContent:"space-between"}} className="hand-en muted">
            <span>已写 1,243 字 · 今日 2,140 字</span>
            <span>⌘K 任何指令</span>
          </div>
        </div>
      </div>

      {/* floating command palette */}
      <div className="sk-box thick" style={{
        position:"absolute", left:"50%", top:"50%",
        transform:"translate(-50%,-30%) rotate(-0.6deg)",
        width:560, padding:"14px 16px", background:"#fff",
        boxShadow:"6px 8px 0 rgba(0,0,0,0.12)"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
          <span className="hand-en" style={{fontSize:18, color:"var(--accent)"}}>✦</span>
          <input className="hand-cn" defaultValue="让这段对话更紧绷，加一个让沈砚迟疑的细节" style={{flex:1, border:0, outline:"none", fontSize:18, background:"transparent"}}/>
          <span className="tag">⌘K</span>
        </div>
        <div className="sk-rule dashed"/>
        <div className="hand-cn muted" style={{fontSize:13, margin:"8px 0 4px"}}>建议</div>
        {[
          ["✎","改写选中文字（更紧绷）"],
          ["+","在此处续写 200 字"],
          ["?","解释这一句的隐含信息"],
          ["⇆","换一种语气（冷峻 → 戏谑）"],
          ["@","查一下沈砚的铜牌设定"],
          ["⚐","标记伏笔 · 后续回收"],
        ].map(([k,v],i)=>(
          <div key={i} className="hand-cn" style={{
            display:"flex", gap:10, padding:"6px 8px", borderRadius:6,
            background: i===0? "#fff8e8":"transparent",
            color: i===0?"var(--accent)":"var(--ink)", fontSize:16
          }}>
            <span style={{width:18, textAlign:"center"}} className="hand-en">{k}</span>
            <span style={{flex:1}}>{v}</span>
            <span className="hand-en muted" style={{fontSize:13}}>↩</span>
          </div>
        ))}
      </div>

      <Annot x={56} y={70} w={170}>侧边收起 · 只剩纸</Annot>
      <Annot x={460} y={28} w={220} rotate={1.5}>⌘K = AI 召唤</Annot>
      <Annot x={1110} y={70} w={150} rotate={4}>右边小地图<br/>跳章节</Annot>
      <Annot x={120} y={680} w={240} rotate={-2}>选中文字 → 浮起气泡</Annot>
    </div>
  );
}

/* ===== 3) Outline kanban first ================================== */
function W3Outline(){
  const arcs = [
    {
      title:"卷一 · 少年入江湖", color:"#fff",
      cards:[
        {t:"01 雨夜下山", s:"少年 / 师父 / 出门", w:"3.2k", done:true},
        {t:"02 镇上来客", s:"小酒馆遇刺", w:"2.8k", done:true},
        {t:"03 第一次出剑", s:"⚐ 铜牌伏笔 #1", w:"3.0k", flag:true},
        {t:"… 38 章 …", muted:true},
      ]
    },
    {
      title:"卷二 · 雪夜入城", color:"#fff8e8", current:true,
      cards:[
        {t:"41 城门密谈", s:"老者出剑 · 半枚铜牌", w:"3.1k", done:true},
        {t:"42 雪夜城下", s:"🖊 进行中 · 沈砚入城", w:"1.2k", current:true},
        {t:"43 城主之女", s:"AI 草稿 · 待润色", w:"0.8k", draft:true},
        {t:"44 ?", s:"⚐ 转折点 / 待写", placeholder:true},
        {t:"+ 新章节", add:true},
      ]
    },
    {
      title:"卷三 · 北望（规划中）", color:"#fff",
      cards:[
        {t:"⌗ 主线", s:"沈砚 vs 城主", w:"", note:true},
        {t:"⌗ 副线", s:"铜牌真相", note:true},
        {t:"⌗ 反派", s:"未命名 · AI 起 3 个"},
        {t:"…", muted:true},
      ]
    },
  ];

  return (
    <div className="ab">
      <TopBar title="《剑入星海》· 结构视图"/>

      {/* sub tabs */}
      <div style={{position:"absolute", left:14, top:48, right:14, display:"flex", gap:18, borderBottom:"1.5px solid #1a1a1a", padding:"10px 6px"}}>
        {["看板","时间线","人物关系","数据"].map((t,i)=>(
          <div key={t} className="hand-cn" style={{fontSize:18, position:"relative", color: i===0?"var(--accent)":"var(--ink)"}}>
            {t}
            {i===0 && <div style={{position:"absolute", left:-4, right:-4, bottom:-12, height:3, background:"var(--accent)", borderRadius:2}}/>}
          </div>
        ))}
        <span style={{flex:1}}/>
        <span className="hand-en muted">视图 · 卷 / 弧线 / 节拍</span>
        <span className="tag accent">+ 章节</span>
        <span className="tag">AI 续写大纲</span>
      </div>

      {/* board */}
      <div style={{position:"absolute", left:14, right:14, top:104, bottom:170, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14}}>
        {arcs.map((arc,i)=>(
          <div key={i} className="sk-box" style={{padding:"14px 12px", background:arc.color, position:"relative"}}>
            <div className="hand-cn" style={{fontSize:18, color: arc.current?"var(--accent)":"var(--ink)"}}>
              {arc.current?"▌ ":""}{arc.title}
            </div>
            <div className="squiggle" style={{margin:"6px 0 10px"}}/>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              {arc.cards.map((c,j)=>(
                <div key={j} className={"sk-box thin"+(c.placeholder?" dashed":"")} style={{
                  padding:"8px 10px",
                  background: c.current? "#fff": (c.add?"transparent": (c.note?"#f3f1e8":"#fff")),
                  borderColor: c.current?"var(--accent)":"#1a1a1a",
                  opacity: c.muted? 0.4:1,
                  textAlign: c.add?"center":"left",
                }}>
                  {c.add ? (
                    <span className="hand-cn" style={{color:"var(--accent)"}}>{c.t}</span>
                  ) : c.muted ? (
                    <span className="hand-en muted">{c.t}</span>
                  ) : (
                    <>
                      <div style={{display:"flex", alignItems:"center", gap:6}}>
                        <span className={"check"+(c.done?" done":"")}/>
                        <span className="hand-cn" style={{fontSize:15, color: c.current?"var(--accent)":(c.draft?"var(--ink-2)":"var(--ink)")}}>{c.t}</span>
                        <span style={{flex:1}}/>
                        {c.w && <span className="hand-en muted" style={{fontSize:13}}>{c.w}</span>}
                      </div>
                      <div className="hand-cn" style={{fontSize:13, color:"var(--ink-2)", marginLeft:20, marginTop:2}}>{c.s}</div>
                      {c.flag && <div className="tag warm" style={{marginLeft:20, marginTop:4, fontSize:13}}>⚐ 伏笔</div>}
                      {c.draft && <div className="tag" style={{marginLeft:20, marginTop:4, fontSize:13, background:"#fff8e8", borderColor:"var(--accent)", color:"var(--accent)"}}>AI 草稿</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* bottom: open chapter peek */}
      <div className="sk-box fill-w" style={{position:"absolute", left:14, right:14, bottom:14, height:144, padding:"10px 14px", display:"flex", gap:14}}>
        <div style={{flex:"0 0 220px"}}>
          <div className="hand-cn" style={{fontSize:15}}><span className="pin">▌</span> 42 · 雪夜城下</div>
          <div className="hand-en muted" style={{fontSize:13}}>1,243 字 · 草稿 · 12 分钟前</div>
          <div className="squiggle" style={{margin:"6px 0"}}/>
          <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
            <span className="tag">沈砚</span>
            <span className="tag">守门兵</span>
            <span className="tag warm">⚐ 铜牌</span>
          </div>
          <div className="tag accent hand-en" style={{marginTop:8, display:"inline-block"}}>打开正文 →</div>
        </div>
        <div style={{flex:1, position:"relative"}}>
          <div className="hand-cn muted" style={{fontSize:13}}>章节预览</div>
          <FakeText lines={4} indent={false}/>
        </div>
        <div style={{flex:"0 0 240px"}}>
          <div className="hand-cn" style={{fontSize:14}}>AI 节拍建议</div>
          <div className="sk-box thin" style={{padding:"6px 8px", marginTop:6, background:"#fff8e8", borderColor:"var(--accent)"}}>
            <span className="hand-cn" style={{fontSize:13, color:"var(--accent)"}}>第 42 章已铺垫 3 处冲突，建议在 43 章前给一个"喘息"段落。</span>
          </div>
          <div style={{display:"flex", gap:6, marginTop:6}}>
            <span className="tag">采纳</span>
            <span className="tag">忽略</span>
            <span className="tag accent">让 AI 起 3 版</span>
          </div>
        </div>
      </div>

      <Annot x={30} y={150} w={170} rotate={-3}>故事 = 卡片</Annot>
      <Annot x={500} y={150} w={240} rotate={2}>当前卷高亮 · 拖卡片改顺序</Annot>
      <Annot x={1040} y={150} w={180} rotate={3}>AI 起反派<br/>/ 起副线</Annot>
      <Annot x={500} y={650} w={260} rotate={-1.5}>下方常驻：当前章节预览 + AI 节拍建议</Annot>
    </div>
  );
}

/* ===== 4) Inline ghost-text Cursor-style ======================== */
function W4Inline(){
  return (
    <div className="ab">
      <TopBar title="《剑入星海》· 行内续写"/>

      {/* slim left rail */}
      <div className="sk-box" style={{position:"absolute", left:14, top:48, width:54, bottom:14, padding:"10px 0", background:"#fff", display:"flex", flexDirection:"column", alignItems:"center", gap:12}}>
        {["≡","✦","⚐","◷","☼"].map((s,i)=>(
          <div key={i} className="hand-en" style={{fontSize:20, color: i===1?"var(--accent)":"var(--ink-2)"}}>{s}</div>
        ))}
      </div>

      {/* editor */}
      <div className="sk-box fill-w" style={{position:"absolute", left:78, right:340, top:48, bottom:14, padding:"22px 36px", overflow:"hidden"}}>
        <div className="brush" style={{fontSize:28}}>第 42 章 · 雪夜城下</div>
        <div className="squiggle" style={{margin:"6px 0 18px"}}/>

        <Para>雪线压着城墙，像一道压了三天三夜的眉。沈砚把斗篷往下扯，露出半张冻青的脸。</Para>
        <Para>"外乡人？" 守门兵的矛尖斜下来，带着雪。</Para>
        <Para>沈砚没答话。他从怀里摸出半枚<u style={{textDecorationStyle:"dotted"}}>铜牌</u>，铜牌缺角的地方还沾着旧血。</Para>

        {/* setting popover linked from underline */}
        <div className="sk-box" style={{position:"absolute", left:340, top:240, width:240, padding:"10px 12px", background:"#fff", boxShadow:"3px 4px 0 rgba(0,0,0,0.1)"}}>
          <div className="hand-cn" style={{fontSize:14}}>📜 设定 · 半枚铜牌</div>
          <div className="sk-rule dashed" style={{margin:"6px 0"}}/>
          <div className="serif" style={{fontSize:13, lineHeight:"22px"}}>北疆军中信物，缺角者为叛逃之证。沈砚从父亲尸身上取下。</div>
          <div className="hand-en muted" style={{fontSize:13, marginTop:6}}>首次出现 · 第 17 章</div>
          <div style={{display:"flex", gap:6, marginTop:6}}>
            <span className="tag">跳转</span>
            <span className="tag">编辑设定</span>
          </div>
        </div>

        {/* current paragraph with ghost text */}
        <div style={{marginTop:80}}>
          <Para>
            守门兵的脸色一下变了。
            <span style={{color:"var(--accent)", background:"rgba(217,84,43,0.08)", padding:"0 2px", borderRadius:3}}>
              {" "}他喉头滚了一下，把矛尖收得比抽出来还快，又下意识地往身后看了一眼——城楼上那盏灯，今夜竟没人去添油。
            </span>
            <span className="hand-en" style={{color:"var(--accent)", marginLeft:6, fontSize:14}}> ⇥ Tab 接受 · Esc 拒绝</span>
          </Para>
        </div>

        {/* selection toolbar floating */}
        <div className="sk-box" style={{position:"absolute", left:340, bottom:90, padding:"6px 10px", background:"#1a1a1a", color:"#fff", borderColor:"#1a1a1a"}}>
          <span className="hand-en" style={{color:"#fff", fontSize:14}}>✦ 改写 · 缩写 · 加细节 · ⌘K 自定义</span>
        </div>

        <div style={{position:"absolute", left:36, bottom:14, right:36, display:"flex", justifyContent:"space-between"}} className="hand-en muted">
          <span>Tab = 接受 AI · Esc = 拒绝 · ⌥⏎ = 换一版</span>
          <span>1,243 / 3,000 字</span>
        </div>
      </div>

      {/* right: context inspector */}
      <div className="sk-box" style={{position:"absolute", right:14, top:48, width:318, bottom:14, padding:"14px 14px", background:"#fff"}}>
        <div className="hand-cn" style={{fontSize:18}}>上下文 · 设定库</div>
        <div className="hand-en muted" style={{fontSize:13, margin:"2px 0 8px"}}>AI 看到的 = 这里</div>
        <div className="squiggle" style={{marginBottom:10}}/>

        <div className="hand-cn" style={{fontSize:14, marginBottom:4}}>本章涉及</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:10}}>
          <span className="tag accent">沈砚</span>
          <span className="tag">守门兵</span>
          <span className="tag warm">⚐ 半枚铜牌</span>
          <span className="tag">雪夜 / 城下</span>
        </div>

        <div className="sk-box thin" style={{padding:"8px 10px", marginBottom:8, background:"#fafaf6"}}>
          <div className="hand-cn" style={{fontSize:14}}>👤 沈砚 <span className="muted hand-en" style={{fontSize:12}}>· 主角</span></div>
          <div className="serif" style={{fontSize:13, lineHeight:"20px", color:"var(--ink-2)"}}>17 岁。话少，握剑的右手有冻疮。父亲死于北疆。</div>
          <div className="hand-en muted" style={{fontSize:12, marginTop:4}}>口头禅 · 句式 · 关系图 →</div>
        </div>
        <div className="sk-box thin" style={{padding:"8px 10px", marginBottom:8, background:"#fafaf6"}}>
          <div className="hand-cn" style={{fontSize:14}}>⚐ 伏笔 · 铜牌</div>
          <div className="serif" style={{fontSize:13, lineHeight:"20px", color:"var(--ink-2)"}}>首次：第 17 章。计划回收：第 60 章前后。</div>
          <div className="tag warm" style={{marginTop:4, fontSize:12}}>距回收还有 18 章</div>
        </div>

        <div className="hand-cn" style={{fontSize:14, margin:"10px 0 4px"}}>风格记忆</div>
        <div className="sk-box thin dashed" style={{padding:"8px 10px"}}>
          <div className="serif" style={{fontSize:13, lineHeight:"20px"}}>短句。比喻偏冷。少用"突然"。对话不写"道""说"。</div>
          <div className="hand-en muted" style={{fontSize:12, marginTop:4}}>来自前 41 章自动学习 · 可编辑</div>
        </div>

        <div style={{position:"absolute", left:14, right:14, bottom:14}}>
          <div className="sk-rule dashed"/>
          <div className="hand-cn" style={{fontSize:13, marginTop:8}}>合规与口味</div>
          <div style={{display:"flex", gap:6, marginTop:4, flexWrap:"wrap"}}>
            <span className="tag">敏感词 0</span>
            <span className="tag">"AI 味" 低</span>
            <span className="tag warm">爽点密度 中</span>
          </div>
        </div>
      </div>

      <Annot x={86} y={70} w={170} rotate={-2}>左侧极窄 · 把舞台让给字</Annot>
      <Annot x={420} y={420} w={220} rotate={2}>朱砂 = AI 续写候选<br/>Tab 接收 · Esc 拒绝</Annot>
      <Annot x={340} y={210} w={200} rotate={-3}>下划线 = 设定词<br/>悬停看卡片</Annot>
      <Annot x={930} y={70} w={170} rotate={3}>右侧 = AI 真正看到的上下文</Annot>
    </div>
  );
}

Object.assign(window, { W1ThreePane, W2Focus, W3Outline, W4Inline });
