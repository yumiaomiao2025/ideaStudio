# CLAUDE.md — 网文studio 工程约定（Claude Code 必读）

> 这是一个网文 AI 编辑器。本仓库的 `app/` 是已搭好的真工程骨架；
> 同一设计项目里的 `网文studio · Prototype.html` 是**像素级交互原型**，作为还原的**验收标准**。
> 你的任务：把原型里的功能**一比一**搬进 `app/`，一次一个模块，跑通再下一个。

## 技术栈（已定，勿替换）
- 前端：React 18 + TypeScript + Vite（`app/client`）
- 后端：Express + TypeScript，ESM（`app/server`），import 路径带 `.js` 扩展名
- AI：OpenAI 兼容接口，用户在「设置」填 `apiUrl + apiKey + model`，后端 `/api/ai/complete` 做 SSE 流式代理
- 存储：`app/server/src/store.ts` 的 JSON 文件实现（后续可换 Prisma+Postgres）

## 运行
```bash
cd app && npm install && npm run dev   # 后端 :8787 + 前端 :5173
```

## 还原原则（重要）
1. **以原型为准**：每实现一个模块，对照 `网文studio · Prototype.html` 的视觉与交互核对，不要自由发挥。
2. **复用现有设计 token**：颜色/圆角/阴影全部用 `app/client/src/styles.css` 里的 CSS 变量（`--paper`、`--ink`、`--accent` 等），不要新造配色。
3. **复用现有类型与数据流**：领域类型在 `client/src/types.ts` 与 `server/src/types.ts`，保持前后端一致。
4. **原型里的 `proto-*.jsx` 是 JS 参考实现**：逻辑可直接借鉴，但要翻成 TS、接真数据、拆成合理组件。
5. **一次一个模块**：做完一个就停下来让我验收，别一口气全写。

## 已完成（骨架里已有，勿重写）
- 写作编辑器：contentEditable 正文、AI 流式续写 ghost-text（Tab 接受/Esc 拒绝）、选区改写工具条
- 章节目录、AI 上下文/设定面板、AI 设置弹窗、章节防抖保存

## 待移植模块清单（建议顺序，逐个做）
1. **看板视图** → `client/src/components/KanbanView.tsx`：卷/章卡片 + 5 档状态 + 顶部张力曲线
2. **时间线视图** → `TimelineView.tsx`：人物轨道 + 伏笔弧带 + 张力曲线
3. **⌘K 命令面板** → `CommandPalette.tsx`：分组指令 + 自然语言 → 调 AI
4. **设定词自动识别 + 弹卡**：正文里命中设定库的词加下划线、点击弹设定卡
5. **敏感词标黄 + 一键替换**：合规面板命中项接通正文替换
6. **自建 undo/redo 栈**：⌘Z 撤销 AI 改动（续写/改写/替换）
7. **巡检中心 / 全书健康度**：overlay 页，提醒列表 + 评分仪表盘
8. **设定库 CRUD**：人物/地点/物品/伏笔的增删改（后端加路由）
9. **修订历史**：章节版本快照 + 双栏 diff
10. **发布与回流、读者数据、书架、人物卡**：更外围，最后做

## 后端扩展位
- 新增数据：在 `server/src/types.ts` 加类型 → `store.ts` 加读写函数 → `routes/` 加路由
- 新增 AI 能力：复用 `routes/ai.ts` 的流式代理，前端在 `prompt.ts` 加 prompt 构造函数

## 验收方式
每个模块完成后：`npm run dev` 跑通、无 TS 报错、对照原型截图核对视觉与交互。
