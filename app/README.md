# 网文studio

网文 AI 编辑器 — React + TypeScript + Vite 前端，Express 后端，支持任意 OpenAI 兼容 AI 接口。

## 快速启动

```bash
cd app
npm install
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:8787

打开后在右上角 **⚙ 设置** 填入 AI 服务凭据即可开始使用。

## 功能

- **写作编辑器**：contentEditable 正文，AI 流式续写（⌘J），选区改写工具条，⌘Z 撤销 AI 操作
- **⌘K 命令面板**：12 条分组指令 + 自由自然语言指令，直接调 AI
- **三视图切换**：写作 / 看板 / 时间线
- **右侧 6 个面板**：上下文 / 人物 / 设定（含 CRUD）/ 伏笔 / 风格 / 合规
- **设定词自动识别**：正文中自动标注，点击弹出详情卡
- **AI 巡检中心**：一致性 / 伏笔 / 节奏等问题检测 + AI 给修改方案
- **全书健康度仪表盘**：评分 + 四维指标 + 本周可执行建议
- **修订历史**：版本时间轴 + 双栏 diff
- **发布面板**：多平台适配 + AI 起标题 + 章末作者说 + 发布时机建议
- **读者数据**：KPI + 追读曲线 + 留存漏斗 + 评论 AI 聚类
- **书架**：多书管理 + 码字热度图 + AI 提醒
- **人物详情**：性格 / 关系 / 时间线 / 语气样本
- **日/夜主题切换**

## AI 接入

支持任意 OpenAI 兼容接口：

| 服务 | API URL | 示例模型 |
|------|---------|---------|
| OpenAI | https://api.openai.com/v1 | gpt-4o-mini |
| DeepSeek | https://api.deepseek.com/v1 | deepseek-chat |
| Moonshot | https://api.moonshot.cn/v1 | moonshot-v1-8k |
| 本地 Ollama | http://localhost:11434/v1 | qwen2.5 |

也可在 `.env`（复制 `.env.example`）里设置服务端默认凭据。

## 生产部署

```bash
npm run build    # 编译前端 + 后端
npm start        # 单端口运行（后端托管前端）
```

## 数据存储

数据存储在 `server/src/data/db.json`（JSON 文件，零依赖）。  
如需换成 Postgres，在 `server/src/store.ts` 替换读写实现即可，接口不变。
