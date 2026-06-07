import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import type { Novel, Chapter, AICredentials, Term } from "../types.ts";
import { streamComplete } from "../api.ts";
import { buildSystemPrompt, buildContinuePrompt, buildRewritePrompt } from "../prompt.ts";

interface SelInfo {
  left: number; top: number; text: string; range: Range;
}

interface TermPopover {
  term: Term; left: number; top: number;
}

export interface EditorHandle {
  insertText: (text: string) => void;
  getBody: () => string;
}

interface Props {
  novel: Novel;
  chapter: Chapter;
  credentials: AICredentials;
  hasCreds: boolean;
  onBodyChange: (text: string) => void;
  onToast: (msg: string) => void;
  onNeedSettings: () => void;
}

// Sensitive words list
const SENSITIVE_WORDS = ["刺杀", "暗杀", "血液", "尸身", "喘气", "旧血", "刀口"];

export const Editor = forwardRef<EditorHandle, Props>(function Editor(
  { novel, chapter, credentials, hasCreds, onBodyChange, onToast, onNeedSettings },
  ref
) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement | null>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const pendingRef = useRef<HTMLSpanElement | null>(null);
  const undoStack = useRef<{ html: string; label: string }[]>([]);
  const redoStack = useRef<{ html: string; label: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState<SelInfo | null>(null);
  const [termPopover, setTermPopover] = useState<TermPopover | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [undoLen, setUndoLen] = useState(0);
  const [redoLen, setRedoLen] = useState(0);

  const countChars = (s: string) => s.replace(/\s/g, "").length;

  // Build chapter HTML with term/sensitive word decoration
  function buildHTML(body: string): string {
    const lines = body.split("\n");
    return lines.map((line) => {
      let html = escapeHtml(line) || "<br/>";
      // Wrap sensitive words (amber)
      for (const sw of SENSITIVE_WORDS) {
        html = html.replace(
          new RegExp(escapeRegex(sw), "g"),
          `<span class="sensitive-word" data-sensitive="${sw}">${sw}</span>`
        );
      }
      // Wrap term words (accent dashed underline) — first occurrence only per paragraph
      const seen = new Set<string>();
      for (const term of novel.terms) {
        if (seen.has(term.name)) continue;
        if (html.includes(term.name)) {
          html = html.replace(
            new RegExp(escapeRegex(term.name), ""),
            `<span class="term-word" data-termid="${term.id}">${term.name}</span>`
          );
          seen.add(term.name);
        }
      }
      return `<p>${html}</p>`;
    }).join("");
  }

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    clearGhost();
    el.innerHTML = buildHTML(chapter.body);
    setWordCount(countChars(el.innerText));
    undoStack.current = [];
    redoStack.current = [];
    setUndoLen(0);
    setRedoLen(0);
  }, [chapter.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const readText = useCallback((): string => {
    const el = bodyRef.current;
    if (!el) return "";
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".ghost").forEach((n) => n.remove());
    clone.querySelectorAll(".rewrite-new").forEach((n) => {
      n.replaceWith(document.createTextNode(n.getAttribute("data-original") || ""));
    });
    return Array.from(clone.querySelectorAll("p"))
      .map((p) => p.textContent || "")
      .join("\n");
  }, []);

  // Undo/redo stack
  function snapshot(label: string) {
    const el = bodyRef.current;
    if (!el) return;
    const clean = el.cloneNode(true) as HTMLElement;
    clean.querySelectorAll(".ghost").forEach((n) => n.remove());
    const html = clean.innerHTML;
    undoStack.current.push({ html, label });
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
    setUndoLen(undoStack.current.length);
    setRedoLen(0);
  }

  function undo() {
    const el = bodyRef.current;
    if (!el || undoStack.current.length === 0) return;
    const current = el.innerHTML;
    const entry = undoStack.current.pop()!;
    redoStack.current.push({ html: current, label: "重做" });
    el.innerHTML = entry.html;
    setWordCount(countChars(el.innerText));
    setUndoLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
    onToast("↶ 撤销：" + entry.label);
  }

  function redo() {
    const el = bodyRef.current;
    if (!el || redoStack.current.length === 0) return;
    const current = el.innerHTML;
    const entry = redoStack.current.pop()!;
    undoStack.current.push({ html: current, label: "撤销" });
    el.innerHTML = entry.html;
    setWordCount(countChars(el.innerText));
    setUndoLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
    onToast("↷ 重做：" + entry.label);
  }

  // Ghost helpers
  function clearGhost() {
    abortRef.current?.();
    abortRef.current = null;
    ghostRef.current?.remove();
    ghostRef.current = null;
    bodyRef.current?.querySelectorAll(".ghost").forEach((n) => n.remove());
  }

  function ensureGhostSpan(): HTMLSpanElement {
    const el = bodyRef.current!;
    const lastP = el.querySelector("p:last-child") || el;
    const span = document.createElement("span");
    span.className = "ghost";
    span.contentEditable = "false";
    span.textContent = " ";
    lastP.appendChild(span);
    ghostRef.current = span;
    return span;
  }

  const runContinue = useCallback(
    (extra?: string) => {
      if (!hasCreds) { onNeedSettings(); return; }
      clearGhost();
      const span = ensureGhostSpan();
      setBusy(true);
      let acc = "";
      abortRef.current = streamComplete(
        {
          credentials,
          system: buildSystemPrompt(novel),
          prompt: buildContinuePrompt({ ...chapter, body: readText() }, extra),
          maxTokens: 400,
        },
        {
          onDelta: (d) => {
            acc += d;
            span.textContent = " " + acc;
            span.scrollIntoView({ block: "nearest" });
          },
          onDone: () => { setBusy(false); abortRef.current = null; if (!acc) clearGhost(); },
          onError: (msg) => { setBusy(false); clearGhost(); onToast("AI 错误：" + msg); },
        }
      );
    },
    [novel, chapter, credentials, hasCreds, readText, onToast, onNeedSettings] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function acceptGhost() {
    const span = ghostRef.current;
    if (!span) return false;
    snapshot("AI 续写");
    const text = (span.textContent || "").replace(/^\s/, "");
    const tn = document.createTextNode(" " + text);
    span.replaceWith(tn);
    ghostRef.current = null;
    const el = bodyRef.current!;
    setWordCount(countChars(el.innerText));
    onBodyChange(readText());
    onToast("✦ 已接受续写");
    setUndoLen(undoStack.current.length);
    return true;
  }

  const runRewrite = useCallback(
    (instruction: string) => {
      if (!hasCreds) { onNeedSettings(); return; }
      const info = sel;
      setSel(null);
      if (!info) return;
      snapshot("改写前");
      const range = info.range;
      range.deleteContents();
      const span = document.createElement("span");
      span.className = "rewrite-new";
      span.contentEditable = "false";
      span.setAttribute("data-original", info.text);
      span.textContent = "…";
      range.insertNode(span);
      pendingRef.current = span;
      setBusy(true);
      let acc = "";
      abortRef.current = streamComplete(
        {
          credentials,
          system: buildSystemPrompt(novel),
          prompt: buildRewritePrompt(info.text, instruction),
          maxTokens: 400,
        },
        {
          onDelta: (d) => { acc += d; span.textContent = acc; },
          onDone: () => { setBusy(false); if (!acc) revertRewrite(); },
          onError: (msg) => { setBusy(false); revertRewrite(); onToast("AI 错误：" + msg); },
        }
      );
    },
    [sel, novel, credentials, hasCreds, onToast, onNeedSettings] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function acceptRewrite() {
    const span = pendingRef.current;
    if (!span) return false;
    snapshot("AI 改写");
    span.replaceWith(document.createTextNode(span.textContent || ""));
    pendingRef.current = null;
    bodyRef.current?.normalize();
    setWordCount(countChars(bodyRef.current!.innerText));
    onBodyChange(readText());
    onToast("✓ 已采用改写");
    setUndoLen(undoStack.current.length);
    return true;
  }

  function revertRewrite() {
    const span = pendingRef.current;
    if (!span) return false;
    span.replaceWith(document.createTextNode(span.getAttribute("data-original") || ""));
    pendingRef.current = null;
    bodyRef.current?.normalize();
    return true;
  }

  // Insert text from CommandPalette result
  useImperativeHandle(ref, () => ({
    insertText(text: string) {
      snapshot("命令插入前");
      const el = bodyRef.current;
      if (!el) return;
      const lastP = el.querySelector("p:last-child") || el;
      const p = document.createElement("p");
      p.textContent = text;
      lastP.after(p);
      setWordCount(countChars(el.innerText));
      onBodyChange(readText());
      setUndoLen(undoStack.current.length);
    },
    getBody: readText,
  }));

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Tab") {
        if (pendingRef.current) { e.preventDefault(); acceptRewrite(); return; }
        if (ghostRef.current) { e.preventDefault(); acceptGhost(); return; }
      }
      if (e.key === "Escape") {
        if (pendingRef.current) { e.preventDefault(); revertRewrite(); return; }
        if (ghostRef.current) { e.preventDefault(); clearGhost(); onToast("已拒绝续写"); return; }
        setTermPopover(null);
      }
      // ⌘J = continue
      if ((e.metaKey || e.ctrlKey) && e.key === "j") { e.preventDefault(); runContinue(); }
      // ⌘Z = undo, ⌘⇧Z = redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        if (undoStack.current.length > 0) { e.preventDefault(); undo(); }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        if (redoStack.current.length > 0) { e.preventDefault(); redo(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runContinue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Selection toolbar
  useEffect(() => {
    function onSelChange() {
      const s = window.getSelection();
      const el = bodyRef.current;
      if (!s || s.rangeCount === 0 || s.isCollapsed || !el) { setSel(null); return; }
      const range = s.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) { setSel(null); return; }
      const text = s.toString();
      if (countChars(text) < 2) { setSel(null); return; }
      if (range.cloneContents().querySelector?.(".ghost")) { setSel(null); return; }
      const rect = range.getBoundingClientRect();
      setSel({ left: rect.left + rect.width / 2, top: rect.top, text, range: range.cloneRange() });
    }
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, []);

  // Term/sensitive popover on click
  function handleBodyClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.dataset.termid) {
      const term = novel.terms.find((t) => t.id === target.dataset.termid);
      if (term) {
        const rect = target.getBoundingClientRect();
        setTermPopover({ term, left: rect.left, top: rect.bottom + 6 });
        return;
      }
    }
    if (!target.closest(".term-popover")) setTermPopover(null);
  }

  function handleInput() {
    clearGhost();
    const el = bodyRef.current!;
    setWordCount(countChars(el.innerText));
    onBodyChange(readText());
  }

  const target = 3000;
  const pct = Math.min(100, Math.round((wordCount / target) * 100));

  return (
    <div className="center">
      <div className="editor-wrap" onClick={() => setTermPopover(null)}>
        <div className="editor" onClick={(e) => e.stopPropagation()}>
          <h1 className="chapter-title">第 {chapter.num} 章 · {chapter.title}</h1>
          <div className="chapter-sub">
            <span>{novel.title}</span>
            <span className="rule" />
            <span>{wordCount.toLocaleString()} / {target.toLocaleString()} 字 · {pct}%</span>
          </div>
          <div
            ref={bodyRef}
            className="body-text"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleInput}
            onClick={handleBodyClick}
          />
        </div>
      </div>

      <div className="status">
        <span>
          <span className={"pulse" + (busy ? " on" : "")} />
          {busy ? "AI 生成中…" : "AI 待命"}
        </span>
        <span className="sep">|</span>
        <button className="status-btn" onClick={() => runContinue()} disabled={busy}>
          ✦ 续写 <kbd>⌘J</kbd>
        </button>
        <button className="status-btn muted" onClick={undo} disabled={undoLen === 0} title="撤销 ⌘Z">
          ↶
        </button>
        <button className="status-btn muted" onClick={redo} disabled={redoLen === 0} title="重做 ⌘⇧Z">
          ↷
        </button>
        <div className="progress-mini"><div style={{ width: `${pct}%` }} /></div>
        <div className="status-right">
          <span>{wordCount.toLocaleString()} / {target.toLocaleString()} 字</span>
        </div>
      </div>

      {sel && !busy && (
        <div
          className="sel-toolbar"
          style={{ left: sel.left, top: sel.top }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button onClick={() => runRewrite("保持原意，换一种更冷峻克制的说法")}>改写</button>
          <button onClick={() => runRewrite("压缩到约 70%，更紧凑")}>缩写</button>
          <button onClick={() => runRewrite("适当展开，加入一个动作或环境细节")}>扩写</button>
          <button onClick={() => runRewrite("加入一个具体的五感细节")}>加细节</button>
        </div>
      )}

      {termPopover && (
        <div
          className="term-popover"
          style={{ left: termPopover.left, top: termPopover.top }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="term-popover-name">{termPopover.term.name}</div>
          <div className="term-popover-kind">{termPopover.term.kind}</div>
          <div className="term-popover-body">{termPopover.term.body}</div>
          {termPopover.term.meta && <div className="term-popover-meta">{termPopover.term.meta}</div>}
        </div>
      )}
    </div>
  );
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
