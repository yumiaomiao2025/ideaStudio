# 网文studio · App

网文 AI 编辑器 —— 真正可部署的全栈实现。

- **前端**：React + TypeScript + Vite
- **后端**：Express + TypeScript
- **AI**：OpenAI 兼容接口（用户在设置里填 `apiUrl` + `apiKey` + `model`，支持任意兼容 `/chat/completions` 的服务：OpenAI、DeepSeek、Moonshot、本地 Ollama/vLLM 等），流式输出
- **存储**：本地 JSON 文件（零原生依赖，开箱即用；生产可替换为数据库）

## 目录结构

```
app/
  server/        Express 后端（AI 代理 + 数据持久化）
  client/        Vite + React 前端
  package.json   根脚本：一条命令同时起前后端
```

## 快速开始

```bash
cd app
npm install            # 安装根 + 子包依赖（用 npm workspaces）
npm run dev            # 同时启动后端(:8787) 和前端(:5173)
```

打开 http://localhost:5173

首次进入点右上角「设置」，填入你的 AI 服务：

| 字段 | 示例 |
|---|---|
| API URL | `https://api.openai.com/v1` 或 `https://api.deepseek.com/v1` |
| API Key | `sk-...` |
| 模型 | `gpt-4o-mini` / `deepseek-chat` / … |

Key 只存在你本地浏览器（localStorage），每次请求由前端发给后端，后端转发给你的 AI 服务，**不落库**。

## 构建部署

```bash
npm run build          # 前端打包到 client/dist，后端编译到 server/dist
npm start              # 生产模式：后端托管前端静态文件，单端口 :8787
```

## 技术说明

- AI 续写走 **SSE 流式**（`/api/ai/complete`），逐字返回，前端做打字机渲染
- 数据存在 `server/data/db.json`（章节、设定、伏笔）。删掉即重置，首次启动自动写入示例小说《剑入星海》
- 编辑器是受控 `contentEditable`，续写以 ghost-text 形式插入，Tab 接受 / Esc 拒绝

## 后续可扩展（已预留接口）

- 把 `server/src/store.ts` 的 JSON 实现换成 Prisma + Postgres
- 用户系统 / 多书 / 云同步
- 编辑器内核换成 Tiptap（ProseMirror）以支持更复杂的富文本与协同
