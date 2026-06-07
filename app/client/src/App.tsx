import { useEffect, useRef, useState, useCallback } from "react";
import type { Novel, AICredentials, ViewMode, RightTab, OverlayType } from "./types.ts";
import { fetchNovel, saveChapter, createChapter } from "./api.ts";
import { loadCredentials, saveCredentials, hasCredentials } from "./prompt.ts";
import { Topbar } from "./components/Topbar.tsx";
import { ChapterList } from "./components/ChapterList.tsx";
import { Editor, type EditorHandle } from "./components/Editor.tsx";
import { RightPanel } from "./components/RightPanel.tsx";
import { KanbanView } from "./components/KanbanView.tsx";
import { TimelineView } from "./components/TimelineView.tsx";
import { CommandPalette } from "./components/CommandPalette.tsx";
import { SettingsModal } from "./components/SettingsModal.tsx";
import { InspectOverlay } from "./components/overlays/InspectOverlay.tsx";
import { HealthOverlay } from "./components/overlays/HealthOverlay.tsx";
import { HistoryOverlay } from "./components/overlays/HistoryOverlay.tsx";
import { PublishOverlay } from "./components/overlays/PublishOverlay.tsx";
import { AnalyticsOverlay } from "./components/overlays/AnalyticsOverlay.tsx";
import { BookshelfOverlay } from "./components/overlays/BookshelfOverlay.tsx";
import { CharacterOverlay } from "./components/overlays/CharacterOverlay.tsx";

const NOVEL_ID = "n1";

export function App() {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [currentId, setCurrentId] = useState<string>("c42");
  const [creds, setCreds] = useState<AICredentials>(loadCredentials());
  const [view, setView] = useState<ViewMode>("write");
  const [rightTab, setRightTab] = useState<RightTab>("context");
  const [overlay, setOverlay] = useState<OverlayType>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCmd, setShowCmd] = useState(false);
  const [saveState, setSaveState] = useState("已同步");
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const editorRef = useRef<EditorHandle>(null);

  // Load novel
  useEffect(() => {
    fetchNovel(NOVEL_ID)
      .then((n) => {
        setNovel(n);
        const writing = n.chapters.find((c) => c.status === "writing");
        if (writing) setCurrentId(writing.id);
      })
      .catch(() => showToast("无法连接后端，请确认 server 已启动"));
  }, []);

  // First-run: prompt for credentials
  useEffect(() => {
    if (!hasCredentials(creds)) setShowSettings(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Theme sync
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ⌘K keyboard shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCmd((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const chapter = novel?.chapters.find((c) => c.id === currentId);

  const handleBodyChange = useCallback(
    (text: string) => {
      if (!novel || !chapter) return;
      setNovel((prev) =>
        prev ? { ...prev, chapters: prev.chapters.map((c) => c.id === chapter.id ? { ...c, body: text } : c) } : prev
      );
      setSaveState("正在保存…");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        try {
          await saveChapter(novel.id, chapter.id, { body: text });
          setSaveState("已同步 " + new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
        } catch {
          setSaveState("保存失败");
        }
      }, 700);
    },
    [novel, chapter]
  );

  const handleCreate = useCallback(async (volumeId: string) => {
    if (!novel) return;
    try {
      const ch = await createChapter(novel.id, volumeId, "新章节");
      setNovel((prev) => prev ? { ...prev, chapters: [...prev.chapters, ch] } : prev);
      setCurrentId(ch.id);
    } catch {
      showToast("新建章节失败");
    }
  }, [novel, showToast]);

  const handleCmdResult = useCallback((text: string) => {
    editorRef.current?.insertText(text);
    showToast("✦ AI 已插入");
  }, [showToast]);

  function handleCharacterClick(id: string) {
    setSelectedCharId(id);
    setOverlay("character");
  }

  if (!novel) {
    return <div className="loading">加载中…</div>;
  }

  if (!chapter && view === "write") {
    return <div className="loading">章节未找到</div>;
  }

  return (
    <div id="app">
      <Topbar
        novelTitle={novel.title}
        chapterLabel={chapter ? `第 ${chapter.num} 章 · ${chapter.title}` : ""}
        saveState={saveState}
        view={view}
        theme={theme}
        onViewChange={setView}
        onThemeToggle={() => setTheme((t) => t === "light" ? "dark" : "light")}
        onOpenSettings={() => setShowSettings(true)}
        onOpenInspect={() => setOverlay("inspect")}
        onOpenHealth={() => setOverlay("health")}
        onOpenHistory={() => setOverlay("history")}
        onOpenPublish={() => setOverlay("publish")}
        onOpenAnalytics={() => setOverlay("analytics")}
        onOpenBookshelf={() => setOverlay("bookshelf")}
      />

      <div className="body">
        {/* Left panel — always visible in write/kanban */}
        {view !== "timeline" && (
          <ChapterList
            novel={novel}
            currentId={currentId}
            onSelect={(id) => { setCurrentId(id); setView("write"); }}
            onCreate={handleCreate}
          />
        )}

        {/* Center */}
        {view === "write" && chapter && (
          <Editor
            ref={editorRef}
            key={chapter.id}
            novel={novel}
            chapter={chapter}
            credentials={creds}
            hasCreds={hasCredentials(creds)}
            onBodyChange={handleBodyChange}
            onToast={showToast}
            onNeedSettings={() => setShowSettings(true)}
          />
        )}
        {view === "kanban" && (
          <KanbanView
            novel={novel}
            currentId={currentId}
            onSelect={(id) => { setCurrentId(id); setView("write"); }}
          />
        )}
        {view === "timeline" && (
          <TimelineView novel={novel} />
        )}

        {/* Right panel — write mode only */}
        {view === "write" && (
          <RightPanel
            novel={novel}
            tab={rightTab}
            onTabChange={setRightTab}
            onNovelUpdate={setNovel}
            onToast={showToast}
            onCharacterClick={handleCharacterClick}
          />
        )}
      </div>

      {/* Command palette */}
      {showCmd && chapter && (
        <CommandPalette
          novel={novel}
          chapter={chapter}
          credentials={creds}
          hasCreds={hasCredentials(creds)}
          onClose={() => setShowCmd(false)}
          onResult={handleCmdResult}
          onToast={showToast}
          onNeedSettings={() => setShowSettings(true)}
        />
      )}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          initial={creds}
          onSave={(c) => { setCreds(c); saveCredentials(c); setShowSettings(false); showToast("AI 设置已保存"); }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Overlays */}
      {overlay === "inspect" && (
        <InspectOverlay
          novel={novel} credentials={creds} hasCreds={hasCredentials(creds)}
          onClose={() => setOverlay(null)} onToast={showToast}
        />
      )}
      {overlay === "health" && (
        <HealthOverlay novel={novel} onClose={() => setOverlay(null)} onToast={showToast} />
      )}
      {overlay === "history" && (
        <HistoryOverlay
          novel={novel} currentChapterId={currentId}
          onClose={() => setOverlay(null)} onToast={showToast}
        />
      )}
      {overlay === "publish" && chapter && (
        <PublishOverlay
          novel={novel} chapter={chapter} credentials={creds} hasCreds={hasCredentials(creds)}
          onClose={() => setOverlay(null)} onToast={showToast}
        />
      )}
      {overlay === "analytics" && (
        <AnalyticsOverlay novel={novel} onClose={() => setOverlay(null)} onToast={showToast} />
      )}
      {overlay === "bookshelf" && (
        <BookshelfOverlay
          novel={novel}
          onClose={() => setOverlay(null)}
          onOpenNovel={() => setView("write")}
          onToast={showToast}
        />
      )}
      {overlay === "character" && (
        <CharacterOverlay
          novel={novel} characterId={selectedCharId}
          onClose={() => setOverlay(null)} onToast={showToast}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
