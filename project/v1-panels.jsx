/* global React */
/* ============================================================
   右侧 6 个面板的细化版（yuqiu 评审：这些功能细化一下）
   每个 artboard = 一个独立面板的完整内容
   ============================================================ */

/* ---- shared tiny bits -------------------------------------- */
const PanelShell = ({ icon, kicker, title, badge, children }) => (
  <div className="ab" style={{width:460, height:820, background:"#fafaf6"}}>
    {/* rail crumb */}
    <div style={{position:"absolute", left:0, top:0, bottom:0, width:48, borderRight:"1.5px solid #1a1a1a", background:"#f3f1e8", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:14, gap:14}}>
      {["✦","人","☱","⚐","✎","⚖"].map((g,i)=>{
        const active = g===icon;
        return (
          <div key={i} className="hand-en" style={{fontSize:18, color:active?"var(--accent)":"var(--ink-3)"}}>{g}</div>
        );
      })}
      <span style={{flex:1}}/>
      <div className="hand-en" style={{fontSize:14, color:"var(--ink-3)", marginBottom:10}}>‹</div>
    </div>

    {/* panel body */}
    <div style={{position:"absolute", left:48, right:0, top:0, bottom:0, padding:"16px 18px", overflow:"hidden"}}>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <span className="hand-en" style={{fontSize:13, color:"var(--ink-3)"}}>右侧 ›</span>
        <span className="sk-ribbon">{title}</span>
        <span style={{flex:1}}/>
        {badge && <span className="tag warm hand-en" style={{fontSize:12}}>{badge}</span>}
      </div>
      {kicker && <div className="hand-en" style={{fontSize:12, color:"var(--ink-3)", marginTop:4}}>{kicker}</div>}
      <div className="squiggle" style={{margin:"8px 0 12px"}}/>
      {children}
    </div>
  </div>
);

const Row = ({label, value, color}) => (
  <div style={{display:"flex", alignItems:"baseline", gap:6, margin:"3px 0"}}>
    <span className="hand-en" style={{fontSize:12, color:"var(--ink-3)", width:80}}>{label}</span>
    <span className="hand-cn" style={{fontSize:13, color: color||"var(--ink)", flex:1}}>{value}</span>
  </div>
);

const Bar = ({pct, color="#d9542b"}) => (
  <div style={{height:6, background:"#eee", borderRadius:99, overflow:"hidden"}}>
    <div style={{height:"100%", width:`${pct}%`, background:color}}/>
  </div>
);

/* ===== 1) 上下文 ============================================ */
function PanelContext(){
  return (
    <PanelShell icon="✦" title="AI 上下文" badge="实时">
      <div className="hand-en" style={{fontSize:12, color:"var(--ink-3)", marginBottom:6}}>这就是 AI 看到的 · 第 42 章 · 可手动锁定 / 删除</div>

      {/* token gauge */}
      <div className="sk-box thin" style={{padding:"8px 10px", background:"#fff", marginBottom:10}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <span className="hand-cn" style={{fontSize:13}}>上下文用量</span>
          <span className="hand-en" style={{fontSize:13, color:"var(--accent)"}}>4,820 / 8,000 token</span>
        </div>
        <div style={{display:"flex", gap:1, marginTop:6, height:8, borderRadius:99, overflow:"hidden"}}>
          <div style={{flex:18, background:"#d9542b"}}/>
          <div style={{flex:14, background:"#e8a685"}}/>
          <div style={{flex:9, background:"#c9a227"}}/>
          <div style={{flex:7, background:"#1a1a1a"}}/>
          <div style={{flex:12, background:"#eee"}}/>
        </div>
        <div style={{display:"flex", gap:10, marginTop:6, fontSize:11}} className="hand-en">
          <span><span style={{display:"inline-block",width:8,height:8,background:"#d9542b",marginRight:4}}/>正文 30%</span>
          <span><span style={{display:"inline-block",width:8,height:8,background:"#e8a685",marginRight:4}}/>人物 24%</span>
          <span><span style={{display:"inline-block",width:8,height:8,background:"#c9a227",marginRight:4}}/>设定 15%</span>
          <span><span style={{display:"inline-block",width:8,height:8,background:"#1a1a1a",marginRight:4}}/>风格 12%</span>
        </div>
      </div>

      {/* 章节回顾 */}
      <div className="hand-cn" style={{fontSize:13, marginBottom:4, display:"flex", justifyContent:"space-between"}}>
        <span>📖 已注入正文</span>
        <span className="hand-en" style={{color:"var(--ink-3)", fontSize:11}}>自动 · 可编辑</span>
      </div>
      <div className="sk-box thin" style={{padding:"6px 8px", marginBottom:4, background:"#fff"}}>
        <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>第 41 章 · 摘要（AI 生成）</div>
        <div className="serif" style={{fontSize:12, lineHeight:"19px"}}>城外老者断剑，留下"半枚铜牌可入北十二城"暗语；沈砚冒雪南下抵雪夜城。</div>
      </div>
      <div className="sk-box thin" style={{padding:"6px 8px", marginBottom:4, background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>本章正文 · 1,243 字（完整）</div>
        <div className="serif" style={{fontSize:12, lineHeight:"19px", color:"var(--ink-2)"}}>"雪线压着城墙，像一道压了三天三夜的眉……"</div>
      </div>

      {/* 涉及实体 */}
      <div className="hand-cn" style={{fontSize:13, margin:"10px 0 4px"}}>🧷 自动钉住</div>
      <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:8}}>
        {[
          ["沈砚","主","accent"],
          ["守门兵 · 钱二","角",""],
          ["半枚铜牌","物","warm"],
          ["雪夜城","地",""],
          ["北疆军","组",""],
          ["问雪剑式","技",""],
        ].map(([t,k,cls],i)=>(
          <span key={i} className={"tag "+(cls||"")} style={{fontSize:12}}>{t} <span className="hand-en" style={{opacity:0.5, marginLeft:2}}>·{k}</span></span>
        ))}
      </div>

      {/* 手动调整 */}
      <div className="hand-cn" style={{fontSize:13, margin:"8px 0 4px"}}>✋ 手动锁定</div>
      <div className="sk-box thin dashed" style={{padding:"6px 8px", background:"transparent"}}>
        <div className="hand-cn" style={{fontSize:12, color:"var(--ink-2)"}}>把"老者临终独白"永远塞进每次生成（已锁定 · 第 41 章 P3）</div>
        <div style={{display:"flex", gap:4, marginTop:4}}>
          <span className="tag" style={{fontSize:11}}>编辑</span>
          <span className="tag" style={{fontSize:11}}>解锁</span>
        </div>
      </div>

      {/* footer actions */}
      <div style={{position:"absolute", left:18, right:18, bottom:14}}>
        <div className="sk-rule dashed"/>
        <div style={{display:"flex", gap:6, marginTop:8}}>
          <span className="tag accent hand-en">重建上下文</span>
          <span className="tag hand-en">导出</span>
          <span style={{flex:1}}/>
          <span className="tag hand-en">查看 prompt</span>
        </div>
      </div>
    </PanelShell>
  );
}

/* ===== 2) 人物 ============================================ */
function PanelCharacters(){
  const ppl = [
    {n:"沈砚",r:"主角",app:41,trait:"寡言 · 持半枚铜牌",bar:100,alert:"⚠ 22/31 章性格漂移",cls:"accent"},
    {n:"白如霜",r:"女主",app:9,trait:"剑客之女 · 嗜甜",bar:32},
    {n:"卫衍",r:"师 · 已亡",app:6,trait:"断剑老者 · 北疆遗将",bar:18,dim:true},
    {n:"林九郎",r:"友",app:14,trait:"江南书生 · 实为暗探",bar:48,alert:"⚠ 设定矛盾 第 35 章"},
    {n:"季元",r:"反派",app:5,trait:"雪夜城主 · 持完整铜牌",bar:14},
    {n:"钱二",r:"路人+",app:1,trait:"守门兵 · 本章新增",bar:2,fresh:true},
  ];
  return (
    <PanelShell icon="人" title="人物 · 23" badge="2 条提醒">
      <input className="hand-en" placeholder="🔍 搜索 / @ 关系" style={{width:"100%", padding:"4px 8px", border:"1.25px dashed #1a1a1a", borderRadius:6, background:"transparent", fontSize:13, marginBottom:8}}/>

      <div style={{display:"flex", gap:5, marginBottom:8, flexWrap:"wrap"}}>
        {[["全部 23",true],["主角 1"],["配角 6"],["反派 4"],["路人+ 9"],["⚠ 提醒 2"]].map(([t,a],i)=>(
          <span key={i} className={"tag "+(a?"accent":"")} style={{fontSize:12}}>{t}</span>
        ))}
      </div>

      {/* AI alert strip */}
      <div className="sk-box thin" style={{padding:"6px 8px", background:"#fff8e8", borderColor:"var(--accent)", marginBottom:10}}>
        <div className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>✦ AI 一致性扫描</div>
        <div className="hand-cn" style={{fontSize:12, lineHeight:"18px", color:"var(--ink)"}}>
          沈砚在第 22 章自称"不喝酒"，第 31 章在酒馆"连饮三盏"。
        </div>
        <div style={{display:"flex", gap:4, marginTop:4}}>
          <span className="tag accent" style={{fontSize:11}}>查看差异</span>
          <span className="tag" style={{fontSize:11}}>忽略</span>
          <span className="tag" style={{fontSize:11}}>登记为成长</span>
        </div>
      </div>

      {/* list */}
      <div style={{display:"flex", flexDirection:"column", gap:6, overflow:"hidden"}}>
        {ppl.map((p,i)=>(
          <div key={i} className={"sk-box thin"+(p.cls==="accent"?" thick":"")} style={{padding:"6px 8px", background: p.cls==="accent"?"#fff":(p.dim?"#f3f1e8":"#fafaf6"), borderColor: p.cls==="accent"?"var(--accent)":"#1a1a1a", opacity:p.dim?0.7:1}}>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <div className="sk-box thin dashed" style={{width:28,height:28, display:"flex", alignItems:"center", justifyContent:"center", padding:0}}>
                <span className="hand-en" style={{fontSize:10, color:"var(--ink-3)"}}>img</span>
              </div>
              <div style={{flex:1}}>
                <div className="hand-cn" style={{fontSize:13, color:p.cls==="accent"?"var(--accent)":"var(--ink)"}}>
                  {p.n} <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>· {p.r}</span>
                  {p.fresh && <span className="tag warm" style={{fontSize:10, marginLeft:6, padding:"0 6px"}}>本章新增</span>}
                </div>
                <div className="serif" style={{fontSize:11, color:"var(--ink-2)"}}>{p.trait}</div>
              </div>
              <div style={{textAlign:"right", width:64}}>
                <div className="hand-en" style={{fontSize:10, color:"var(--ink-3)"}}>出场 {p.app}</div>
                <div style={{marginTop:3}}><Bar pct={p.bar} color={p.cls==="accent"?"#d9542b":"#1a1a1a"}/></div>
              </div>
            </div>
            {p.alert && <div className="hand-en" style={{fontSize:11, color:"var(--accent)", marginTop:4, marginLeft:34}}>{p.alert}</div>}
          </div>
        ))}
      </div>

      <div style={{position:"absolute", left:18, right:18, bottom:14}}>
        <div className="sk-rule dashed"/>
        <div style={{display:"flex", gap:6, marginTop:8}}>
          <span className="tag accent hand-en">+ 新人物</span>
          <span className="tag hand-en">从正文抽取</span>
          <span style={{flex:1}}/>
          <span className="tag hand-en">关系全图 →</span>
        </div>
      </div>
    </PanelShell>
  );
}

/* ===== 3) 设定 ============================================ */
function PanelWorld(){
  return (
    <PanelShell icon="☱" title="设定库" badge="42 条">
      {/* sub tabs */}
      <div style={{display:"flex", gap:10, marginBottom:8, borderBottom:"1.25px dashed #1a1a1a", paddingBottom:6}}>
        {["地点 11","门派 7","物品 9","术语 12","时间 3"].map((t,i)=>(
          <span key={t} className="hand-cn" style={{fontSize:13, color:i===0?"var(--accent)":"var(--ink)", borderBottom:i===0?"2px solid var(--accent)":"none", paddingBottom:4}}>{t}</span>
        ))}
      </div>

      {/* map-ish header */}
      <div className="sk-box thin dashed" style={{padding:"8px 10px", marginBottom:8, background:"#fff"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <span className="hand-cn" style={{fontSize:13}}>🗺 北疆 · 11 处</span>
          <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>查看地图视图 →</span>
        </div>
        {/* tiny region viz */}
        <svg viewBox="0 0 380 60" style={{width:"100%", height:50, marginTop:4}}>
          <path d="M10 35 Q60 10 110 28 T210 22 T330 36 T370 30" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
          <circle cx="40" cy="32" r="4" fill="#1a1a1a"/>
          <text x="46" y="36" fontSize="9" fontFamily="Kalam" fill="#4a4a4a">朔风（已破）</text>
          <circle cx="160" cy="24" r="5" fill="#d9542b"/>
          <text x="166" y="22" fontSize="9" fontFamily="Kalam" fill="#d9542b">▌ 雪夜城</text>
          <circle cx="260" cy="28" r="4" fill="none" stroke="#1a1a1a"/>
          <text x="266" y="32" fontSize="9" fontFamily="Kalam" fill="#4a4a4a">北疆军营</text>
          <circle cx="350" cy="32" r="4" fill="none" stroke="#1a1a1a" strokeDasharray="2 2"/>
          <text x="305" y="50" fontSize="9" fontFamily="Kalam" fill="#8a8a8a">问雪楼（待定）</text>
        </svg>
      </div>

      {/* place cards */}
      {[
        {n:"雪夜城",g:"边境重镇",d:"四面高墙，城主季元世袭。冬日封城。",ch:"出现 第 8/17/41/42 章",tag:"当前章",current:true},
        {n:"朔风城（已破）",g:"故乡",d:"沈砚出身地。三年前北疆军内乱中焚毁。",ch:"出现 第 1/12 章",tag:"已废"},
        {n:"北疆军营 · 寒鸦坞",g:"军事",d:"内部布局未定。← AI 建议补充",ch:"出现 第 29 章",tag:"待补",dashed:true},
      ].map((p,i)=>(
        <div key={i} className={"sk-box thin"+(p.dashed?" dashed":"")} style={{padding:"7px 9px", marginBottom:6, background: p.current?"#fff8e8":"#fff", borderColor: p.current?"var(--accent)":"#1a1a1a"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="hand-cn" style={{fontSize:14, color:p.current?"var(--accent)":"var(--ink)"}}>{p.n}</span>
            <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginLeft:6}}>· {p.g}</span>
            <span style={{flex:1}}/>
            <span className="tag" style={{fontSize:11, background: p.current?"var(--accent)":(p.dashed?"#fff8e8":"#fff"), color: p.current?"#fff":"var(--ink)", borderColor: p.current?"var(--accent)":"#1a1a1a"}}>{p.tag}</span>
          </div>
          <div className="serif" style={{fontSize:12, lineHeight:"19px", color:"var(--ink-2)", marginTop:2}}>{p.d}</div>
          <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:2}}>{p.ch}</div>
        </div>
      ))}

      <div className="sk-box thin" style={{padding:"6px 8px", marginTop:6, background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>✦ AI 建议</div>
        <div className="hand-cn" style={{fontSize:12, lineHeight:"18px"}}>"北疆军营 · 寒鸦坞"在 3 章中被提及但无内部布局，建议补 50 字基础设定，否则后续场景描写会含糊。</div>
        <div style={{display:"flex", gap:4, marginTop:4}}>
          <span className="tag accent" style={{fontSize:11}}>让 AI 起草</span>
          <span className="tag" style={{fontSize:11}}>我自己写</span>
          <span className="tag" style={{fontSize:11}}>暂不</span>
        </div>
      </div>

      <div style={{position:"absolute", left:18, right:18, bottom:14}}>
        <div className="sk-rule dashed"/>
        <div style={{display:"flex", gap:6, marginTop:8}}>
          <span className="tag accent hand-en">+ 新设定</span>
          <span className="tag hand-en">从正文抽取</span>
          <span style={{flex:1}}/>
          <span className="tag hand-en">导入 wiki</span>
        </div>
      </div>
    </PanelShell>
  );
}

/* ===== 4) 伏笔 ============================================ */
function PanelForeshadow(){
  return (
    <PanelShell icon="⚐" title="伏笔 · 7" badge="3 待回收">
      <div style={{display:"flex", gap:5, marginBottom:8}}>
        {[["全部 7"],["已埋 3",true],["待回收 3"],["已回收 1"],["失效 0"]].map(([t,a],i)=>(
          <span key={i} className={"tag "+(a?"accent":"")} style={{fontSize:12}}>{t}</span>
        ))}
      </div>

      {/* timeline */}
      <div className="sk-box thin" style={{padding:"8px 10px", marginBottom:10, background:"#fff"}}>
        <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>时间线 · 章节</div>
        <svg viewBox="0 0 380 70" style={{width:"100%", height:70, marginTop:4}}>
          <line x1="10" y1="40" x2="370" y2="40" stroke="#1a1a1a" strokeWidth="1.2"/>
          {[1,15,30,45,60].map((c,i)=>(
            <g key={i}>
              <line x1={10+i*90} y1="36" x2={10+i*90} y2="44" stroke="#1a1a1a"/>
              <text x={10+i*90} y="58" fontSize="9" textAnchor="middle" fontFamily="Kalam" fill="#4a4a4a">第{c}</text>
            </g>
          ))}
          {/* current */}
          <line x1="262" y1="22" x2="262" y2="58" stroke="#d9542b" strokeDasharray="2 2"/>
          <text x="262" y="18" fontSize="9" textAnchor="middle" fontFamily="Kalam" fill="#d9542b">本章 42</text>
          {/* planted */}
          <g><circle cx="106" cy="40" r="5" fill="#d9542b"/><line x1="106" y1="40" x2="370" y2="40" stroke="#d9542b" strokeDasharray="3 3" strokeWidth="1"/></g>
          <text x="106" y="32" fontSize="9" textAnchor="middle" fontFamily="Kalam" fill="#d9542b">铜牌</text>
          <g><circle cx="180" cy="40" r="4" fill="#1a1a1a"/></g>
          <text x="180" y="32" fontSize="9" textAnchor="middle" fontFamily="Kalam" fill="#4a4a4a">断剑</text>
          <g><circle cx="262" cy="40" r="5" fill="#c9a227"/></g>
          <text x="262" y="58" fontSize="8" textAnchor="middle" fontFamily="Kalam" fill="#c9a227"></text>
          {/* planned recall */}
          <circle cx="334" cy="40" r="5" fill="none" stroke="#d9542b" strokeDasharray="2 2"/>
          <text x="334" y="32" fontSize="9" textAnchor="middle" fontFamily="Kalam" fill="#d9542b">回收</text>
        </svg>
      </div>

      {/* foreshadow cards */}
      {[
        {n:"半枚铜牌",p:"第 17 章 · 沈砚得自父亲尸身",r:"计划 第 60 章前后",dist:"距 18 章",status:"待回收",sclr:"accent"},
        {n:"老者断剑",p:"第 29 章 · 卫衍临终留下",r:"计划 第 45 章",dist:"距 3 章",status:"临近",sclr:"warm"},
        {n:"灯无人添油",p:"第 42 章 · 本章新埋",r:"未规划",dist:"待定",status:"新埋",sclr:"fresh"},
        {n:"林九郎的玉佩",p:"第 11 章 · 一闪而过",r:"已回收 第 38 章",dist:"✓",status:"已收",sclr:"done"},
      ].map((f,i)=>{
        const cls = f.sclr==="accent" ? {bg:"#fff", bd:"var(--accent)", txt:"var(--accent)"} :
                    f.sclr==="warm"   ? {bg:"#fff2cf", bd:"#1a1a1a", txt:"var(--ink)"} :
                    f.sclr==="fresh"  ? {bg:"#fff", bd:"#1a1a1a", txt:"var(--ink)", dashed:true} :
                                        {bg:"#f3f1e8", bd:"#1a1a1a", txt:"var(--ink-3)"};
        return (
          <div key={i} className={"sk-box thin"+(cls.dashed?" dashed":"")} style={{padding:"7px 9px", marginBottom:6, background:cls.bg, borderColor:cls.bd, opacity:f.sclr==="done"?0.7:1}}>
            <div style={{display:"flex", alignItems:"center"}}>
              <span className="hand-cn" style={{fontSize:14, color:cls.txt}}>⚐ {f.n}</span>
              <span style={{flex:1}}/>
              <span className="tag" style={{fontSize:11, background: f.sclr==="accent"?"var(--accent)":(f.sclr==="warm"?"#c9a227":(f.sclr==="done"?"#1a1a1a":"#1a1a1a")), color:"#fff", borderColor:"transparent"}}>{f.status}</span>
            </div>
            <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:2}}>埋：{f.p}</div>
            <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>收：{f.r} <span style={{color:cls.txt, marginLeft:6}}>· {f.dist}</span></div>
            {f.sclr==="fresh" && <div className="hand-cn" style={{fontSize:11, color:"var(--accent)", marginTop:2}}>+ AI 帮我安排回收章节</div>}
          </div>
        );
      })}

      <div className="sk-box thin" style={{padding:"6px 8px", marginTop:4, background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>✦ 节奏提醒</div>
        <div className="hand-cn" style={{fontSize:12, lineHeight:"18px"}}>连续 3 章无新伏笔，可在 43-44 章埋 1 个小钩子，否则推进感会变平。</div>
      </div>

      <div style={{position:"absolute", left:18, right:18, bottom:14}}>
        <div className="sk-rule dashed"/>
        <div style={{display:"flex", gap:6, marginTop:8}}>
          <span className="tag accent hand-en">+ 标记伏笔</span>
          <span className="tag hand-en">从选中抽取</span>
          <span style={{flex:1}}/>
          <span className="tag hand-en">导出清单</span>
        </div>
      </div>
    </PanelShell>
  );
}

/* ===== 5) 风格 ============================================ */
function PanelStyle(){
  return (
    <PanelShell icon="✎" title="风格记忆" badge="自学 41 章">
      <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginBottom:8}}>AI 续写时自动遵守 · 每条可锁定/编辑</div>

      {/* metric grid */}
      <div className="sk-box thin" style={{padding:"8px 10px", marginBottom:10, background:"#fff"}}>
        <div className="hand-cn" style={{fontSize:13, marginBottom:6}}>笔触指标</div>
        {[
          {l:"平均句长", v:"14.2 字", t:"偏短 · 紧凑"},
          {l:"对话占比", v:"23%", t:"低 · 偏叙述"},
          {l:"比喻密度", v:"1.4 / 千字", t:"克制"},
          {l:"被动句", v:"3%", t:"几乎不用"},
        ].map((m,i)=>(
          <div key={i} style={{display:"flex", alignItems:"baseline", gap:8, fontSize:12, margin:"3px 0"}}>
            <span className="hand-en" style={{color:"var(--ink-3)", width:60}}>{m.l}</span>
            <span className="brush" style={{fontSize:14, color:"var(--accent)", width:70}}>{m.v}</span>
            <span className="hand-cn" style={{color:"var(--ink-2)", flex:1, fontSize:12}}>{m.t}</span>
          </div>
        ))}
      </div>

      {/* word preference */}
      <div className="hand-cn" style={{fontSize:13, marginBottom:4}}>词频偏好</div>
      <div style={{display:"flex", gap:8, marginBottom:10}}>
        <div className="sk-box thin" style={{flex:1, padding:"6px 8px", background:"#fff"}}>
          <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>多用</div>
          <div className="hand-cn" style={{fontSize:12, lineHeight:"20px"}}>压、冻、沉、刃<br/>不应、半枚、像 X 似的</div>
        </div>
        <div className="sk-box thin dashed" style={{flex:1, padding:"6px 8px"}}>
          <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>少用</div>
          <div className="hand-cn" style={{fontSize:12, lineHeight:"20px"}}>突然、忽然、霎时<br/>道、说、表示<br/>瞬间、爆发、毁天灭地</div>
        </div>
      </div>

      {/* per-character voice */}
      <div className="hand-cn" style={{fontSize:13, marginBottom:4}}>人物语气样本</div>
      {[
        {n:"沈砚",rule:'句末多用句号 · 不说"是" 说"嗯" · 不主动开口'},
        {n:"卫衍",rule:'用"小子" 不用"你" · 半文半白 · 喜引《诗》'},
        {n:"白如霜",rule:'句末偏问号 · 主语常省 · 爱用反问'},
      ].map((c,i)=>(
        <div key={i} className="sk-box thin" style={{padding:"6px 8px", marginBottom:4, background:"#fff"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="hand-cn" style={{fontSize:13}}>👤 {c.n}</span>
            <span style={{flex:1}}/>
            <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>🔒 锁定</span>
          </div>
          <div className="serif" style={{fontSize:12, lineHeight:"19px", color:"var(--ink-2)"}}>{c.rule}</div>
        </div>
      ))}

      <div className="sk-box thin" style={{padding:"6px 8px", marginTop:6, background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>✦ 本章相似度 87%</div>
        <div className="hand-cn" style={{fontSize:12, lineHeight:"18px"}}>当前章节与历史风格匹配良好。第 3 段比喻密度偏高（4.1/千字），建议精简。</div>
      </div>

      <div style={{position:"absolute", left:18, right:18, bottom:14}}>
        <div className="sk-rule dashed"/>
        <div style={{display:"flex", gap:6, marginTop:8}}>
          <span className="tag accent hand-en">重学风格</span>
          <span className="tag hand-en">+ 自定规则</span>
          <span style={{flex:1}}/>
          <span className="tag hand-en">导出样本</span>
        </div>
      </div>
    </PanelShell>
  );
}

/* ===== 6) 合规 ============================================ */
function PanelCompliance(){
  return (
    <PanelShell icon="⚖" title="合规与口味" badge="可发布">
      {/* platform pick */}
      <div className="hand-cn" style={{fontSize:13, marginBottom:4}}>目标平台</div>
      <div style={{display:"flex", gap:5, marginBottom:10, flexWrap:"wrap"}}>
        {[["起点",true],["番茄",true],["七猫"],["微信读书"],["晋江"]].map(([t,a],i)=>(
          <span key={i} className={"tag "+(a?"accent":"")} style={{fontSize:12}}>{a?"✓ ":""}{t}</span>
        ))}
      </div>

      {/* scan summary */}
      <div className="sk-box thin" style={{padding:"8px 10px", marginBottom:8, background:"#fff"}}>
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:4}}>
          <span className="hand-cn" style={{fontSize:13}}>本章扫描</span>
          <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>实时 · 16:42</span>
        </div>
        <div style={{display:"flex", gap:8}}>
          {[
            {l:"高危",v:0,c:"#d9542b"},
            {l:"中敏",v:2,c:"#c9a227"},
            {l:"低敏",v:5,c:"#1a1a1a"},
            {l:"口味",v:"中",c:"#4a4a4a"},
          ].map((s,i)=>(
            <div key={i} className="sk-box thin dashed" style={{flex:1, padding:"4px 6px", textAlign:"center"}}>
              <div className="brush" style={{fontSize:20, color:s.c}}>{s.v}</div>
              <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* issues */}
      <div className="hand-cn" style={{fontSize:13, marginBottom:4}}>命中（点击跳转正文）</div>
      {[
        {sev:"中",cl:"#c9a227",w:"血",ctx:"…缺角的地方还沾着旧血。",loc:"第 3 段",sug:'番茄建议改为"暗痕"'},
        {sev:"中",cl:"#c9a227",w:"刺杀",ctx:"…昔年北疆的刺杀…",loc:"第 7 段",sug:"七猫敏感 · 起点 OK"},
        {sev:"低",cl:"#1a1a1a",w:"喘气",ctx:"…像是有人正在里头喘气。",loc:"第 1 段",sug:"上下文安全 · 可忽略"},
      ].map((it,i)=>(
        <div key={i} className="sk-box thin" style={{padding:"6px 8px", marginBottom:5, background:"#fff"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="tag" style={{fontSize:11, background:it.cl, color:"#fff", borderColor:"transparent"}}>{it.sev}</span>
            <span className="hand-cn" style={{fontSize:13, marginLeft:6}}>"{it.w}"</span>
            <span style={{flex:1}}/>
            <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>{it.loc}</span>
          </div>
          <div className="serif" style={{fontSize:12, lineHeight:"19px", color:"var(--ink-2)", marginTop:2}}>{it.ctx}</div>
          <div className="hand-en" style={{fontSize:11, color:"var(--accent)", marginTop:2}}>↳ {it.sug}</div>
          <div style={{display:"flex", gap:4, marginTop:4}}>
            <span className="tag accent" style={{fontSize:11}}>AI 替换</span>
            <span className="tag" style={{fontSize:11}}>跳到</span>
            <span className="tag" style={{fontSize:11}}>忽略</span>
          </div>
        </div>
      ))}

      <div className="sk-box thin" style={{padding:"6px 8px", marginTop:4, background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>✦ 其他检测</div>
        <Row label="AI 味" value='低（"AI 痕迹检测器" 0.12）' color="var(--ink)"/>
        <Row label="抄袭相似" value="未发现 · 0.04 / 千字" color="var(--ink)"/>
        <Row label="字数" value="1,243 / 起点建议 2,800-3,200" color="var(--accent)"/>
      </div>

      <div style={{position:"absolute", left:18, right:18, bottom:14}}>
        <div className="sk-rule dashed"/>
        <div style={{display:"flex", gap:6, marginTop:8}}>
          <span className="tag accent hand-en">一键替换全部</span>
          <span className="tag hand-en">导出报告</span>
          <span style={{flex:1}}/>
          <span className="tag hand-en">平台规则 →</span>
        </div>
      </div>
    </PanelShell>
  );
}

Object.assign(window, { PanelContext, PanelCharacters, PanelWorld, PanelForeshadow, PanelStyle, PanelCompliance });
