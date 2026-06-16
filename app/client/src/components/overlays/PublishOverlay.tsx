import { useEffect, useState } from "react";
import type { Novel, Chapter, AICredentials } from "../../types.ts";
import { streamComplete, fetchCompliance, saveChapter } from "../../api.ts";
import { buildSystemPrompt } from "../../prompt.ts";

interface Props {
  novel: Novel;
  chapter: Chapter;
  credentials: AICredentials;
  hasCreds: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  onChapterUpdate: (chapter: Chapter) => void;
}

const ALL_PLATFORMS = ["起点", "番茄", "七猫", "微读", "晋江"];

export function PublishOverlay({ novel, chapter, credentials, hasCreds, onClose, onToast, onChapterUpdate }: Props) {
  const [titles, setTitles] = useState<string[]>([]);
  const [chapterTitle, setChapterTitle] = useState(chapter.title);
  const [authorNote, setAuthorNote] = useState(chapter.authorNote ?? "");
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [hasComplianceIssue, setHasComplianceIssue] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchCompliance(novel.id)
      .then((results) => setHasComplianceIssue(results.some((r) => r.chapterId === chapter.id)))
      .catch(() => {});
  }, [novel.id, chapter.id]);

  const platforms = ALL_PLATFORMS.map((name) => ({
    name,
    status: hasComplianceIssue ? ("warn" as const) : ("ready" as const),
  }));

  async function adoptTitle(t: string) {
    setChapterTitle(t);
    try {
      const saved = await saveChapter(novel.id, chapter.id, { title: t });
      onChapterUpdate(saved);
      onToast("已采用标题：" + t);
    } catch {
      onToast("标题保存失败");
    }
  }

  async function saveAuthorNote(note: string) {
    setAuthorNote(note);
    try {
      const saved = await saveChapter(novel.id, chapter.id, { authorNote: note });
      onChapterUpdate(saved);
    } catch {
      onToast("作者说保存失败");
    }
  }

  async function confirmPublish() {
    setPublishing(true);
    try {
      const saved = await saveChapter(novel.id, chapter.id, { status: "done" });
      onChapterUpdate(saved);
      onToast("已发布：第 " + chapter.num + " 章");
      onClose();
    } catch {
      onToast("发布失败");
    } finally {
      setPublishing(false);
    }
  }

  function generateTitles() {
    if (!hasCreds) { onToast("请先配置 AI 服务"); return; }
    setLoadingTitles(true);
    let acc = "";
    streamComplete(
      {
        credentials,
        system: buildSystemPrompt(novel),
        prompt: `为《${novel.title}》第 ${chapter.num} 章「${chapter.title}」生成 3 个不同风格的章节标题，用换行分隔。\n风格：古风简洁 / 悬念钩子 / 玩梗现代。只输出三个标题，每行一个。`,
        maxTokens: 150,
      },
      {
        onDelta: (d) => { acc += d; },
        onDone: () => {
          setTitles(acc.split("\n").filter((t) => t.trim()));
          setLoadingTitles(false);
        },
        onError: () => setLoadingTitles(false),
      }
    );
  }

  function generateAuthorNote() {
    if (!hasCreds) { onToast("请先配置 AI 服务"); return; }
    setLoadingNote(true);
    let acc = "";
    streamComplete(
      {
        credentials,
        system: buildSystemPrompt(novel),
        prompt: `为《${novel.title}》第 ${chapter.num} 章写一段章末作者说（100字内），语气亲切，可以提一个悬念或感谢读者，不要剧透。`,
        maxTokens: 200,
      },
      {
        onDelta: (d) => { acc += d; setAuthorNote(acc); },
        onDone: () => { setLoadingNote(false); saveAuthorNote(acc); },
        onError: () => setLoadingNote(false),
      }
    );
  }

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <h2 className="overlay-title">🪶 发布</h2>
          <span style={{ fontSize: 13, color: "var(--ink-3)", marginLeft: 12 }}>
            第 {chapter.num} 章 · {chapterTitle}
          </span>
          <button className="overlay-close" onClick={onClose}>×</button>
        </div>
        <div className="overlay-body">
          {/* Platform status */}
          <div className="panel-section">
            <h5>平台状态</h5>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {platforms.map((p) => (
                <div key={p.name} className={"pub-platform " + p.status}>
                  <div className="pub-platform-name">{p.name}</div>
                  <div className={"pub-platform-status " + p.status}>
                    {p.status === "ready" ? "✓ 可发" : "⚠ 含敏感词，建议先在「合规」面板修改"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Title suggestions */}
          <div className="panel-section">
            <h5>章节标题</h5>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: "Noto Serif SC, serif", fontWeight: 600, fontSize: 15 }}>{chapterTitle}</span>
              <button className="topbar-btn" onClick={generateTitles} disabled={loadingTitles}>
                {loadingTitles ? "生成中…" : "✦ AI 起标题"}
              </button>
            </div>
            {titles.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {titles.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--paper-2)", borderRadius: 6 }}>
                    <span style={{ flex: 1, fontFamily: "Noto Serif SC, serif", fontSize: 14 }}>{t}</span>
                    <button className="inspect-action-btn"
                      onClick={() => adoptTitle(t)}>
                      采用
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Author note */}
          <div className="panel-section">
            <h5>章末作者说</h5>
            <textarea
              style={{
                width: "100%", minHeight: 80, padding: "8px 10px",
                border: "1px solid var(--line-2)", borderRadius: 7,
                fontSize: 13, color: "var(--ink)", background: "var(--surface-2)",
                resize: "vertical", fontFamily: "Noto Serif SC, serif",
              }}
              value={authorNote}
              onChange={(e) => setAuthorNote(e.target.value)}
              onBlur={(e) => saveAuthorNote(e.target.value)}
              placeholder="章末作者说（可选）…"
            />
            <button className="topbar-btn" style={{ marginTop: 6 }}
              onClick={generateAuthorNote} disabled={loadingNote}>
              {loadingNote ? "生成中…" : "✦ AI 起草"}
            </button>
          </div>

          {/* Schedule */}
          <div className="pub-schedule">
            <h5 style={{ margin: "0 0 8px", fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>发布时机建议</h5>
            <div className="pub-time-row">
              <span className="pub-time-label">起点/番茄</span>
              <span className="pub-time-val">17:00</span>
              <span className="pub-time-tip">✓ 转化最高</span>
            </div>
            <div className="pub-time-row">
              <span className="pub-time-label">七猫/微读</span>
              <span className="pub-time-val">20:00</span>
              <span className="pub-time-tip">↑ 次优</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-accent" style={{ flex: 1 }}
              onClick={confirmPublish} disabled={publishing}>
              {publishing ? "发布中…" : "✓ 确认发布"}
            </button>
            <button className="btn-soft" onClick={onClose}>取消</button>
          </div>
        </div>
      </div>
    </div>
  );
}
