import { useState } from "react";
import type { AICredentials } from "../types.ts";

interface Props {
  initial: AICredentials;
  onSave: (c: AICredentials) => void;
  onClose: () => void;
}

const PRESETS = [
  { label: "OpenAI", apiUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  { label: "DeepSeek", apiUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  { label: "Moonshot", apiUrl: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
  { label: "本地 Ollama", apiUrl: "http://localhost:11434/v1", model: "qwen2.5" },
];

export function SettingsModal({ initial, onSave, onClose }: Props) {
  const [c, setC] = useState<AICredentials>(initial);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>AI 服务设置</h2>
        <p className="modal-sub">
          支持任意 OpenAI 兼容接口。Key 仅保存在本地浏览器，请求时经本地后端转发到你的服务，不上传第三方。
        </p>

        <div className="preset-row">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className="preset-chip"
              onClick={() => setC((prev) => ({ ...prev, apiUrl: p.apiUrl, model: p.model }))}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="field">
          <span>API URL</span>
          <input
            value={c.apiUrl}
            placeholder="https://api.openai.com/v1"
            onChange={(e) => setC({ ...c, apiUrl: e.target.value })}
          />
        </label>
        <label className="field">
          <span>API Key</span>
          <input
            type="password"
            value={c.apiKey}
            placeholder="sk-..."
            onChange={(e) => setC({ ...c, apiKey: e.target.value })}
          />
        </label>
        <label className="field">
          <span>模型</span>
          <input
            value={c.model}
            placeholder="gpt-4o-mini"
            onChange={(e) => setC({ ...c, model: e.target.value })}
          />
        </label>

        <div className="modal-actions">
          <button className="btn-soft" onClick={onClose}>取消</button>
          <button className="btn-accent" onClick={() => onSave(c)}>保存</button>
        </div>
      </div>
    </div>
  );
}
