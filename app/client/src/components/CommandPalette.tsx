import { useState, useEffect, useRef, useCallback } from "react";
import type { Novel, Chapter, AICredentials } from "../types.ts";
import { streamComplete } from "../api.ts";
import { buildSystemPrompt, buildCommandPrompt } from "../prompt.ts";

interface Props {
  novel: Novel;
  chapter: Chapter;
  credentials: AICredentials;
  hasCreds: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  onToast: (msg: string) => void;
  onNeedSettings: () => void;
}

interface CmdItem {
  group: string;
  icon: string;
  label: string;
  hint: string;
  instruction: string;
}

const COMMANDS: CmdItem[] = [
  // Writing
  { group: "写作", icon: "✦", label: "续写", hint: "续写当前位置", instruction: "请续写前文，保持风格一致，1-3 句" },
  { group: "写作", icon: "✦", label: "开头三版", hint: "生成三种开头", instruction: "给出本章三种风格各异的开头，用「---」分隔" },
  { group: "写作", icon: "✦", label: "场景描写", hint: "补充环境细节", instruction: "补充一段自然克制的场景/环境描写，融入五感细节" },
  // Rewrite
  { group: "改写", icon: "✎", label: "冷峻改写", hint: "冷峻克制语气", instruction: "改写成更冷峻克制的语气，句子更短" },
  { group: "改写", icon: "✎", label: "对话紧绷", hint: "加强对话张力", instruction: "改写对话，使其更简短、更有张力，去掉多余修饰" },
  { group: "改写", icon: "✎", label: "扩写", hint: "展开至两倍", instruction: "适当扩写，加入动作、环境、内心细节，约两倍篇幅" },
  { group: "改写", icon: "✎", label: "缩写", hint: "压缩至 70%", instruction: "压缩至原文约 70%，保留核心信息" },
  // Character
  { group: "角色", icon: "人", label: "沈砚说话", hint: "生成沈砚台词", instruction: "以沈砚口吻说一句话（寡言冷峻，不超过 10 字）" },
  { group: "角色", icon: "人", label: "角色内心", hint: "内心独白", instruction: "写一段人物的内心活动，不用意识流，用具体意象呈现" },
  // Rhythm
  { group: "节奏", icon: "~", label: "加紧张感", hint: "提升节奏", instruction: "改写成节奏更紧张、句子更短、留白更多的版本" },
  { group: "节奏", icon: "~", label: "喘息段", hint: "放缓节奏", instruction: "写一段过渡性文字，节奏放缓，让读者喘口气" },
  // Compliance
  { group: "合规", icon: "⚖", label: "敏感词检测", hint: "扫描敏感内容", instruction: "检查以下内容是否有平台敏感词，列出并给出替换建议" },
  { group: "合规", icon: "⚖", label: "起点版", hint: "适配起点规范", instruction: "调整措辞以符合起点中文网平台规范，保持故事感" },
];

export function CommandPalette({
  novel, chapter, credentials, hasCreds,
  onClose, onResult, onToast, onNeedSettings,
}: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [scope, setScope] = useState<"paragraph" | "chapter">("paragraph");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const filtered = query
    ? COMMANDS.filter((c) =>
        c.label.includes(query) || c.group.includes(query) || c.hint.includes(query)
      )
    : COMMANDS;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const groups = [...new Set(filtered.map((c) => c.group))];

  const execute = useCallback((item: CmdItem) => {
    if (!hasCreds) { onNeedSettings(); return; }
    setBusy(true);
    const prompt = buildCommandPrompt(chapter, item.instruction, scope);
    let acc = "";
    abortRef.current = streamComplete(
      { credentials, system: buildSystemPrompt(novel), prompt, maxTokens: 500 },
      {
        onDelta: (d) => { acc += d; },
        onDone: () => { setBusy(false); onResult(acc); onClose(); },
        onError: (msg) => { setBusy(false); onToast("AI 错误：" + msg); },
      }
    );
  }, [chapter, scope, credentials, hasCreds, novel, onResult, onClose, onToast, onNeedSettings]);

  const executeCustom = useCallback(() => {
    if (!hasCreds) { onNeedSettings(); return; }
    if (!query.trim()) return;
    const customItem: CmdItem = {
      group: "自定义", icon: "✦", label: query, hint: "", instruction: query,
    };
    execute(customItem);
  }, [query, execute, hasCreds, onNeedSettings]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selected]) execute(filtered[selected]);
        else if (query.trim()) executeCustom();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, selected, query, execute, executeCustom, onClose]);

  let globalIndex = 0;

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-box" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-header">
          <div className="cmd-scope">
            <button className={"cmd-chip" + (scope === "paragraph" ? " active" : "")} onClick={() => setScope("paragraph")}>当前段</button>
            <button className={"cmd-chip" + (scope === "chapter" ? " active" : "")} onClick={() => setScope("chapter")}>当前章</button>
          </div>
          <div className="cmd-input-wrap">
            <input
              ref={inputRef}
              className="cmd-input"
              placeholder={busy ? "AI 生成中…" : "输入指令或自然语言…"}
              value={query}
              disabled={busy}
              onChange={(e) => setQuery(e.target.value)}
            />
            {busy && <span style={{ fontSize: 13, color: "var(--accent)" }}>⏳</span>}
          </div>
        </div>

        <div className="cmd-groups">
          {groups.map((group) => {
            const items = filtered.filter((c) => c.group === group);
            return (
              <div key={group}>
                <div className="cmd-group-label">{group}</div>
                {items.map((item) => {
                  const idx = globalIndex++;
                  return (
                    <div key={item.label}
                      className={"cmd-item" + (idx === selected ? " selected" : "")}
                      onClick={() => execute(item)}
                      onMouseEnter={() => setSelected(idx)}>
                      <span className="cmd-item-icon">{item.icon}</span>
                      <span className="cmd-item-label">{item.label}</span>
                      <span className="cmd-item-hint">{item.hint}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && query.trim() && (
            <div className="cmd-item" onClick={executeCustom}>
              <span className="cmd-item-icon">✦</span>
              <span className="cmd-item-label">"{query}"</span>
              <span className="cmd-item-hint">自定义指令 · 按 ↵ 执行</span>
            </div>
          )}
        </div>

        <div className="cmd-footer">
          <span>↑↓ 选择</span>
          <span>↵ 执行</span>
          <span>⎋ 关闭</span>
        </div>
      </div>
    </div>
  );
}
