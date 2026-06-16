import { useState } from "react";
import type { Novel, Character } from "../../types.ts";
import { computeRelations, extractVoiceSamples } from "../../derive.ts";

interface Props {
  novel: Novel;
  characterId: string | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function CharacterOverlay({ novel, characterId, onClose, onToast }: Props) {
  const [tab, setTab] = useState<"info" | "relations" | "timeline" | "voice">("info");

  const character = novel.characters.find((c) => c.id === characterId);
  if (!character) return null;

  const EMOJI: Record<string, string> = {
    "沈砚": "🗡", "季元": "👁", "卫衍": "⚔", "白如霜": "❄",
  };

  // Relations derived from real chapter co-occurrence
  const relationCounts = computeRelations(novel, character);
  const relations = relationCounts.map((r) => ({
    name: r.name,
    relation: `共同出场 ${r.count} 章`,
    color: r.count >= 3 ? "var(--accent)" : r.count >= 2 ? "var(--warm)" : "var(--ink-3)",
  }));

  // Chapter appearances
  const chapters = novel.chapters.filter((c) =>
    c.body.includes(character.name)
  ).sort((a, b) => a.num - b.num);

  // Voice samples extracted from real dialogue in the body text
  const voiceSamples = extractVoiceSamples(novel, character);

  return (
    <div className="overlay-backdrop center-overlay" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">人 人物详情</h2>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          {/* Header */}
          <div className="char-detail-header">
            <div className="char-detail-avatar">
              {EMOJI[character.name] || character.name[0]}
            </div>
            <div>
              <div className="char-detail-name">{character.name}</div>
              <div className="char-detail-role">{character.role} · 第 {character.firstChapter} 章出场 · 出场 {character.appearances} 章</div>
              <div className="char-traits">
                {character.traits.map((t) => (
                  <span key={t} className="char-trait">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <p style={{ fontFamily: "Noto Serif SC, serif", fontSize: 14, lineHeight: 1.7, color: "var(--ink-2)", marginBottom: 16 }}>
            {character.description}
          </p>

          {/* Tabs */}
          <div className="char-tabs">
            {(["info", "relations", "timeline", "voice"] as const).map((t) => {
              const labels = { info: "基本信息", relations: "人物关系", timeline: "时间线", voice: "语气样本" };
              return (
                <button key={t} className={"char-tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>
                  {labels[t]}
                </button>
              );
            })}
          </div>

          {tab === "info" && (
            <div>
              <div className="panel-card" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>外貌特征</div>
                <div style={{ fontFamily: "Noto Serif SC, serif", fontSize: 13.5, lineHeight: 1.7 }}>
                  {character.description}
                </div>
              </div>
              <div className="panel-card">
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>性格标签</div>
                <div className="char-traits">
                  {character.traits.map((t) => <span key={t} className="char-trait">{t}</span>)}
                </div>
              </div>
            </div>
          )}

          {tab === "relations" && (
            <div>
              {relations.map((r) => (
                <div key={r.name} className="panel-card" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="char-avatar" style={{ width: 34, height: 34, fontSize: 14 }}>
                    {EMOJI[r.name] || r.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 12.5, color: r.color }}>{r.relation}</div>
                  </div>
                </div>
              ))}
              {relations.length === 0 && (
                <div style={{ color: "var(--ink-3)", fontSize: 13 }}>暂无关联人物数据</div>
              )}
            </div>
          )}

          {tab === "timeline" && (
            <div>
              <h5 style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>
                出场章节 · {chapters.length}
              </h5>
              {chapters.map((ch) => (
                <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--ink-4)", width: 28 }}>
                    {ch.num}
                  </span>
                  <span style={{ fontSize: 13 }}>{ch.title}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-4)" }}>
                    {ch.status === "writing" ? "进行中" : ch.status === "done" ? "已完" : ""}
                  </span>
                </div>
              ))}
              {chapters.length === 0 && (
                <div style={{ color: "var(--ink-3)", fontSize: 13 }}>未在正文中检测到该人物名</div>
              )}
            </div>
          )}

          {tab === "voice" && (
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>
                {character.name} 的典型对话风格
              </div>
              {voiceSamples.map((v, i) => (
                <div key={i} className="panel-card" style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: "Noto Serif SC, serif", fontSize: 14, lineHeight: 1.8 }}>"{v}"</div>
                </div>
              ))}
              {voiceSamples.length === 0 && (
                <div style={{ color: "var(--ink-3)", fontSize: 13 }}>正文中暂未检测到该人物的对话</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
