import { useState } from "react";
import type { Novel, AICredentials } from "../../types.ts";
import { streamComplete } from "../../api.ts";
import { buildSystemPrompt } from "../../prompt.ts";

interface Props {
  novel: Novel;
  credentials: AICredentials;
  hasCreds: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

const ISSUES = [
  { id: 1, category: "一致性", severity: "high" as const, title: "沈砚酒量前后矛盾", excerpt: "第22章：「沈砚不喝酒，矛尖挡了杯」/ 第31章：「连饮三盏，面不改色」", suggestions: ["改 22 章：删去不喝酒描写", "改 31 章：减为浅抿一口", "登记为成长事件", "忽略"] },
  { id: 2, category: "伏笔", severity: "high" as const, title: "铜牌伏笔距回收仅 18 章", excerpt: "第 17 章埋下「半枚铜牌」，预计第 60 章回收，当前第 42 章", suggestions: ["加入巡检计划", "提前铺垫", "调整回收章节"] },
  { id: 3, category: "节奏", severity: "medium" as const, title: "连续 5 章对话密度超 45%", excerpt: "第 38-42 章均以对话推进，叙事节奏偏快，读者需要喘息场景", suggestions: ["下一章加入独处环境描写", "插入过渡性回忆", "保持现有节奏"] },
  { id: 4, category: "命名", severity: "low" as const, title: "两个次要角色名字同音（季元/季远）", excerpt: "第 43 章新引入角色「季远」与反派「季元」读音相同，易混淆", suggestions: ["改季远为「程远」", "加强区分描写"] },
  { id: 5, category: "设定空缺", severity: "medium" as const, title: "雪夜城地图细节不足", excerpt: "城内方位描写缺失，第 42-44 章场景跳转逻辑模糊", suggestions: ["补充城内地图设定", "加入方位描写"] },
];

const CATEGORIES = ["全部", "一致性", "伏笔", "节奏", "命名", "设定空缺", "合规", "风格"];

export function InspectOverlay({ novel, credentials, hasCreds, onClose, onToast }: Props) {
  const [filter, setFilter] = useState("全部");
  const [aiResponse, setAiResponse] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<number | null>(null);
  const abortRef = { current: null as (() => void) | null };

  const filtered = filter === "全部" ? ISSUES : ISSUES.filter((i) => i.category === filter);

  function askAI(issue: typeof ISSUES[0]) {
    if (!hasCreds) { onToast("请先配置 AI 服务"); return; }
    setLoading(issue.id);
    let acc = "";
    abortRef.current = streamComplete(
      {
        credentials,
        system: buildSystemPrompt(novel),
        prompt: `针对以下问题给出具体可执行的修改建议：\n\n问题：${issue.title}\n\n原文摘录：${issue.excerpt}\n\n请给出 2-3 条具体建议，每条不超过 40 字。`,
        maxTokens: 300,
      },
      {
        onDelta: (d) => { acc += d; setAiResponse((prev) => ({ ...prev, [issue.id]: acc })); },
        onDone: () => setLoading(null),
        onError: (msg) => { setLoading(null); onToast("AI 错误：" + msg); },
      }
    );
  }

  const highCount = ISSUES.filter((i) => i.severity === "high").length;
  const medCount = ISSUES.filter((i) => i.severity === "medium").length;
  const lowCount = ISSUES.filter((i) => i.severity === "low").length;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">⚐ AI 巡检中心</h2>
          <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
            <span className="inspect-badge high">高 {highCount}</span>
            <span className="inspect-badge medium">中 {medCount}</span>
            <span className="inspect-badge low">低 {lowCount}</span>
          </div>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          <div className="inspect-filters">
            {CATEGORIES.map((cat) => (
              <button key={cat}
                className={"inspect-filter" + (filter === cat ? " active" : "")}
                onClick={() => setFilter(cat)}>
                {cat}
              </button>
            ))}
          </div>

          {filtered.map((issue) => (
            <div key={issue.id} className={"inspect-item " + issue.severity}>
              <div className="inspect-item-head">
                <span className={"inspect-badge " + issue.severity}>
                  {issue.severity === "high" ? "高" : issue.severity === "medium" ? "中" : "低"}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{issue.category}</span>
                <span className="inspect-item-title">{issue.title}</span>
              </div>
              <div className="inspect-excerpt">{issue.excerpt}</div>

              {aiResponse[issue.id] && (
                <div style={{
                  padding: "8px 10px", marginBottom: 8,
                  background: "var(--accent-soft)", borderRadius: 6,
                  fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.65,
                  fontFamily: "Noto Serif SC, serif",
                }}>
                  ✦ {aiResponse[issue.id]}
                </div>
              )}

              <div className="inspect-actions">
                <button
                  className={"inspect-action-btn primary" + (loading === issue.id ? " disabled" : "")}
                  onClick={() => askAI(issue)}
                  disabled={loading === issue.id}>
                  {loading === issue.id ? "AI 生成中…" : "✦ AI 给方案"}
                </button>
                {issue.suggestions.slice(1).map((s) => (
                  <button key={s} className="inspect-action-btn"
                    onClick={() => onToast(`已标记：${s}`)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
