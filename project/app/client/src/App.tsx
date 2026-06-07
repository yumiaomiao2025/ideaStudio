import { useEffect, useRef, useState, useCallback } from "react";
import type { Novel, AICredentials } from "./types.ts";
import { fetchNovel, saveChapter, createChapter } from "./api.ts";
import { loadCredentials, saveCredentials, hasCredentials } from "./prompt.ts";
import { Topbar } from "./components/Topbar.tsx";
import { ChapterList } from "./components/ChapterList.tsx";
import { Editor } from "./components/Editor.tsx";
import { ContextPanel } from "./components/ContextPanel.tsx";
import { SettingsModal } from "./components/SettingsModal.tsx";

const NOVEL_ID = "n1";

export function App() {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [currentId, setCurrentId] = useState<string>("c42");
  const [creds, setCreds] = useState<AICredentials>(loadCredentials());
  const [showSettings, setShowSettings] = useState(false);
  const [saveState, setSaveState] = useState("已同步");
  const [toast, setToast] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  // ---- Load novel ----
  useEffect(() => {
    fetchNovel(NOVEL_ID)
      .then((n) => {
        setNovel(n);
        const writing = n.chapters.find((c) => c.status === "writing");
        if (writing) setCurrentId(writing.id);
      })
      .catch(() => setToast("无法连接后端，请确认 server 已启动"));
  }, []);

  // ---- First-run: prompt for credentials ----
  useEffect(() => {
    if (!hasCredentials(creds)) setShowSettings(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const chapter = novel?.chapters.find((c) => c.id === currentId);

  // ---- Debounced save on body change ----
  const handleBodyChange = useCallback(
    (text: string) => {
      if (!novel || !chapter) return;
      // optimistic local update
      setNovel((prev) =>
        prev
          ? { ...prev, chapters: prev.chapters.map((c) => (c.id === chapter.id ? { ...c, body: text } : c)) }
          : prev
      );
      setSaveState("正在保存…");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        try {
          await saveChapter(novel.id, chapter.id, { body: text });
          setSaveState("已同步 · " + new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
        } catch {
          setSaveState("保存失败");
        }
      }, 700);
    },
    [novel, chapter]
  );

  const handleCreate = useCallback(
    async (volumeId: string) => {
      if (!novel) return;
      try {
        const ch = await createChapter(novel.id, volumeId, "新章节");
        setNovel((prev) => (prev ? { ...prev, chapters: [...prev.chapters, ch] } : prev));
        setCurrentId(ch.id);
      } catch {
        showToast("新建章节失败");
      }
    },
    [novel, showToast]
  );

  if (!novel || !chapter) {
    return <div className="loading">加载中…</div>;
  }

  return (
    <div id="app">
      <Topbar
        novelTitle={novel.title}
        chapterLabel={`第 ${chapter.num} 章 · ${chapter.title}`}
        saveState={saveState}
        onOpenSettings={() => setShowSettings(true)}
      />
      <div className="body">
        <ChapterList
          novel={novel}
          currentId={currentId}
          onSelect={setCurrentId}
          onCreate={handleCreate}
        />
        <Editor
          key={chapter.id}
          novel={novel}
          chapter={chapter}
          credentials={creds}
          hasCreds={hasCredentials(creds)}
          onBodyChange={handleBodyChange}
          onToast={showToast}
          onNeedSettings={() => setShowSettings(true)}
        />
        <ContextPanel novel={novel} />
      </div>

      {showSettings && (
        <SettingsModal
          initial={creds}
          onSave={(c) => {
            setCreds(c);
            saveCredentials(c);
            setShowSettings(false);
            showToast("AI 设置已保存");
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
