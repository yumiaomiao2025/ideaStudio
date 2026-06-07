/* global React */
/* ============================================================
   v1 补充
   - V1History: 修订历史 / 版本对比
   - V1Settings: AI 设置 / 模型与风格微调
   ============================================================ */

/* ===== 修订历史 ============================================ */
function V1History(){
  const versions = [
    {t:"刚刚 16:48",  who:"我",     by:"手写",  size:"+128 字", sel:false, label:"未保存"},
    {t:"16:35",      who:"AI",    by:"续写 200 字 (⌥W)", size:"+212 字", sel:true,  label:"当前对比"},
    {t:"16:22",      who:"我",     by:"改写 (⌘K · 紧绷化)", size:"−42 +88", sel:false, label:"采纳 ⌘K · 1 次"},
    {t:"16:08",      who:"AI",    by:"灯无人添油 (新伏笔)", size:"+38 字"},
    {t:"15:51",      who:"我",     by:"手写", size:"+520 字"},
    {t:"15:42",      who:"自动",   by:"快照 · 每 15 分", size:"·"},
    {t:"15:30",      who:"我",     by:"开篇 + 2 段对话",  size:"+412 字"},
    {t:"昨天 23:01", who:"我",     by:"导入大纲节拍 #42",  size:"+空稿"},
  ];
  const milestones = [
    {t:"📍 第 1 稿", d:"2026-05-15 完稿"},
    {t:"📍 编辑过稿", d:"05-16 14:02"},
    {t:"📍 巡检通过", d:"05-16 16:38"},
  ];

  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 《剑入星海》 / 第 42 章 / 修订历史</span>
        <span style={{flex:1}}/>
        <span className="hand-en muted">每次保存 + 每 15 分自动快照 · 保留 90 天</span>
      </div>

      {/* LEFT: timeline of versions */}
      <div className="sk-box" style={{position:"absolute", left:14, top:50, width:300, bottom:14, padding:"12px 12px", background:"#fff", overflow:"hidden"}}>
        <div style={{display:"flex", alignItems:"center"}}>
          <span className="hand-cn" style={{fontSize:16}}>历史 · 18 次</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted" style={{fontSize:12}}>仅本章</span>
        </div>
        <div className="squiggle" style={{margin:"6px 0 8px"}}/>

        {/* filter chips */}
        <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom:8}}>
          {[["全部",true],["我"],["AI"],["📍 里程碑"]].map(([t,a],i)=>(
            <span key={i} className={"tag "+(a?"accent":"")} style={{fontSize:11}}>{t}</span>
          ))}
        </div>

        {/* milestones */}
        <div style={{paddingLeft:8}}>
          {milestones.map((m,i)=>(
            <div key={i} className="sk-box thin" style={{padding:"4px 6px", marginBottom:4, background:"#fff8e8", borderColor:"var(--accent)"}}>
              <span className="hand-cn" style={{fontSize:12}}>{m.t}</span>
              <span className="hand-en muted" style={{fontSize:11, marginLeft:6}}>{m.d}</span>
            </div>
          ))}
        </div>

        <div className="sk-rule dashed" style={{margin:"8px 0"}}/>

        {/* version list */}
        <div style={{position:"relative", paddingLeft:14}}>
          <div style={{position:"absolute", left:6, top:6, bottom:6, width:1.5, background:"#1a1a1a"}}/>
          {versions.map((v,i)=>{
            const isAI = v.who==="AI";
            const isAuto = v.who==="自动";
            return (
              <div key={i} style={{position:"relative", marginBottom:10}}>
                <div className={"dot"+(v.sel?"":(isAuto?" hollow":""))} style={{
                  position:"absolute", left:-13, top:5,
                  background:v.sel?"var(--accent)":(isAI?"#c9a227":(isAuto?"transparent":"#1a1a1a")),
                  borderColor:isAI?"#c9a227":(isAuto?"var(--ink-3)":"#1a1a1a"),
                  width: v.sel?9:6, height: v.sel?9:6,
                }}/>
                <div className={"sk-box thin"+(v.sel?" thick":"")} style={{padding:"4px 8px", background:v.sel?"#fff8e8":"#fafaf6", borderColor:v.sel?"var(--accent)":"#1a1a1a"}}>
                  <div style={{display:"flex", alignItems:"baseline"}}>
                    <span className="hand-en" style={{fontSize:12, color: isAI?"#c9a227":(isAuto?"var(--ink-3)":"var(--ink-2)")}}>{v.t}</span>
                    <span style={{flex:1}}/>
                    <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>{v.size}</span>
                  </div>
                  <div className="hand-cn" style={{fontSize:12, marginTop:1, color:v.sel?"var(--accent)":"var(--ink)"}}>
                    <span style={{color: isAI?"#c9a227":"var(--ink-2)"}}>{isAI?"✦ ":""}{v.who}</span> · {v.by}
                  </div>
                  {v.label && <span className="tag" style={{fontSize:10, padding:"0 5px", marginTop:3, background:v.sel?"var(--accent)":"transparent", color:v.sel?"#fff":"var(--ink-2)", borderColor:v.sel?"var(--accent)":"#1a1a1a"}}>{v.label}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{position:"absolute", left:12, right:12, bottom:12}}>
          <div className="sk-rule dashed"/>
          <div className="hand-cn" style={{fontSize:13, marginTop:6}}>更早 ›</div>
        </div>
      </div>

      {/* RIGHT: diff view */}
      <div style={{position:"absolute", left:328, right:14, top:50, bottom:14, display:"flex", flexDirection:"column"}}>
        {/* toolbar */}
        <div className="sk-box thin" style={{padding:"8px 12px", background:"#fff", marginBottom:8, display:"flex", alignItems:"center", gap:8}}>
          <span className="hand-cn" style={{fontSize:14}}>对比</span>
          <span className="tag" style={{fontSize:12}}>16:35 ← AI 续写</span>
          <span className="hand-en muted">vs</span>
          <span className="tag accent" style={{fontSize:12}}>16:48 ← 当前 · 我</span>
          <span style={{flex:1}}/>
          <span className="hand-en muted" style={{fontSize:12}}>+128 / −42 · 净 +86 字</span>
          <span className="muted">|</span>
          <span className="tag" style={{fontSize:11}}>并排</span>
          <span className="tag accent" style={{fontSize:11}}>行内</span>
          <span className="tag" style={{fontSize:11}}>朗读对比</span>
        </div>

        {/* diff body — split */}
        <div style={{flex:1, display:"flex", gap:8, minHeight:0}}>
          {/* LEFT: 16:35 version */}
          <div className="sk-box fill-w" style={{flex:1, padding:"14px 20px", overflow:"hidden"}}>
            <div style={{display:"flex", alignItems:"baseline"}}>
              <span className="hand-cn" style={{fontSize:14, color:"#c9a227"}}>16:35 · AI 续写 200 字</span>
              <span style={{flex:1}}/>
              <span className="hand-en muted" style={{fontSize:12}}>1,115 字</span>
            </div>
            <div className="squiggle" style={{margin:"4px 0 12px"}}/>
            <div className="serif" style={{fontSize:14, lineHeight:"26px"}}>
              <div style={{textIndent:"2em"}}>沈砚没答话。他从怀里摸出半枚铜牌，铜牌缺角的地方还沾着旧血。</div>
              <div style={{textIndent:"2em", background:"#ffece4"}}>守门兵的脸色一下变了，矛尖收回去比抽出来还快。<span style={{color:"var(--ink-3)"}}>他低声说了句什么，沈砚没听清</span>，然后做了一个让的手势。</div>
              <div style={{textIndent:"2em", background:"#ffece4"}}>城门吱呀打开，雪卷着进来。沈砚低下头，把铜牌重新塞回怀里，跨过门槛。</div>
              <div style={{textIndent:"2em"}}>城里没有灯。</div>
              <div style={{textIndent:"2em", background:"#ffece4"}}>守门兵在他身后又站了很久，雪积满了肩。</div>
            </div>
          </div>

          {/* RIGHT: 16:48 version */}
          <div className="sk-box fill-w" style={{flex:1, padding:"14px 20px", overflow:"hidden", borderColor:"var(--accent)", borderWidth:"2.5px"}}>
            <div style={{display:"flex", alignItems:"baseline"}}>
              <span className="hand-cn" style={{fontSize:14, color:"var(--accent)"}}>16:48 · 我 · 当前</span>
              <span style={{flex:1}}/>
              <span className="hand-en muted" style={{fontSize:12}}>1,201 字</span>
            </div>
            <div className="squiggle accent" style={{margin:"4px 0 12px"}}/>
            <div className="serif" style={{fontSize:14, lineHeight:"26px"}}>
              <div style={{textIndent:"2em"}}>沈砚没答话。他从怀里摸出半枚铜牌，铜牌缺角的地方还沾着旧血。</div>
              <div style={{textIndent:"2em", background:"#e9f5e9"}}>守门兵没再说话。矛尖斜着收回，半寸。</div>
              <div style={{textIndent:"2em", background:"#e9f5e9"}}>城门吱呀。雪卷着进来，扑了沈砚一身。他没回头。<span style={{borderBottom:"1.25px dotted var(--accent)"}}>城楼上那盏灯</span>今夜竟没人去添油。</div>
              <div style={{textIndent:"2em"}}>城里没有灯。</div>
              <div style={{textIndent:"2em", background:"#e9f5e9"}}>守门兵把矛靠回墙上，又靠了第二次。</div>
            </div>
            <div style={{position:"absolute", right:18, bottom:14}} className="hand-en" >
              <span className="tag warm" style={{fontSize:11}}>⚐ 新埋伏笔：灯无人添油</span>
            </div>
          </div>
        </div>

        {/* bottom action */}
        <div className="sk-box thin" style={{marginTop:8, padding:"8px 12px", background:"#fff8e8", borderColor:"var(--accent)", display:"flex", alignItems:"center", gap:8}}>
          <span className="hand-en" style={{fontSize:13, color:"var(--accent)"}}>✦ AI 点评</span>
          <span className="hand-cn" style={{fontSize:13, flex:1}}>你的版本：对话占比 41% → 18% · 句子平均 14 → 9 字 · 伏笔密度 +1。更克制，且和卷一前 38 章的风格更接近。</span>
          <span className="tag" style={{fontSize:11}}>回到 16:35</span>
          <span className="tag" style={{fontSize:11}}>只回某一句</span>
          <span className="tag accent" style={{fontSize:11}}>保留当前 · 关闭</span>
        </div>
      </div>

      <div className="annot" style={{left:330, top:120, transform:"rotate(-2deg)"}}>
        <span className="lbl">左旧 / 右新 · 黄=去除 · 绿=新增</span>
      </div>
      <div className="annot" style={{left:330, top:680, transform:"rotate(2deg)"}}>
        <span className="lbl">AI 不是站队 · 它给数据</span>
      </div>
    </div>
  );
}

/* ===== AI 设置 ============================================ */
function V1Settings(){
  return (
    <div className="ab">
      <div className="titlebar">
        <span className="lights"><i/><i/><i/></span>
        <span className="brush" style={{fontSize:22}}>小说studio</span>
        <span className="hand-en muted" style={{fontSize:14}}>· 设置 / AI</span>
        <span style={{flex:1}}/>
        <span className="hand-en muted">所有改动实时生效</span>
      </div>

      {/* left nav */}
      <div className="sk-box" style={{position:"absolute", left:14, top:50, width:200, bottom:14, padding:"12px 12px", background:"#fff"}}>
        <div className="hand-cn" style={{fontSize:15, marginBottom:6}}>设置</div>
        <div className="squiggle" style={{marginBottom:6}}/>
        {[
          ["✦ AI", true],
          ["☱ 编辑器"],
          ["⚖ 合规与平台"],
          ["🔑 账号与发布"],
          ["☁ 备份与同步"],
          ["⌨ 快捷键"],
          ["💼 工作区"],
          ["ⓘ 关于"],
        ].map(([t,a],i)=>(
          <div key={i} className="hand-cn" style={{
            fontSize:13, padding:"5px 8px", marginBottom:2, borderRadius:5,
            background:a?"#fff8e8":"transparent", color:a?"var(--accent)":"var(--ink)"
          }}>{t}</div>
        ))}
        <div style={{position:"absolute", left:12, right:12, bottom:12}}>
          <div className="sk-rule dashed"/>
          <div className="hand-en muted" style={{fontSize:11, marginTop:6}}>本月用量</div>
          <div className="brush" style={{fontSize:18}}>2.4M token</div>
          <div style={{height:6, background:"#eee", borderRadius:99, overflow:"hidden", marginTop:4}}>
            <div style={{height:"100%", width:"48%", background:"var(--accent)"}}/>
          </div>
          <div className="hand-en muted" style={{fontSize:11, marginTop:2}}>48% · 套餐 5M</div>
        </div>
      </div>

      {/* main */}
      <div style={{position:"absolute", left:228, right:14, top:50, bottom:14, padding:"4px 0", overflow:"hidden"}}>
        <div style={{padding:"14px 18px 10px"}}>
          <div className="brush" style={{fontSize:32}}>AI · 模型与风格</div>
          <div className="hand-en muted" style={{fontSize:14}}>AI 在写作时的"性格"全在这里。每一项都有"恢复默认"。</div>
        </div>

        <div style={{padding:"0 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>

          {/* 模型选择 */}
          <div className="sk-box" style={{padding:"12px 14px", background:"#fff", gridColumn:"1 / 3"}}>
            <div style={{display:"flex", alignItems:"baseline"}}>
              <span className="brush" style={{fontSize:20}}>① 模型</span>
              <span style={{flex:1}}/>
              <span className="hand-en muted" style={{fontSize:12}}>不同场景可用不同模型</span>
            </div>
            <div className="sk-rule dashed" style={{margin:"6px 0 10px"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8}}>
              {[
                {scene:"行内续写", model:"小说-Lite", note:"快 · 0.3s", c:"var(--accent)"},
                {scene:"长段改写", model:"小说-Pro", note:"细 · 1.2s", c:"var(--accent)"},
                {scene:"巡检 & 一致性", model:"通用大模型", note:"深 · 离线跑"},
                {scene:"评论聚类", model:"通用 Embedding", note:"·"},
              ].map((m,i)=>(
                <div key={i} className="sk-box thin" style={{padding:"7px 9px", background:"#fafaf6"}}>
                  <div className="hand-en muted" style={{fontSize:11}}>{m.scene}</div>
                  <div className="hand-cn" style={{fontSize:14, color:m.c||"var(--ink)"}}>{m.model}</div>
                  <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>{m.note}</div>
                  <span className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>切换 ›</span>
                </div>
              ))}
            </div>
          </div>

          {/* 风格喂养 */}
          <div className="sk-box" style={{padding:"12px 14px", background:"#fff"}}>
            <div style={{display:"flex", alignItems:"baseline"}}>
              <span className="brush" style={{fontSize:20}}>② 风格喂养</span>
              <span style={{flex:1}}/>
              <span className="tag warm" style={{fontSize:11}}>已学 41 章 · 12.7 万字</span>
            </div>
            <div className="sk-rule dashed" style={{margin:"6px 0"}}/>
            <div className="hand-cn" style={{fontSize:13, marginBottom:4}}>学习来源</div>
            {[
              {l:"《剑入星海》本书前文", v:true, n:"41 章"},
              {l:"《夜读 · 都市修真录》", v:false, n:"26 章 · 跨书"},
              {l:"上传参考文（仅匿名提取风格）", v:true, n:"3 个 epub"},
              {l:"市售网文 · 排行榜样本", v:false, n:"100 本 · 偏向类型趋势"},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex", alignItems:"center", gap:6, padding:"3px 0"}}>
                <span className={"check"+(s.v?" done":"")}/>
                <span className="hand-cn" style={{fontSize:13, flex:1}}>{s.l}</span>
                <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>{s.n}</span>
              </div>
            ))}
            <div className="sk-box thin" style={{padding:"6px 8px", marginTop:8, background:"#fff8e8", borderColor:"var(--accent)"}}>
              <span className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>✦ </span>
              <span className="hand-cn" style={{fontSize:12}}>你的"句子长度"和"克制比喻"两项已学得很准，可以一键锁定。</span>
            </div>
            <div style={{display:"flex", gap:6, marginTop:8}}>
              <span className="tag accent" style={{fontSize:11}}>+ 上传新参考</span>
              <span className="tag" style={{fontSize:11}}>重新学习</span>
              <span className="tag" style={{fontSize:11}}>清空</span>
            </div>
          </div>

          {/* 介入强度 */}
          <div className="sk-box" style={{padding:"12px 14px", background:"#fff"}}>
            <div style={{display:"flex", alignItems:"baseline"}}>
              <span className="brush" style={{fontSize:20}}>③ 介入强度</span>
              <span style={{flex:1}}/>
              <span className="hand-en muted" style={{fontSize:12}}>AI 多主动一点 / 多安静一点</span>
            </div>
            <div className="sk-rule dashed" style={{margin:"6px 0 10px"}}/>
            {[
              {l:"行内续写 (ghost-text)", v:"自动", levels:["关","Tab 唤起","自动"], cur:2},
              {l:"⌘K 命令面板", v:"开", levels:["关","开"], cur:1},
              {l:"一致性巡检", v:"每 6 章", levels:["手动","每 6 章","实时"], cur:1},
              {l:"节拍/张力建议", v:"卷尾", levels:["关","卷尾","每章"], cur:1},
              {l:"评论聚类", v:"每日", levels:["关","每日","每小时"], cur:1},
              {l:"AI 起草标题", v:"发布前提示", levels:["手动","发布前提示","自动选最佳"], cur:1},
            ].map((s,i)=>(
              <div key={i} style={{margin:"6px 0"}}>
                <div style={{display:"flex", alignItems:"baseline"}}>
                  <span className="hand-cn" style={{fontSize:13, flex:1}}>{s.l}</span>
                  <span className="hand-en" style={{fontSize:12, color:"var(--accent)"}}>{s.v}</span>
                </div>
                <div style={{display:"flex", gap:0, marginTop:3, border:"1.25px solid #1a1a1a", borderRadius:5, overflow:"hidden"}}>
                  {s.levels.map((L,j)=>(
                    <span key={j} className="hand-cn" style={{flex:1, fontSize:11, padding:"3px 6px", textAlign:"center", background: j===s.cur?"var(--accent)":"#fafaf6", color: j===s.cur?"#fff":"var(--ink-2)", borderRight: j<s.levels.length-1?"1px solid #1a1a1a":"none"}}>{L}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 自定义指令 */}
          <div className="sk-box" style={{padding:"12px 14px", background:"#fff"}}>
            <div style={{display:"flex", alignItems:"baseline"}}>
              <span className="brush" style={{fontSize:20}}>④ ⌘K 自定义指令</span>
              <span style={{flex:1}}/>
              <span className="hand-en muted" style={{fontSize:12}}>22 内置 · 3 自定义</span>
            </div>
            <div className="sk-rule dashed" style={{margin:"6px 0"}}/>
            {[
              {k:"⌥V", n:"加一处感官细节（视觉为主）", pin:true},
              {k:"⌥M", n:"把这段改成「沈砚视角」内心独白", pin:true},
              {k:"⌥Z", n:"如果我是网友，会怎么吐槽这段？"},
            ].map((c,i)=>(
              <div key={i} className="sk-box thin" style={{padding:"6px 8px", marginBottom:4, background:"#fafaf6"}}>
                <div style={{display:"flex", alignItems:"center", gap:6}}>
                  <span className="tag" style={{fontSize:11, padding:"0 6px"}}>{c.k}</span>
                  <span className="hand-cn" style={{fontSize:13, flex:1}}>{c.n}</span>
                  {c.pin && <span className="hand-en" style={{fontSize:11, color:"var(--accent)"}}>📌 钉</span>}
                  <span className="hand-en" style={{fontSize:11, color:"var(--ink-3)"}}>编辑</span>
                </div>
              </div>
            ))}
            <div className="sk-box thin dashed" style={{padding:"6px 8px", textAlign:"center", marginTop:4}}>
              <span className="hand-cn" style={{color:"var(--accent)"}}>+ 新建指令</span>
              <span className="hand-en muted" style={{fontSize:11, marginLeft:6}}>把常用的提示词存为一键</span>
            </div>
          </div>

          {/* 隐私与归属 */}
          <div className="sk-box" style={{padding:"12px 14px", background:"#fff", gridColumn:"1 / 3"}}>
            <div style={{display:"flex", alignItems:"baseline"}}>
              <span className="brush" style={{fontSize:20}}>⑤ 隐私 & 归属</span>
              <span style={{flex:1}}/>
              <span className="hand-en muted" style={{fontSize:12}}>关于"你的字"</span>
            </div>
            <div className="sk-rule dashed" style={{margin:"6px 0 10px"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14}}>
              <div className="sk-box thin" style={{padding:"8px 10px", background:"#fafaf6"}}>
                <div className="hand-cn" style={{fontSize:13, color:"var(--accent)"}}>不用于平台训练</div>
                <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:2}}>你的稿子不会被拿去训练通用大模型 · 默认开启</div>
                <div className="hand-en" style={{fontSize:11, color:"var(--accent)", marginTop:4}}>✓ 已开</div>
              </div>
              <div className="sk-box thin" style={{padding:"8px 10px", background:"#fafaf6"}}>
                <div className="hand-cn" style={{fontSize:13}}>AI 贡献统计</div>
                <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:2}}>本书 AI 字数占比 <b>22%</b> · 计入版权声明？</div>
                <div className="hand-en" style={{fontSize:11, marginTop:4}}>不声明 / 章末标注 / 详细日志</div>
              </div>
              <div className="sk-box thin" style={{padding:"8px 10px", background:"#fafaf6"}}>
                <div className="hand-cn" style={{fontSize:13}}>本地优先</div>
                <div className="hand-en" style={{fontSize:11, color:"var(--ink-3)", marginTop:2}}>风格喂养、巡检在你电脑本地跑 · 续写仍走云端</div>
                <div className="hand-en" style={{fontSize:11, color:"var(--accent)", marginTop:4}}>✓ 部分本地</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="annot" style={{left:240, top:96, transform:"rotate(-2deg)"}}>
        <span className="lbl">"AI 是助手，不是合伙人"<br/>—— 控制权在作者</span>
      </div>
    </div>
  );
}

Object.assign(window, { V1History, V1Settings });
