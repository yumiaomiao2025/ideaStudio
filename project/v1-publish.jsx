/* global React */
/* ============================================================
   v1 发布 + 读者数据
   - V1Publish: 多平台一键发布
   - V1Analytics: 追读数据 + AI 读者画像
   ============================================================ */

/* ===== 发布面板 ============================================ */
function V1Publish(){
  const platforms = [
    {n:"起点", status:"ok", title:"雪夜城下", titleVariants:3, sched:"立即", flag:"主战场"},
    {n:"番茄", status:"ok", title:"第42章 雪夜入城（沈砚的铜牌再次发烫）", titleVariants:5, sched:"立即", flag:"高曝光", note:"番茄推荐钩子型长标题"},
    {n:"七猫", status:"warn", title:"雪夜城下", titleVariants:3, sched:"待修后立即", issues:[
      {w:"刺杀", at:"第 7 段", fix:"暗杀"},
      {w:"血",   at:"第 3 段", fix:"暗痕"},
    ]},
    {n:"微信读书", status:"ok", title:"雪夜城下", titleVariants:3, sched:"明天 20:00"},
    {n:"晋江",  status:"none", flag:"未关联账号"},
  ];

  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 《剑入星海》 / 发布 / 第 42 章</span>
        <span style={{flex:1}}/>
        <span className="hand-en muted">已自动保存 · 12 秒前</span>
      </div>

      {/* header */}
      <div style={{position:"absolute", left:30, right:30, top:60, display:"flex", alignItems:"flex-end", gap:14}}>
        <div style={{flex:1}}>
          <div className="hand-en muted" style={{fontSize:13}}>准备发布</div>
          <div className="brush" style={{fontSize:36, lineHeight:1.1}}>第 42 章 · 雪夜城下</div>
          <div className="hand-en muted" style={{fontSize:14, marginTop:4}}>1,243 字 · 巡检通过 14/16 · ⚠ 七猫 2 处待修 · 健康度 +1</div>
        </div>
        <span className="tag" style={{padding:"4px 12px"}}>预览本章</span>
        <span className="tag" style={{padding:"4px 12px"}}>仅保存草稿</span>
        <span className="tag accent" style={{padding:"4px 14px", fontSize:14}}>🪶 一键发布 4 个平台 ›</span>
      </div>

      {/* LEFT: platforms */}
      <div style={{position:"absolute", left:14, top:152, width:760, bottom:14, padding:"0 0", overflow:"hidden"}}>
        <div className="hand-cn" style={{fontSize:16, marginBottom:8, marginLeft:6}}>平台清单 · 4 个已选</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {platforms.map((p,i)=>{
            const c = {
              ok:   {bg:"#fff", bd:"#1a1a1a", chip:"var(--accent)", chipC:"#fff", lbl:"✓ 可发"},
              warn: {bg:"#fff", bd:"#c9a227", chip:"#c9a227", chipC:"#fff", lbl:"⚠ 待修"},
              none: {bg:"#f3f1e8", bd:"#1a1a1a", chip:"#fff", chipC:"var(--ink)", lbl:"未关联", dashed:true},
            }[p.status];
            return (
              <div key={i} className={"sk-box "+(c.dashed?"thin dashed":"thin")} style={{padding:"10px 14px", background:c.bg, borderColor:c.bd, opacity:p.status==="none"?0.65:1}}>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <span className={"check"+(p.status!=="none"?" done":"")}/>
                  <div className="brush" style={{fontSize:22, width:90}}>{p.n}</div>
                  <span className="tag" style={{fontSize:11, background:c.chip, color:c.chipC, borderColor:c.bd}}>{c.lbl}</span>
                  {p.flag && <span className="tag warm" style={{fontSize:11}}>{p.flag}</span>}
                  <span style={{flex:1}}/>
                  {p.sched && <span className="hand-en" style={{fontSize:12, color:"var(--ink-3)"}}>⏱ {p.sched}</span>}
                </div>

                {p.status!=="none" && (
                  <>
                    <div className="sk-rule dashed" style={{margin:"8px 0"}}/>
                    <div style={{display:"flex", gap:14}}>
                      <div style={{flex:1, minWidth:0}}>
                        <div className="hand-en muted" style={{fontSize:11}}>标题（{p.titleVariants} 版可切）</div>
                        <div className="hand-cn" style={{fontSize:14, lineHeight:"22px", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{p.title}</div>
                        {p.note && <div className="hand-en" style={{fontSize:11, color:"var(--accent)", marginTop:2}}>✦ {p.note}</div>}
                        <div style={{display:"flex", gap:4, marginTop:4}}>
                          <span className="tag" style={{fontSize:11}}>换标题</span>
                          <span className="tag" style={{fontSize:11}}>章末作者说</span>
                          <span className="tag" style={{fontSize:11}}>差异化预览</span>
                        </div>
                      </div>
                      {p.issues && (
                        <div style={{width:280, paddingLeft:12, borderLeft:"1.25px dashed #c9a227"}}>
                          <div className="hand-en" style={{fontSize:11, color:"#c9a227"}}>⚠ 待修 {p.issues.length}</div>
                          {p.issues.map((it,k)=>(
                            <div key={k} className="hand-cn" style={{fontSize:12, lineHeight:"19px"}}>
                              「{it.w}」<span className="hand-en muted" style={{fontSize:11}}>{it.at}</span> <span style={{color:"var(--accent)"}}>→ 「{it.fix}」</span>
                            </div>
                          ))}
                          <div style={{display:"flex", gap:4, marginTop:6}}>
                            <span className="tag accent" style={{fontSize:11}}>一键 AI 替换</span>
                            <span className="tag" style={{fontSize:11}}>逐个查看</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {p.status==="none" && (
                  <div style={{display:"flex", alignItems:"center", gap:8, marginTop:6}}>
                    <span className="hand-en muted" style={{fontSize:13}}>{p.flag} · 同步将跳过此平台</span>
                    <span style={{flex:1}}/>
                    <span className="tag" style={{fontSize:11}}>关联账号</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* + new platform */}
        <div className="sk-box thin dashed" style={{padding:"8px 14px", marginTop:8, textAlign:"center"}}>
          <span className="hand-cn" style={{color:"var(--accent)"}}>+ 添加平台</span>
          <span className="hand-en muted" style={{fontSize:12, marginLeft:8}}>飞卢 / 阅文海外 / 自建站点 / RSS / EPUB 导出 …</span>
        </div>
      </div>

      {/* RIGHT: author note + schedule + preview */}
      <div style={{position:"absolute", right:14, top:152, width:466, bottom:14, display:"flex", flexDirection:"column", gap:10}}>
        {/* author note */}
        <div className="sk-box" style={{padding:"12px 14px", background:"#fff"}}>
          <div style={{display:"flex", alignItems:"center"}}>
            <span className="hand-cn" style={{fontSize:15}}>章末作者说</span>
            <span style={{flex:1}}/>
            <span className="tag" style={{fontSize:11}}>AI 起 3 版</span>
            <span className="tag" style={{fontSize:11, marginLeft:4}}>全平台一致</span>
          </div>
          <div className="sk-rule dashed" style={{margin:"6px 0"}}/>
          <div className="sk-box thin" style={{padding:"8px 10px", background:"#fafaf6", minHeight:74}}>
            <div className="serif" style={{fontSize:13, lineHeight:"22px"}}>城下这盏灯，留到 45 章再说。各位读者帮我盯一下沈砚的酒量——上一章我可能写漏了。<br/><span style={{color:"var(--accent)"}}>明天同一时间见。</span></div>
          </div>
          <div style={{display:"flex", gap:5, marginTop:6}}>
            <span className="tag accent" style={{fontSize:11}}>编辑</span>
            <span className="tag" style={{fontSize:11}}>再起一版</span>
            <span className="tag" style={{fontSize:11}}>不发</span>
            <span style={{flex:1}}/>
            <span className="hand-en muted" style={{fontSize:11}}>43 字</span>
          </div>
        </div>

        {/* schedule */}
        <div className="sk-box" style={{padding:"12px 14px", background:"#fff"}}>
          <div className="hand-cn" style={{fontSize:15, marginBottom:6}}>发布时间表</div>
          <div className="squiggle" style={{marginBottom:8}}/>
          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            {[
              {p:"起点", t:"今天 16:50（5 分钟后）", style:"accent"},
              {p:"番茄", t:"今天 16:50（同步）"},
              {p:"七猫", t:"待修后 立即（约 17:05）", style:"warm"},
              {p:"微读", t:"明天 20:00 · 定时", style:"future"},
            ].map((s,i)=>{
              const sty = {
                accent:{c:"var(--accent)", bg:"#fff8e8"},
                warm:{c:"#c9a227", bg:"#fff8e8"},
                future:{c:"var(--ink-3)", bg:"transparent"},
              }[s.style||""]||{c:"var(--ink)",bg:"transparent"};
              return (
                <div key={i} className="sk-box thin" style={{padding:"5px 8px", background:sty.bg, borderColor:sty.c==="var(--ink-3)"?"var(--ink-3)":(sty.c==="var(--ink)"?"#1a1a1a":sty.c)}}>
                  <div style={{display:"flex", alignItems:"baseline"}}>
                    <span className="hand-cn" style={{fontSize:14, color:sty.c, width:60}}>{s.p}</span>
                    <span className="hand-cn" style={{fontSize:13, color:"var(--ink)"}}>{s.t}</span>
                    <span style={{flex:1}}/>
                    <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>改</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sk-box thin" style={{padding:"6px 8px", marginTop:8, background:"#fff8e8", borderColor:"var(--accent)"}}>
            <div className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>✦ AI 时机建议</div>
            <div className="hand-cn" style={{fontSize:12, lineHeight:"18px"}}>起点/番茄在 17:00 发布转化最高（基于过去 10 章追读数据）。建议保持 16:50。</div>
          </div>
        </div>

        {/* preview tabs */}
        <div className="sk-box" style={{flex:1, padding:"12px 14px", background:"#fff", overflow:"hidden"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="hand-cn" style={{fontSize:15}}>预览 · 起点</span>
            <span style={{flex:1}}/>
            <div style={{display:"flex", gap:4}}>
              {["起点","番茄","七猫","微读"].map((p,i)=>(
                <span key={i} className={"tag "+(i===0?"accent":"")} style={{fontSize:11}}>{p}</span>
              ))}
            </div>
          </div>
          <div className="sk-rule dashed" style={{margin:"6px 0"}}/>
          {/* mock platform preview */}
          <div style={{background:"#fafaf6", padding:"8px 12px", borderRadius:4}}>
            <div className="serif" style={{fontSize:15, fontWeight:600}}>雪夜城下</div>
            <div className="hand-en muted" style={{fontSize:11, marginBottom:4}}>剑入星海 / 第 42 章 · 砚秋 著 · 1,243 字</div>
            <div className="serif" style={{fontSize:13, lineHeight:"22px", color:"var(--ink-2)"}}>
              <div style={{textIndent:"2em"}}>雪线压着城墙，像一道压了三天三夜的眉…</div>
              <div style={{textIndent:"2em"}}>"外乡人？" 守门兵的矛尖斜下来，带着雪。</div>
              <div className="hand-en muted" style={{fontSize:11, marginTop:6, fontStyle:"italic"}}>—— 作者说 ——</div>
              <div style={{textIndent:"2em"}}>城下这盏灯，留到 45 章再说……</div>
            </div>
          </div>
        </div>
      </div>

      <div className="annot" style={{left:30, top:130, transform:"rotate(-2deg)"}}>
        <span className="lbl">4 个平台同步 · 平台间差异自动处理</span>
      </div>
    </div>
  );
}

/* ===== 读者数据 + AI 画像 ===================================== */
function V1Analytics(){
  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 《剑入星海》 / 读者数据</span>
        <span style={{flex:1}}/>
        <span className="hand-en muted">数据回流 · 每小时同步</span>
      </div>

      {/* top: KPI row */}
      <div style={{position:"absolute", left:14, right:14, top:54, padding:"12px 18px", display:"flex", gap:14, alignItems:"center"}}>
        {[
          {l:"追读人数 (近 7 章)", v:"12,840", d:"+8.2%", c:"var(--accent)"},
          {l:"收藏", v:"4,326", d:"+126", c:"var(--ink)"},
          {l:"推荐票 / 本周", v:"1,802", d:"+340"},
          {l:"评论 / 本章", v:"218", d:"AI 已聚类"},
          {l:"完读率 (前 5 章)", v:"71%", d:"行业 ≈ 58%", c:"var(--accent)"},
        ].map((k,i)=>(
          <div key={i} className="sk-box" style={{flex:1, padding:"10px 14px", background:"#fff"}}>
            <div className="hand-en muted" style={{fontSize:11}}>{k.l}</div>
            <div className="brush" style={{fontSize:28, color:k.c||"var(--ink)"}}>{k.v}</div>
            <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>{k.d}</div>
          </div>
        ))}
      </div>

      {/* 4 charts grid */}
      <div style={{position:"absolute", left:14, right:14, top:182, bottom:240, display:"grid", gridTemplateColumns:"1.4fr 1fr", gridTemplateRows:"1fr 1fr", gap:14}}>

        {/* 追读 line chart */}
        <div className="sk-box" style={{padding:"12px 14px", background:"#fff", gridColumn:"1 / 2", gridRow:"1 / 3"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="brush" style={{fontSize:20}}>追读曲线</span>
            <span className="hand-en muted" style={{fontSize:12, marginLeft:6}}>每章入水率 · 全本</span>
            <span style={{flex:1}}/>
            {["起点","番茄","七猫"].map((p,i)=>(
              <span key={i} className="hand-en" style={{fontSize:12, color: i===0?"var(--accent)":(i===1?"#c9a227":"var(--ink-3)"), marginLeft:10}}>
                <span style={{display:"inline-block",width:10,height:2,background: i===0?"#d9542b":(i===1?"#c9a227":"#1a1a1a"),verticalAlign:"middle",marginRight:4}}/>{p}
              </span>
            ))}
          </div>
          <svg viewBox="0 0 720 280" style={{width:"100%", height:"100%", marginTop:6}}>
            <line x1="40" y1="240" x2="700" y2="240" stroke="#1a1a1a"/>
            <line x1="40" y1="20" x2="40" y2="240" stroke="#1a1a1a"/>
            {[1,10,20,30,40].map((c,i)=>(
              <text key={i} x={40+(c/42)*640} y="258" fontSize="10" textAnchor="middle" fontFamily="Caveat" fill="#4a4a4a">第{c}</text>
            ))}
            {[100,75,50,25,0].map((v,i)=>(
              <text key={i} x="34" y={26+i*55} fontSize="10" textAnchor="end" fontFamily="Caveat" fill="#4a4a4a">{v}%</text>
            ))}
            {/* 起点 */}
            <path d="M 56 28 Q 100 36 140 48 T 220 84 T 300 96 T 380 124 T 460 140 T 540 158 T 620 152 T 692 138"
                  fill="none" stroke="#d9542b" strokeWidth="2"/>
            {/* 番茄 */}
            <path d="M 56 50 Q 100 70 140 90 T 220 122 T 300 148 T 380 168 T 460 176 T 540 192 T 620 196 T 692 188"
                  fill="none" stroke="#c9a227" strokeWidth="2"/>
            {/* 七猫 */}
            <path d="M 56 102 Q 140 130 220 152 T 380 188 T 540 208 T 692 218"
                  fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeDasharray="3 3"/>
            {/* dropout markers */}
            <circle cx="380" cy="124" r="5" fill="none" stroke="#d9542b" strokeWidth="1.5"/>
            <text x="386" y="116" fontSize="11" fontFamily="Caveat" fill="#d9542b">23 章流失 ↓</text>
            <line x1={56+(36/42)*640} y1="20" x2={56+(36/42)*640} y2="240" stroke="#d9542b" strokeDasharray="3 3" opacity="0.5"/>
            <text x={56+(36/42)*640} y="16" fontSize="10" textAnchor="middle" fontFamily="Caveat" fill="#d9542b">当前 42</text>
          </svg>
          <div className="sk-box thin" style={{padding:"5px 8px", marginTop:4, background:"#fff8e8", borderColor:"var(--accent)"}}>
            <span className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>✦ </span>
            <span className="hand-cn" style={{fontSize:12}}>23 章的入水率下降明显（你那一章铺得很慢）。我能帮你给那章加一个 200 字的小高潮，回流测试预计 +6%。</span>
          </div>
        </div>

        {/* 留存漏斗 */}
        <div className="sk-box" style={{padding:"12px 14px", background:"#fff"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="brush" style={{fontSize:20}}>留存漏斗</span>
            <span className="hand-en muted" style={{fontSize:12, marginLeft:6}}>前 5 章 → 完读</span>
          </div>
          <div style={{marginTop:8}}>
            {[
              {l:"打开第 1 章", v:100, n:"42,000"},
              {l:"读完第 1 章", v:88, n:"36,960"},
              {l:"读到第 3 章", v:79, n:"33,180"},
              {l:"读到第 5 章", v:71, n:"29,820"},
              {l:"追到当前 42 章", v:31, n:"13,020", c:"var(--accent)"},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex", alignItems:"center", gap:8, margin:"4px 0"}}>
                <span className="hand-cn" style={{fontSize:12, width:96}}>{s.l}</span>
                <div style={{flex:1, height:14, background:"#eee", borderRadius:3, overflow:"hidden"}}>
                  <div style={{height:"100%", width:`${s.v}%`, background:s.c||"#1a1a1a"}}/>
                </div>
                <span className="hand-en" style={{fontSize:11, width:40, textAlign:"right", color:s.c||"var(--ink)"}}>{s.v}%</span>
                <span className="hand-en muted" style={{fontSize:11, width:50, textAlign:"right"}}>{s.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 平台对比 */}
        <div className="sk-box" style={{padding:"12px 14px", background:"#fff"}}>
          <div style={{display:"flex", alignItems:"baseline"}}>
            <span className="brush" style={{fontSize:20}}>平台对比</span>
            <span className="hand-en muted" style={{fontSize:12, marginLeft:6}}>本章 24h</span>
          </div>
          {[
            {p:"起点", v:9800, c:"#d9542b", w:88},
            {p:"番茄", v:7320, c:"#c9a227", w:66},
            {p:"微读", v:1430, c:"#1a1a1a", w:13},
            {p:"七猫", v:0, c:"#8a8a8a", w:1, note:"⏱ 待修后"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex", alignItems:"center", gap:8, margin:"6px 0"}}>
              <span className="hand-cn" style={{fontSize:13, width:46}}>{s.p}</span>
              <div style={{flex:1, height:14, background:"#eee", borderRadius:3, overflow:"hidden"}}>
                <div style={{height:"100%", width:`${s.w}%`, background:s.c}}/>
              </div>
              <span className="brush" style={{fontSize:16, color:s.c, width:64, textAlign:"right"}}>{s.v.toLocaleString()}</span>
              {s.note && <span className="hand-en muted" style={{fontSize:10}}>{s.note}</span>}
            </div>
          ))}
          <div className="hand-en muted" style={{fontSize:11, marginTop:4}}>起点占 53%（主战场）· 番茄崛起中 (+18%)</div>
        </div>
      </div>

      {/* bottom: comments cluster */}
      <div className="sk-box" style={{position:"absolute", left:14, right:14, bottom:14, height:212, padding:"12px 16px", background:"#fff8e8", borderColor:"var(--accent)"}}>
        <div style={{display:"flex", alignItems:"baseline"}}>
          <span className="brush" style={{fontSize:20}}>读者声音 · AI 聚类</span>
          <span className="hand-en muted" style={{fontSize:12, marginLeft:8}}>本章 218 条评论 · 7 个话题</span>
          <span style={{flex:1}}/>
          {[["全部"],["起点 142",true],["番茄 64"],["微读 12"]].map(([t,a],i)=>(
            <span key={i} className={"tag "+(a?"accent":"")} style={{fontSize:11, marginLeft:4}}>{t}</span>
          ))}
        </div>
        <div className="sk-rule dashed" style={{margin:"8px 0"}}/>
        <div style={{display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr", gap:10}}>
          {/* topic 1 */}
          <div className="sk-box thin" style={{padding:"6px 8px", background:"#fff"}}>
            <div className="hand-cn" style={{fontSize:13}}>① 想看铜牌伏笔 <span className="hand-en" style={{color:"var(--accent)", fontSize:11}}>+86</span></div>
            <div className="serif" style={{fontSize:11, lineHeight:"17px", color:"var(--ink-2)", marginTop:2}}>"灯无人添油是不是铜牌真主的暗号"<br/>"求 45 章把伏笔收一收"</div>
            <div className="hand-en" style={{fontSize:10, color:"var(--accent)", marginTop:4}}>✦ AI 建议：考虑 44 章给一个小回响</div>
          </div>
          <div className="sk-box thin" style={{padding:"6px 8px", background:"#fff"}}>
            <div className="hand-cn" style={{fontSize:13}}>② 沈砚酒量矛盾 <span className="hand-en" style={{color:"#c9a227", fontSize:11}}>+24</span></div>
            <div className="serif" style={{fontSize:11, lineHeight:"17px", color:"var(--ink-2)", marginTop:2}}>"22 章不喝 31 章连饮我以为我看错了"</div>
            <div className="hand-en" style={{fontSize:10, color:"var(--accent)", marginTop:4}}>✦ 已在巡检 · 待你决定</div>
          </div>
          <div className="sk-box thin" style={{padding:"6px 8px", background:"#fff"}}>
            <div className="hand-cn" style={{fontSize:13}}>③ 节奏太慢 <span className="hand-en" style={{color:"#c9a227", fontSize:11}}>+18</span></div>
            <div className="serif" style={{fontSize:11, lineHeight:"17px", color:"var(--ink-2)", marginTop:2}}>"卷二开始有点拖" "雪夜城下铺得久"</div>
          </div>
          <div className="sk-box thin" style={{padding:"6px 8px", background:"#fff"}}>
            <div className="hand-cn" style={{fontSize:13}}>④ 白如霜何时出场 <span className="hand-en" style={{color:"var(--accent)", fontSize:11}}>+33</span></div>
            <div className="serif" style={{fontSize:11, lineHeight:"17px", color:"var(--ink-2)", marginTop:2}}>"催更白如霜！" "女主下线太久"</div>
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8, marginTop:8}}>
          <span className="hand-en muted" style={{fontSize:12}}>+3 个更小话题：</span>
          <span className="tag" style={{fontSize:11}}>钱二意外讨喜</span>
          <span className="tag" style={{fontSize:11}}>季元戏份少</span>
          <span className="tag" style={{fontSize:11}}>古风句式好评</span>
          <span style={{flex:1}}/>
          <span className="tag accent" style={{fontSize:12}}>把"+86 铜牌"加入伏笔规划</span>
        </div>
      </div>

      <div className="annot" style={{left:740, top:200, transform:"rotate(-2deg)"}}>
        <span className="lbl">3 个图表 + 1 个评论聚类</span>
      </div>
    </div>
  );
}

Object.assign(window, { V1Publish, V1Analytics });
