import { useEffect, useRef, useState, useCallback } from "react";
import type React from "react";
import type { Novel, Chapter, AICredentials } from "../types.ts";
import { streamComplete } from "../api.ts";
import {
  buildSystemPrompt,
  buildContinuePrompt,
  buildRewritePrompt,
} from "../prompt.ts";

interface Props {
  novel: Novel;
  chapter: Chapter;
  credentials: AICredentials;
  hasCreds: boolean;
  onBodyChange: (text: string) => void;
  onToast: (msg: string) => void;
  onNeedSettings: () => void;
}

interface SelInfo {
  left: number;
  top: number;
  text: string;
  range: Range;
}

export function Editor({
  novel,
  chapter,
  credentials,
  hasCreds,
  onBodyChange,
  onToast,
  onNeedSettings,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement | null>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const pendingRef = useRef<HTMLSpanElement | null>(null); // rewrite preview span
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState<SelInfo | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const countChars = (s: string) => s.replace(/\s/g, "").length;

  // ---- Load chapter body into the editor when chapter changes ----
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    clearGhost();
    el.innerHTML = chapter.body
      .split("\n")
      .map((p) => `<p>${escapeHtml(p) || "<br/>"}</p>`)
      .join("");
    setWordCount(countChars(el.innerText));
  }, [chapter.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Read current plain text (excluding ghost / pending spans) ----
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

  // ---- Ghost helpers ----
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

  // ---- AI continue (streaming ghost) ----
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
    [novel, chapter, credentials, hasCreds, readText, onToast, onNeedSettings]
  );

  function acceptGhost() {
    const span = ghostRef.current;
    if (!span) return false;
    const text = (span.textContent || "").replace(/^\s/, "");
    const tn = document.createTextNode(" " + text);
    span.replaceWith(tn);
    ghostRef.current = null;
    const el = bodyRef.current!;
    setWordCount(countChars(el.innerText));
    onBodyChange(readText());
    onToast("已接受续写");
    return true;
  }

  // ---- Selection rewrite ----
  const runRewrite = useCallback(
    (instruction: string) => {
      if (!hasCreds) { onNeedSettings(); return; }
      const info = sel;
      setSel(null);
      if (!info) return;
      const range = info.range;
      // Insert an empty preview span in place of the selection
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
    [sel, novel, credentials, hasCreds, onToast, onNeedSettings]
  );

  function acceptRewrite() {
    const span = pendingRef.current;
    if (!span) return false;
    span.replaceWith(document.createTextNode(span.textContent || ""));
    pendingRef.current = null;
    bodyRef.current?.normalize();
    setWordCount(countChars(bodyRef.current!.innerText));
    onBodyChange(readText());
    onToast("已采用改写");
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

  // ---- Keyboard ----
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Tab") {
        if (pendingRef.current) { e.preventDefault(); acceptRewrite(); return; }
        if (ghostRef.current) { e.preventDefault(); acceptGhost(); return; }
      }
      if (e.key === "Escape") {
        if (pendingRef.current) { e.preventDefault(); revertRewrite(); return; }
        if (ghostRef.current) { e.preventDefault(); clearGhost(); return; }
      }
      // ⌘/Ctrl + J → 续写
      if ((e.metaKey || e.ctrlKey) && (e.key === "j" || e.key === "J")) {
        e.preventDefault();
        runContinue();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runContinue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Selection toolbar ----
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

  // ---- Input → save (debounced in App) ----
  function handleInput() {
    clearGhost();
    const el = bodyRef.current!;
    setWordCount(countChars(el.innerText));
    onBodyChange(readText());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      // keep paragraphs as <p>; let browser default mostly work
    }
  }

  const target = 3000;
  const pct = Math.min(100, Math.round((wordCount / target) * 100));

  return (
    <div className="center">
      <div className="editor-wrap">
        <div className="editor">
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
            onKeyDown={handleKeyDown}
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
        <div className="progress-mini"><div style={{ width: `${pct}%` }} /></div>
        <span className="status-right">{wordCount.toLocaleString()} / {target.toLocaleString()} 字</span>
      </div>

      {sel && !busy && (
        <div
          className="sel-toolbar"
          style={{ left: sel.left, top: sel.top - 8 }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button onClick={() => runRewrite("保持原意，换一种更冷峻克制的说法")}>改写</button>
          <button onClick={() => runRewrite("压缩到约 70%，更紧凑")}>缩写</button>
          <button onClick={() => runRewrite("适当展开，加入一个动作或环境细节")}>扩写</button>
          <button onClick={() => runRewrite("加入一个具体的五感细节")}>加细节</button>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
