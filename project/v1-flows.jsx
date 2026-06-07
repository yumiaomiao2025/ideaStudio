/* global React */
/* ============================================================
   v1 流程页
   - V1Inspect:  AI 巡检中心（提醒/告警 inbox）
   - V1Onboard:  新书向导（0→1 引导流）
   ============================================================ */

/* ===== AI 巡检中心 ============================================ */
function V1Inspect(){
  const cats = [
    {k:"一致性", icon:"⚠", n:4, color:"#d9542b", active:true},
    {k:"伏笔",   icon:"⚐", n:3, color:"#c9a227"},
    {k:"节奏",   icon:"♪", n:2, color:"#1a1a1a"},
    {k:"命名",   icon:"✎", n:1, color:"#1a1a1a"},
    {k:"设定空缺", icon:"☱", n:2, color:"#1a1a1a"},
    {k:"合规",   icon:"⚖", n:3, color:"#1a1a1a"},
    {k:"风格漂移",icon:"~", n:1, color:"#1a1a1a"},
  ];

  const alerts = [
    {
      sev:"高", sevColor:"#d9542b", cat:"一致性",
      title:"沈砚的酒量前后矛盾",
      ctxA:'第 22 章 · "沈砚摇头：『我不喝。』"',
      ctxB:'第 31 章 · "沈砚连饮三盏，雪夜不寒。"',
      sug:"是否登记为人物成长（19 岁后开始饮酒），或修改其中一段？",
      actions:[["改 22","accent"],["改 31",""],["登记成长",""],["忽略",""]],
      expanded:true,
    },
    {
      sev:"高", sevColor:"#d9542b", cat:"伏笔",
      title:"半枚铜牌已埋 25 章未回收",
      ctxA:'埋于 第 17 章 · 距计划回收（第 60 章）还有 18 章',
      sug:"建议在 50 章前给一次小回响（沈砚再次取出端详），避免读者遗忘。",
      actions:[["AI 起 3 版回响","accent"],["改回收时机",""],["忽略",""]],
    },
    {
      sev:"中", sevColor:"#c9a227", cat:"命名",
      title:'"沈砚" 与 《夜读》主角 "陈砚" 重名',
      ctxA:'跨书检测 · 你的另一本《夜读 · 都市修真录》',
      sug:"AI 已起 3 个不重名候选：沈翊 / 沈研 / 沈晏。也可保留。",
      actions:[["看候选","accent"],["保留",""],["关闭跨书检查",""]],
    },
    {
      sev:"中", sevColor:"#c9a227", cat:"节奏",
      title:"连续 3 章无新伏笔 · 推进感偏平",
      ctxA:'第 40-42 章 · 张力曲线低于均值 18%',
      sug:"在 43-44 章插入 1 个小钩子，或回收「灯无人添油」。",
      actions:[["插钩子","accent"],["回收旧伏笔",""],["AI 改大纲",""],["忽略",""]],
    },
    {
      sev:"中", sevColor:"#c9a227", cat:"设定空缺",
      title:'"北疆军营 · 寒鸦坞" 缺基础布局',
      ctxA:'已在 3 章被提及 · 仅有外观，无内部',
      sug:"AI 草拟 80 字 setting，可直接采纳。",
      actions:[["让 AI 起草","accent"],["我自己写",""],["暂不",""]],
    },
    {
      sev:"低", sevColor:"#1a1a1a", cat:"合规",
      title:'本章 "刺杀" 一词在七猫触发敏感',
      ctxA:'第 7 段 · 起点 OK · 番茄 OK · 七猫 ⚠',
      sug:"七猫平台建议改「暗杀」或「行刺」。",
      actions:[["AI 替换","accent"],["跳到段落",""],["忽略",""]],
    },
    {
      sev:"低", sevColor:"#1a1a1a", cat:"风格漂移",
      title:"本章对话占比 41% · 历史均值 23%",
      ctxA:'第 42 章 · 偏向 "对白驱动" · 可能拖慢',
      sug:"如有意为之，可忽略；否则缩减或加入动作/环境描写。",
      actions:[["精简对话","accent"],["这就是我要的",""]],
    },
    {
      sev:"低", sevColor:"#1a1a1a", cat:"伏笔",
      title:'"灯无人添油" 是新伏笔吗？',
      ctxA:'刚写在 第 42 章 末尾 · 未登记',
      sug:"我猜是伏笔。是否标记并设置回收章节？",
      actions:[["是 · 自动标记","accent"],["不是 · 只是环境",""]],
    },
  ];

  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 巡检中心</span>
        <span style={{flex:1}}/>
        <span className="hand-en muted">每 6 章自动巡检 · 也可 ⌘⇧I 手动</span>
      </div>

      {/* hero */}
      <div style={{position:"absolute", left:14, right:14, top:50, padding:"14px 18px", display:"flex", alignItems:"center", gap:18}}>
        <div>
          <div className="brush" style={{fontSize:34}}>巡检中心</div>
          <div className="hand-en muted" style={{fontSize:14}}>《剑入星海》· 16 条待处理 · 3 条已忽略 · 上次扫描 16:42</div>
        </div>
        <span style={{flex:1}}/>
        {/* severity summary */}
        <div className="sk-box thin" style={{padding:"6px 14px", display:"flex", gap:18, background:"#fff"}}>
          <div style={{textAlign:"center"}}><div className="brush" style={{fontSize:22, color:"#d9542b"}}>2</div><div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>高</div></div>
          <div style={{textAlign:"center"}}><div className="brush" style={{fontSize:22, color:"#c9a227"}}>6</div><div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>中</div></div>
          <div style={{textAlign:"center"}}><div className="brush" style={{fontSize:22, color:"#1a1a1a"}}>8</div><div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>低</div></div>
        </div>
        <span className="tag" style={{padding:"4px 12px"}}>重新扫描</span>
        <span className="tag accent" style={{padding:"4px 12px"}}>一键 AI 修</span>
      </div>

      {/* left: category nav */}
      <div className="sk-box" style={{position:"absolute", left:14, top:144, width:224, bottom:14, padding:"12px 12px", background:"#fff"}}>
        <div className="hand-cn" style={{fontSize:15, marginBottom:6}}>类别</div>
        <div className="squiggle" style={{marginBottom:10}}/>
        <div className="sk-box thin" style={{padding:"6px 8px", marginBottom:6, background:"#fff8e8", borderColor:"var(--accent)"}}>
          <div style={{display:"flex", alignItems:"center"}}>
            <span className="hand-cn" style={{fontSize:14, color:"var(--accent)"}}>全部</span>
            <span style={{flex:1}}/>
            <span className="hand-en" style={{fontSize:13, color:"var(--accent)"}}>16</span>
          </div>
        </div>
        {cats.map((c,i)=>(
          <div key={i} className={"sk-box thin"+(c.active?"":"")} style={{padding:"5px 8px", marginBottom:4, background:c.active?"#fafaf6":"transparent", borderColor:c.active?"#1a1a1a":"transparent"}}>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <span style={{color:c.color, width:16, textAlign:"center"}} className="hand-en">{c.icon}</span>
              <span className="hand-cn" style={{fontSize:13, flex:1}}>{c.k}</span>
              <span className="tag" style={{fontSize:11, padding:"0 8px", background:c.n>0?(c.color==="#d9542b"?"var(--accent)":"#fff"):"transparent", color:c.color==="#d9542b"?"#fff":"var(--ink)", borderColor:c.color}}>{c.n}</span>
            </div>
          </div>
        ))}

        <div className="sk-rule dashed" style={{margin:"12px 0 8px"}}/>
        <div className="hand-cn" style={{fontSize:14, marginBottom:4}}>范围</div>
        {[["当前书"],["全部书"],["当前卷",true],["本章"]].map(([t,a],i)=>(
          <div key={i} style={{display:"flex", alignItems:"center", gap:6, padding:"2px 0"}}>
            <span className={"check"+(a?" done":"")}/>
            <span className="hand-cn" style={{fontSize:13}}>{t}</span>
          </div>
        ))}

        <div style={{position:"absolute", left:12, right:12, bottom:12}}>
          <div className="sk-rule dashed"/>
          <div className="hand-cn" style={{fontSize:13, marginTop:8}}>本周已修</div>
          <div className="brush" style={{fontSize:22, color:"var(--accent)"}}>11</div>
          <div className="hand-en muted" style={{fontSize:11}}>采纳 9 · 自动 2</div>
        </div>
      </div>

      {/* right: alert list */}
      <div style={{position:"absolute", left:248, right:14, top:144, bottom:14, overflow:"hidden"}}>
        {/* bulk action bar */}
        <div className="sk-box thin" style={{padding:"6px 10px", marginBottom:8, background:"#fafaf6", display:"flex", alignItems:"center", gap:8}}>
          <span className={"check"}/>
          <span className="hand-en muted" style={{fontSize:13}}>已选 0 / 16</span>
          <span className="muted">|</span>
          <span className="hand-en muted" style={{fontSize:13}}>排序</span>
          <span className="tag accent" style={{fontSize:11}}>严重度</span>
          <span className="tag" style={{fontSize:11}}>章节</span>
          <span className="tag" style={{fontSize:11}}>类别</span>
          <span style={{flex:1}}/>
          <span className="tag" style={{fontSize:11}}>全部展开</span>
          <span className="tag" style={{fontSize:11}}>导出</span>
        </div>

        <div style={{height:"calc(100% - 46px)", overflow:"hidden"}}>
          {alerts.map((a,i)=>(
            <div key={i} className={"sk-box thin"+(a.expanded?" thick":"")} style={{padding:"8px 12px", marginBottom:6, background: a.expanded?"#fff":"#fafaf6", borderColor: a.expanded?a.sevColor:"#1a1a1a", display:"flex", gap:10}}>
              <span className={"check"}/>
              <span className="tag" style={{fontSize:11, height:18, padding:"0 6px", background:a.sevColor, color:"#fff", borderColor:"transparent"}}>{a.sev}</span>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex", alignItems:"baseline", gap:8}}>
                  <span className="hand-cn" style={{fontSize:14, color:a.expanded?a.sevColor:"var(--ink)"}}>{a.title}</span>
                  <span className="tag" style={{fontSize:10, padding:"0 5px"}}>{a.cat}</span>
                </div>
                <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:2}}>{a.ctxA}</div>
                {a.ctxB && <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>{a.ctxB}</div>}
                {a.expanded && (
                  <>
                    <div className="serif" style={{fontSize:12, lineHeight:"20px", color:"var(--ink-2)", marginTop:4, padding:"4px 8px", background:"#fff8e8", borderLeft:"2px solid var(--accent)"}}>
                      <span className="hand-en" style={{color:"var(--accent)"}}>✦ AI 建议：</span>{a.sug}
                    </div>
                    <div style={{display:"flex", gap:5, marginTop:6}}>
                      {a.actions.map(([t,cls],k)=>(
                        <span key={k} className={"tag "+(cls||"")} style={{fontSize:12}}>{t}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <span className="hand-en muted" style={{fontSize:11, alignSelf:"flex-start"}}>{a.expanded?"▾":"▸"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="annot" style={{left:260, top:170, transform:"rotate(-2deg)"}}>
        <span className="lbl">展开 = 看 AI 建议 + 一键修</span>
      </div>
    </div>
  );
}

/* ===== 新书向导 ============================================ */
function V1Onboard(){
  const steps = [
    {n:1, t:"题材 & 调性", state:"done"},
    {n:2, t:"主角 & 反派", state:"done"},
    {n:3, t:"卷 / 大纲", state:"current"},
    {n:4, t:"设定库", state:"future"},
    {n:5, t:"风格学习", state:"future"},
    {n:6, t:"写第 1 章", state:"future"},
  ];

  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 新书向导 · 步骤 3/6</span>
        <span style={{flex:1}}/>
        <span className="tag" style={{fontSize:12}}>我都来手写</span>
        <span className="tag" style={{fontSize:12}}>保存草稿</span>
        <span className="tag" style={{fontSize:12}}>退出</span>
      </div>

      {/* stepper */}
      <div style={{position:"absolute", left:30, right:30, top:60}}>
        <div style={{display:"flex", alignItems:"center"}}>
          {steps.map((s,i)=>{
            const isDone = s.state==="done";
            const isCur = s.state==="current";
            const fg = isCur?"var(--accent)":(isDone?"var(--ink)":"var(--ink-3)");
            return (
              <React.Fragment key={i}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <div style={{
                    width:30, height:30, borderRadius:"50%",
                    border:"1.5px "+(isCur?"solid":isDone?"solid":"dashed")+" "+fg,
                    background:isDone?"var(--ink)":(isCur?"var(--accent)":"transparent"),
                    color:isDone||isCur?"#fff":fg,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"Caveat", fontSize:16, fontWeight:700,
                  }}>{isDone?"✓":s.n}</div>
                  <div className="hand-cn" style={{fontSize:14, color:fg}}>{s.t}</div>
                </div>
                {i<steps.length-1 && <div style={{flex:1, height:0, borderTop:"1.5px "+(isDone?"solid":"dashed")+" "+(isDone?"var(--ink)":"var(--ink-3)"), margin:"0 12px"}}/>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* main content: 2 cols */}
      {/* LEFT: AI chat trace */}
      <div className="sk-box" style={{position:"absolute", left:14, top:124, width:380, bottom:14, padding:"14px 14px", background:"#fff"}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span className="sk-ribbon">AI 对谈记录</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted" style={{fontSize:12}}>步 1-2</span>
        </div>
        <div className="squiggle" style={{margin:"8px 0"}}/>

        <div className="sk-box thin" style={{padding:"6px 8px", marginBottom:6, background:"#fafaf6"}}>
          <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>AI · 题材</div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"20px"}}>主打哪类？我可以推荐近 30 天网文榜的热门子赛道。</div>
        </div>
        <div className="sk-box thin" style={{padding:"6px 8px", marginBottom:6, background:"#fff8e8", borderColor:"var(--accent)"}}>
          <div className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>你</div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"20px"}}>玄幻 + 武侠，少年成长向。我想要冷调一点，不要无脑爽。</div>
        </div>
        <div className="sk-box thin" style={{padding:"6px 8px", marginBottom:6, background:"#fafaf6"}}>
          <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>AI · 主角</div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"20px"}}>试着描述主角一句话——一个动作、一句台词、一个画面都行。</div>
        </div>
        <div className="sk-box thin" style={{padding:"6px 8px", marginBottom:6, background:"#fff8e8", borderColor:"var(--accent)"}}>
          <div className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>你</div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"20px"}}>17 岁，话少。父亲死于北疆，怀里有半枚铜牌。</div>
        </div>
        <div className="sk-box thin" style={{padding:"6px 8px", marginBottom:6, background:"#fafaf6"}}>
          <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>AI · 反派</div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"20px"}}>"半枚" 暗示反派持另一半，对吗？我先按这个假设走。</div>
        </div>

        {/* input */}
        <div className="sk-box dashed" style={{position:"absolute", left:14, right:14, bottom:14, padding:"8px 10px", background:"#fff"}}>
          <input className="hand-cn" defaultValue="再保守一点，把卷一压成 30 章，弱化金手指" style={{width:"100%", border:0, outline:"none", fontSize:14, background:"transparent"}}/>
          <div style={{display:"flex", gap:6, marginTop:6}}>
            <span className="tag" style={{fontSize:11}}>📎 上传旧稿</span>
            <span className="tag" style={{fontSize:11}}>👁 参考另一本</span>
            <span style={{flex:1}}/>
            <span className="tag accent" style={{fontSize:11}}>↩ 让 AI 改</span>
          </div>
        </div>
      </div>

      {/* RIGHT: outline preview */}
      <div className="sk-box fill-w" style={{position:"absolute", left:408, right:14, top:124, bottom:14, padding:"18px 24px", overflow:"hidden"}}>
        <div style={{display:"flex", alignItems:"baseline", gap:10}}>
          <span className="brush" style={{fontSize:28}}>AI 已起 3 卷大纲</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted" style={{fontSize:13}}>基于你前面的回答 · 可拖动重排 / 双击编辑</span>
          <span className="tag" style={{fontSize:12}}>再起一版</span>
          <span className="tag" style={{fontSize:12}}>更稳健</span>
          <span className="tag" style={{fontSize:12}}>更大胆</span>
        </div>
        <div className="squiggle accent" style={{margin:"8px 0 14px", maxWidth:420}}/>

        {/* recap */}
        <div className="sk-box thin" style={{padding:"8px 12px", marginBottom:12, background:"#fff8e8", borderColor:"var(--accent)"}}>
          <div className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>✦ AI 对你说</div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"21px"}}>玄幻武侠 · 冷调 · 慢热 · 主角 17 岁 / 半枚铜牌 / 反派持另一半。我把高潮放在 60 章前后，卷一收得克制。如果觉得节奏太慢，告诉我"压紧到 40 章入二卷"即可。</div>
        </div>

        {/* outline 3 columns */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14}}>
          {[
            {t:"卷一 · 少年入江湖", sub:"约 35 章 · 慢热", color:"#fafaf6",
              beats:[
                {b:"开场",d:"雨夜下山 · 父尸 · 铜牌"},
                {b:"出门",d:"小镇 · 第一次出剑"},
                {b:"导师",d:"卫衍出现 · 残篇 4/9"},
                {b:"小高潮",d:"⚐ 铜牌身份被认出"},
                {b:"中段",d:"行游北疆 · 6-8 个小江湖事件"},
                {b:"卷尾钩子",d:"⚐ 老者断剑 · 卫衍亡"},
              ]
            },
            {t:"卷二 · 雪夜入城", sub:"约 25 章 · 收紧", color:"#fff", current:true,
              beats:[
                {b:"入城",d:"雪夜城下 · ⚐ 灯无人添油", cur:true},
                {b:"卷入",d:"城主之女 · 老线索接上"},
                {b:"中段反转",d:"林九郎实为暗探"},
                {b:"挫败",d:"沈砚被困 · 铜牌身份揭"},
                {b:"卷尾",d:"⚐ 老者断剑回收 · 北望初现"},
              ]
            },
            {t:"卷三 · 北望（草图）", sub:"约 20 章 · 高潮", color:"#fafaf6",
              beats:[
                {b:"开场",d:"重回北疆 · 故乡焚痕"},
                {b:"集结",d:"白如霜 · 林九郎 · 旧友各归位"},
                {b:"中段",d:"⚐ 铜牌回收 · 反派现真身"},
                {b:"决战",d:"季元 · 完整铜牌之力"},
                {b:"收束",d:"父之债了 / 不了？·读者投票"},
              ]
            },
          ].map((vol,i)=>(
            <div key={i} className={"sk-box "+(vol.current?"thick":"")} style={{padding:"12px 12px", background:vol.color, borderColor: vol.current?"var(--accent)":"#1a1a1a"}}>
              <div className="hand-cn" style={{fontSize:16, color:vol.current?"var(--accent)":"var(--ink)"}}>{vol.current?"▌ ":""}{vol.t}</div>
              <div className="hand-en muted" style={{fontSize:12}}>{vol.sub}</div>
              <div className="sk-rule dashed" style={{margin:"8px 0"}}/>
              {vol.beats.map((b,j)=>(
                <div key={j} style={{display:"flex", gap:6, marginBottom:6}}>
                  <span className="tag" style={{fontSize:10, padding:"0 6px", height:18, background: b.cur?"var(--accent)":"#fff", color: b.cur?"#fff":"var(--ink)", borderColor: b.cur?"var(--accent)":"#1a1a1a", flexShrink:0}}>{b.b}</span>
                  <span className="hand-cn" style={{fontSize:12, color: b.cur?"var(--accent)":"var(--ink-2)", lineHeight:"18px"}}>{b.d}</span>
                </div>
              ))}
              <div className="sk-rule dashed" style={{margin:"8px 0 6px"}}/>
              <div style={{display:"flex", gap:6}}>
                <span className="tag" style={{fontSize:11}}>编辑</span>
                <span className="tag" style={{fontSize:11}}>+ 节拍</span>
                <span style={{flex:1}}/>
                <span className="tag" style={{fontSize:11}}>重起此卷</span>
              </div>
            </div>
          ))}
        </div>

        {/* bottom nav */}
        <div style={{position:"absolute", left:24, right:24, bottom:18, display:"flex", alignItems:"center", gap:10}}>
          <span className="tag" style={{padding:"4px 14px"}}>‹ 上一步</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted" style={{fontSize:13}}>下一步 = 把这 3 卷的关键人物 / 地点 / 物品 抽取进设定库</span>
          <span className="tag" style={{padding:"4px 14px"}}>跳过</span>
          <span className="tag accent" style={{padding:"4px 14px"}}>采纳 · 下一步 ›</span>
        </div>
      </div>

      <div className="annot" style={{left:30, top:100, transform:"rotate(-2deg)"}}>
        <span className="lbl">6 步骤 = 写出能用的第 1 章</span>
      </div>
      <div className="annot" style={{left:430, top:96, transform:"rotate(2deg)"}}>
        <span className="lbl">每步都可以"我自己写"绕过</span>
      </div>
    </div>
  );
}

Object.assign(window, { V1Inspect, V1Onboard });
