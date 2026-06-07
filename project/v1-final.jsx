/* global React */
/* ============================================================
   v1 后续
   - V1Health: 全书健康度仪表盘
   - V1OnboardStep6: 新书向导终章 · 写第 1 章
   ============================================================ */

/* ===== 全书健康度仪表盘 ====================================== */
function V1Health(){
  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 《剑入星海》 / 健康度</span>
        <span style={{flex:1}}/>
        <span className="hand-en muted">每周一自动汇总 · 上次 2026-05-12</span>
      </div>

      {/* hero: book + score */}
      <div style={{position:"absolute", left:14, right:14, top:50, padding:"18px 24px", display:"flex", alignItems:"center", gap:24}}>
        <div style={{flex:1}}>
          <div className="hand-en muted" style={{fontSize:13}}>本书健康度</div>
          <div className="brush" style={{fontSize:44, lineHeight:1.1}}>《剑入星海》</div>
          <div className="hand-en muted" style={{fontSize:14, marginTop:2}}>玄幻武侠 · 连载中 · 42/约 80 章 · 已发布 起点 · 番茄</div>
        </div>
        {/* big circular gauge */}
        <div style={{position:"relative", width:160, height:160}}>
          <svg viewBox="0 0 160 160" width="160" height="160">
            <circle cx="80" cy="80" r="68" fill="none" stroke="#eee" strokeWidth="12"/>
            <circle cx="80" cy="80" r="68" fill="none" stroke="#d9542b" strokeWidth="12"
              strokeDasharray={`${78/100*427} 427`} strokeLinecap="round"
              transform="rotate(-90 80 80)"/>
          </svg>
          <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
            <div className="brush" style={{fontSize:52, lineHeight:1, color:"var(--accent)"}}>78</div>
            <div className="hand-en" style={{fontSize:13, color:"var(--ink-3)"}}>/ 100 · 良好</div>
          </div>
        </div>
        <div style={{flex:1, paddingLeft:14, borderLeft:"1.25px dashed #1a1a1a"}}>
          <div className="hand-en muted" style={{fontSize:13}}>本周变化</div>
          <div style={{display:"flex", alignItems:"baseline", gap:8}}>
            <div className="brush" style={{fontSize:32, color:"var(--accent)"}}>+4</div>
            <div className="hand-en" style={{fontSize:14, color:"var(--ink-3)"}}>从 74 → 78</div>
          </div>
          <div className="hand-cn" style={{fontSize:13, lineHeight:"20px", marginTop:6}}>
            主要贡献：回收伏笔 1 · 修一致性 2 · 张力曲线更平衡<br/>
            主要拖累：本章对话密度偏高
          </div>
        </div>
      </div>

      {/* 4 quadrants */}
      <div style={{position:"absolute", left:14, right:14, top:248, bottom:184, display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:14}}>

        {/* 进度 */}
        <div className="sk-box" style={{padding:"14px 16px", background:"#fff"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="brush" style={{fontSize:22}}>① 进度</span>
            <span style={{flex:1}}/>
            <span className="brush" style={{fontSize:24, color:"var(--accent)"}}>86</span>
          </div>
          <div className="squiggle" style={{margin:"6px 0 10px"}}/>
          <div style={{display:"flex", gap:14}}>
            <div>
              <div className="brush" style={{fontSize:24}}>127k</div>
              <div className="hand-en muted" style={{fontSize:11}}>已写字数</div>
            </div>
            <div>
              <div className="brush" style={{fontSize:24}}>1,632</div>
              <div className="hand-en muted" style={{fontSize:11}}>日均</div>
            </div>
            <div>
              <div className="brush" style={{fontSize:24}}>18</div>
              <div className="hand-en muted" style={{fontSize:11}}>连码天</div>
            </div>
            <div style={{flex:1}}/>
            <div style={{textAlign:"right"}}>
              <div className="brush" style={{fontSize:24, color:"var(--accent)"}}>≈ 78</div>
              <div className="hand-en muted" style={{fontSize:11}}>预估总章</div>
            </div>
          </div>
          <div style={{marginTop:10}}>
            <div className="hand-en muted" style={{fontSize:11, marginBottom:2}}>已写 42 / 预估 78</div>
            <div style={{height:8, background:"#eee", borderRadius:99}}>
              <div style={{height:"100%", width:"54%", background:"var(--accent)", borderRadius:99}}/>
            </div>
          </div>
          <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:8}}>按当前节奏 · 还需 22 天到卷二结束 · 4 个月到完结</div>
        </div>

        {/* 结构 */}
        <div className="sk-box" style={{padding:"14px 16px", background:"#fff"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="brush" style={{fontSize:22}}>② 结构</span>
            <span style={{flex:1}}/>
            <span className="brush" style={{fontSize:24, color:"var(--accent)"}}>72</span>
          </div>
          <div className="squiggle" style={{margin:"6px 0 8px"}}/>
          {/* mini tension curve */}
          <svg viewBox="0 0 360 60" style={{width:"100%", height:60}}>
            <line x1="0" y1="50" x2="360" y2="50" stroke="#1a1a1a" strokeWidth="0.8"/>
            <path d="M 4 42 Q 40 38 70 30 T 130 22 T 200 16 T 250 28 T 310 8 T 356 18"
                  fill="none" stroke="#d9542b" strokeWidth="1.5"/>
            <line x1="200" y1="0" x2="200" y2="58" stroke="#d9542b" strokeDasharray="3 3"/>
            <text x="200" y="8" fontSize="9" textAnchor="middle" fontFamily="Caveat" fill="#d9542b">42 当前</text>
            <circle cx="310" cy="8" r="3" fill="#d9542b"/>
            <text x="310" y="4" fontSize="8" textAnchor="middle" fontFamily="Caveat" fill="#d9542b">高潮?</text>
          </svg>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:6}}>
            <div className="sk-box thin" style={{padding:"4px 8px"}}>
              <div className="hand-en muted" style={{fontSize:11}}>卷长方差</div>
              <div className="brush" style={{fontSize:18, color:"var(--ink)"}}>偏大</div>
              <div className="hand-en" style={{fontSize:10, color:"var(--accent)"}}>卷一 38 / 卷二 ?</div>
            </div>
            <div className="sk-box thin" style={{padding:"4px 8px"}}>
              <div className="hand-en muted" style={{fontSize:11}}>节奏起伏</div>
              <div className="brush" style={{fontSize:18, color:"var(--ink)"}}>较好</div>
              <div className="hand-en" style={{fontSize:10, color:"var(--ink-3)"}}>平均偏差 14%</div>
            </div>
          </div>
        </div>

        {/* 一致性 */}
        <div className="sk-box" style={{padding:"14px 16px", background:"#fff"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="brush" style={{fontSize:22}}>③ 一致性 & 伏笔</span>
            <span style={{flex:1}}/>
            <span className="brush" style={{fontSize:24, color:"#c9a227"}}>68</span>
          </div>
          <div className="squiggle" style={{margin:"6px 0 8px"}}/>
          <div style={{display:"flex", gap:10}}>
            <div style={{flex:1}}>
              <div className="hand-en muted" style={{fontSize:11}}>人物一致性</div>
              <div className="brush" style={{fontSize:20}}>23 → <span style={{color:"var(--accent)"}}>2</span></div>
              <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>角色 · 待修</div>
            </div>
            <div style={{flex:1}}>
              <div className="hand-en muted" style={{fontSize:11}}>伏笔回收率</div>
              <div className="brush" style={{fontSize:20}}>1/<span style={{color:"#c9a227"}}>7</span></div>
              <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>已收/已埋</div>
            </div>
          </div>
          {/* aging foreshadows */}
          <div className="hand-en muted" style={{fontSize:11, marginTop:8}}>伏笔老化（距埋章数）</div>
          {[
            ["半枚铜牌", 25, "var(--accent)"],
            ["老者断剑", 13, "#c9a227"],
            ["林玉佩", "✓", "#1a1a1a"],
            ["灯无人添油", 0, "#1a1a1a"],
          ].map(([n,age,c],i)=>(
            <div key={i} style={{display:"flex", alignItems:"center", gap:6, margin:"4px 0"}}>
              <span className="hand-cn" style={{fontSize:12, width:90}}>⚐ {n}</span>
              <div style={{flex:1, height:6, background:"#eee", borderRadius:99, overflow:"hidden"}}>
                <div style={{height:"100%", width: typeof age==="number"?`${Math.min(100,age*4)}%`:"100%", background:c}}/>
              </div>
              <span className="hand-en" style={{fontSize:11, color:c, width:24, textAlign:"right"}}>{age}</span>
            </div>
          ))}
        </div>

        {/* 风格合规 */}
        <div className="sk-box" style={{padding:"14px 16px", background:"#fff"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="brush" style={{fontSize:22}}>④ 风格 & 合规</span>
            <span style={{flex:1}}/>
            <span className="brush" style={{fontSize:24, color:"var(--accent)"}}>84</span>
          </div>
          <div className="squiggle" style={{margin:"6px 0 8px"}}/>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6}}>
            <div className="sk-box thin" style={{padding:"4px 6px", textAlign:"center"}}>
              <div className="brush" style={{fontSize:18}}>87%</div>
              <div className="hand-en" style={{fontSize:10, color:"var(--ink-3)"}}>风格匹配</div>
            </div>
            <div className="sk-box thin" style={{padding:"4px 6px", textAlign:"center"}}>
              <div className="brush" style={{fontSize:18, color:"var(--accent)"}}>低</div>
              <div className="hand-en" style={{fontSize:10, color:"var(--ink-3)"}}>"AI 味"</div>
            </div>
            <div className="sk-box thin" style={{padding:"4px 6px", textAlign:"center"}}>
              <div className="brush" style={{fontSize:18}}>2 / 5</div>
              <div className="hand-en" style={{fontSize:10, color:"var(--ink-3)"}}>本章敏感</div>
            </div>
          </div>
          <div className="hand-en muted" style={{fontSize:11, marginTop:8}}>平台兼容</div>
          <div style={{display:"flex", flexWrap:"wrap", gap:4, marginTop:4}}>
            {[["起点","✓","var(--accent)"],["番茄","✓","var(--accent)"],["七猫","2 处需改","#c9a227"],["微信读书","✓","var(--accent)"]].map(([n,s,c],i)=>(
              <span key={i} className="tag" style={{fontSize:11, color:c, borderColor:c}}>{n} · {s}</span>
            ))}
          </div>
          <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:8}}>本章字数 1,243 · 起点建议 2,800-3,200 <span style={{color:"var(--accent)"}}>偏短</span></div>
        </div>
      </div>

      {/* bottom strip: top-3 actions */}
      <div className="sk-box" style={{position:"absolute", left:14, right:14, bottom:14, height:158, padding:"12px 16px", background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span className="sk-ribbon">本周建议</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted">提升空间 22 分 · 估计 3 个动作可加 12 分</span>
        </div>
        <div className="sk-rule dashed" style={{margin:"8px 0"}}/>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14}}>
          {[
            {n:1, t:"在 43-50 章给「半枚铜牌」一次小回响", v:"+ 5 分 · 一致性 & 伏笔", act:"AI 起 3 版"},
            {n:2, t:"卷二字数补到与卷一接近（再 18 章）", v:"+ 4 分 · 结构", act:"重排卷二大纲"},
            {n:3, t:'修第 7 段「刺杀」一词的七猫兼容问题', v:"+ 3 分 · 合规", act:"一键替换"},
          ].map((it,i)=>(
            <div key={i} className="sk-box thin" style={{padding:"8px 10px", background:"#fff"}}>
              <div style={{display:"flex", alignItems:"baseline", gap:6}}>
                <span className="brush" style={{fontSize:20, color:"var(--accent)"}}>{it.n}</span>
                <span className="hand-cn" style={{fontSize:13, lineHeight:"19px", flex:1}}>{it.t}</span>
              </div>
              <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:4}}>{it.v}</div>
              <div style={{display:"flex", gap:4, marginTop:6}}>
                <span className="tag accent" style={{fontSize:11}}>{it.act}</span>
                <span className="tag" style={{fontSize:11}}>忽略</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="annot" style={{left:240, top:80, transform:"rotate(-3deg)"}}>
        <span className="lbl">分数 = 4 维 加权</span>
      </div>
      <div className="annot" style={{left:520, top:580, transform:"rotate(2deg)"}}>
        <span className="lbl">底部 = 本周 3 个可执行动作</span>
      </div>
    </div>
  );
}

/* ===== 新书向导 step 6 ======================================= */
function V1OnboardStep6(){
  const steps = [
    {n:1, t:"题材 & 调性"},
    {n:2, t:"主角 & 反派"},
    {n:3, t:"卷 / 大纲"},
    {n:4, t:"设定库"},
    {n:5, t:"风格学习"},
    {n:6, t:"写第 1 章"},
  ];

  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 新书向导 · 终章 6/6</span>
        <span style={{flex:1}}/>
        <span className="hand-en muted">总耗时 18 分钟</span>
        <span className="tag" style={{fontSize:12}}>退出</span>
      </div>

      {/* stepper */}
      <div style={{position:"absolute", left:30, right:30, top:60}}>
        <div style={{display:"flex", alignItems:"center"}}>
          {steps.map((s,i)=>{
            const isLast = i===steps.length-1;
            const isCur = isLast;
            return (
              <React.Fragment key={i}>
                <div style={{display:"flex", alignItems:"center", gap:6}}>
                  <div style={{
                    width:26, height:26, borderRadius:"50%",
                    border:"1.5px solid "+(isCur?"var(--accent)":"var(--ink)"),
                    background:isCur?"var(--accent)":"var(--ink)",
                    color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"Caveat", fontSize:14, fontWeight:700,
                  }}>{isCur?s.n:"✓"}</div>
                  <div className="hand-cn" style={{fontSize:13, color: isCur?"var(--accent)":"var(--ink)"}}>{s.t}</div>
                </div>
                {i<steps.length-1 && <div style={{flex:1, height:0, borderTop:"1.5px solid var(--ink)", margin:"0 10px"}}/>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* main: editor + side cards */}
      {/* SIDE: 起手锦囊 */}
      <div className="sk-box" style={{position:"absolute", right:14, top:118, width:316, bottom:14, padding:"14px 14px", background:"#fff"}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span className="sk-ribbon">起手锦囊</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted" style={{fontSize:12}}>AI 已就位</span>
        </div>
        <div className="hand-en" style={{fontSize:12, color:"var(--ink-3)", marginTop:4}}>前 5 步生成的资源，已挂载进项目。</div>
        <div className="squiggle" style={{margin:"8px 0"}}/>

        <div className="sk-box thin" style={{padding:"7px 9px", marginBottom:6, background:"#fafaf6"}}>
          <div className="hand-cn" style={{fontSize:13}}>📖 大纲 · 3 卷 · 80 章</div>
          <div className="hand-en muted" style={{fontSize:11}}>卷一 35 / 卷二 25 / 卷三 20</div>
        </div>
        <div className="sk-box thin" style={{padding:"7px 9px", marginBottom:6, background:"#fafaf6"}}>
          <div className="hand-cn" style={{fontSize:13}}>👤 人物 · 4</div>
          <div className="hand-en muted" style={{fontSize:11}}>沈砚 · 卫衍 · 季元 · 白如霜</div>
        </div>
        <div className="sk-box thin" style={{padding:"7px 9px", marginBottom:6, background:"#fafaf6"}}>
          <div className="hand-cn" style={{fontSize:13}}>☱ 设定 · 11 条</div>
          <div className="hand-en muted" style={{fontSize:11}}>朔风城 · 北疆军 · 半枚铜牌 · 问雪剑式 ...</div>
        </div>
        <div className="sk-box thin" style={{padding:"7px 9px", marginBottom:6, background:"#fafaf6"}}>
          <div className="hand-cn" style={{fontSize:13}}>⚐ 已规划伏笔 · 4</div>
          <div className="hand-en muted" style={{fontSize:11}}>铜牌 / 断剑 / 林玉佩 / 灯</div>
        </div>
        <div className="sk-box thin" style={{padding:"7px 9px", marginBottom:6, background:"#fff8e8", borderColor:"var(--accent)"}}>
          <div className="hand-cn" style={{fontSize:13, color:"var(--accent)"}}>✎ 风格规则 · 7</div>
          <div className="serif" style={{fontSize:11, lineHeight:"17px", color:"var(--ink-2)"}}>短句 · 比喻偏冷 · 少用"突然" · 对话不写"道""说" · 沈砚=寡言 · …</div>
        </div>

        <div className="sk-rule dashed" style={{margin:"10px 0 8px"}}/>
        <div className="hand-cn" style={{fontSize:13}}>第 1 章 · 雨夜下山</div>
        <div className="hand-en muted" style={{fontSize:11, marginBottom:4}}>来自卷一第 1 节拍</div>
        <div className="serif" style={{fontSize:12, lineHeight:"19px", color:"var(--ink-2)"}}>开场：父亲遗体 · 半枚铜牌 · 雨夜下山。<br/>钩子：铜牌缺角处沾着不属于雨水的颜色。</div>

        <div style={{position:"absolute", left:14, right:14, bottom:14}}>
          <div className="sk-rule dashed"/>
          <div style={{display:"flex", gap:6, marginTop:8}}>
            <span className="tag" style={{fontSize:11}}>修改锦囊</span>
            <span style={{flex:1}}/>
            <span className="tag" style={{fontSize:11}}>完成 · 进编辑器</span>
          </div>
        </div>
      </div>

      {/* MAIN: editor with 3 openings */}
      <div className="sk-box fill-w corner-curl" style={{position:"absolute", left:14, top:118, right:344, bottom:14, padding:"22px 36px", overflow:"hidden", background:"#fff"}}>
        <div style={{display:"flex", alignItems:"baseline"}}>
          <div className="brush" style={{fontSize:32}}>第 1 章 · 雨夜下山</div>
          <span style={{flex:1}}/>
          <span className="hand-en muted" style={{fontSize:13}}>0 字 · 起点建议 2,800-3,200</span>
        </div>
        <div className="squiggle accent" style={{margin:"6px 0 20px"}}/>

        {/* opening hero */}
        <div className="hand-cn" style={{fontSize:15, color:"var(--accent)"}}>✦ 三个开头候选 · 也可以全部忽略，自己起</div>
        <div className="hand-en" style={{fontSize:12, color:"var(--ink-3)", marginBottom:14}}>选中后回车=插入 · ⇥ Tab=只看预览 · ⌥⏎=再换 3 版</div>

        {[
          {style:"冷峻 · 短句", t:"那把伞已经撑不开。父亲的血混着雨，从青砖缝里慢慢流。沈砚把铜牌从他怀里取出来，半枚，缺一角。", picked:true},
          {style:"钩子型 · 悬念", t:"沈砚下山那天，雨已经下了三天。山上还剩两口棺材，一口是父亲的，另一口里只放了半枚铜牌。"},
          {style:"古风 · 节奏", t:"朔风夜雨，铜牌半残。父尸未冷，沈砚下山。他不知山下三百里都是杀他的人。"},
        ].map((o,i)=>(
          <div key={i} className={"sk-box thin"+(o.picked?" thick":"")} style={{padding:"12px 14px", marginBottom:10, background: o.picked?"#fff8e8":"#fafaf6", borderColor: o.picked?"var(--accent)":"#1a1a1a"}}>
            <div style={{display:"flex", alignItems:"baseline", gap:8}}>
              <span className="brush" style={{fontSize:18, color: o.picked?"var(--accent)":"var(--ink)"}}>候选 {i+1}</span>
              <span className="hand-en" style={{fontSize:12, color:"var(--ink-3)"}}>· {o.style}</span>
              <span style={{flex:1}}/>
              {o.picked && <span className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>↩ 当前选中</span>}
            </div>
            <div className="serif" style={{fontSize:14, lineHeight:"26px", color:"var(--ink)", marginTop:4, textIndent:"2em"}}>{o.t}</div>
            <div style={{display:"flex", gap:5, marginTop:6}}>
              <span className={"tag "+(o.picked?"accent":"")} style={{fontSize:11}}>{o.picked?"✓ 用这个":"用这个"}</span>
              <span className="tag" style={{fontSize:11}}>只取第一句</span>
              <span className="tag" style={{fontSize:11}}>再写一版相似</span>
              <span className="tag" style={{fontSize:11}}>展开 200 字</span>
            </div>
          </div>
        ))}

        {/* bottom actions */}
        <div style={{position:"absolute", left:30, right:30, bottom:20, display:"flex", alignItems:"center", gap:10}}>
          <span className="tag" style={{padding:"4px 14px"}}>‹ 上一步</span>
          <span className="tag" style={{padding:"4px 14px"}}>我自己起开头</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted" style={{fontSize:13}}>采纳候选 1 · 把它插入正文，进入正式编辑器</span>
          <span className="tag accent" style={{padding:"4px 14px"}}>🪶 开始写吧 ›</span>
        </div>
      </div>

      <div className="annot" style={{left:30, top:158, transform:"rotate(-2deg)"}}>
        <span className="lbl">从 0 到能写 = 18 分钟</span>
      </div>
      <div className="annot" style={{left:880, top:140, transform:"rotate(2deg)"}}>
        <span className="lbl">所有资源已挂上 · 一键进编辑器</span>
      </div>
    </div>
  );
}

Object.assign(window, { V1Health, V1OnboardStep6 });
