import { Router } from "express";
import type { AICredentials } from "../types.js";

export const aiRouter = Router();

interface CompleteBody {
  credentials?: Partial<AICredentials>;
  /** 完整 system prompt（前端按章节上下文 + 风格记忆拼好）。 */
  system: string;
  /** 用户指令 / 续写请求。 */
  prompt: string;
  /** 生成上限。 */
  maxTokens?: number;
  temperature?: number;
}

function resolveCreds(body: CompleteBody): AICredentials {
  return {
    apiUrl: body.credentials?.apiUrl || process.env.AI_API_URL || "",
    apiKey: body.credentials?.apiKey || process.env.AI_API_KEY || "",
    model: body.credentials?.model || process.env.AI_MODEL || "",
  };
}

/**
 * POST /api/ai/complete  → SSE 流式
 * 把请求转发给任意 OpenAI 兼容的 /chat/completions（stream=true），
 * 逐 token 以 SSE `data: {"delta": "..."}` 推给前端。
 */
aiRouter.post("/complete", async (req, res) => {
  const body = req.body as CompleteBody;
  const creds = resolveCreds(body);

  if (!creds.apiUrl || !creds.apiKey || !creds.model) {
    res.status(400).json({
      error: "缺少 AI 凭据：请在前端「设置」填写 API URL / API Key / 模型，或在服务端 .env 配置。",
    });
    return;
  }

  // 规范化 endpoint：允许用户填 .../v1 或 .../v1/ 或完整 /chat/completions
  const base = creds.apiUrl.replace(/\/+$/, "");
  const endpoint = base.endsWith("/chat/completions")
    ? base
    : `${base}/chat/completions`;

  // 准备 SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (obj: unknown) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  const upstream = new AbortController();
  req.on("close", () => upstream.abort());

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creds.apiKey}`,
      },
      body: JSON.stringify({
        model: creds.model,
        stream: true,
        temperature: body.temperature ?? 0.8,
        max_tokens: body.maxTokens ?? 400,
        messages: [
          { role: "system", content: body.system },
          { role: "user", content: body.prompt },
        ],
      }),
      signal: upstream.signal,
    });

    if (!resp.ok || !resp.body) {
      const text = await resp.text().catch(() => "");
      send({ error: `AI 服务返回 ${resp.status}: ${text.slice(0, 300)}` });
      res.end();
      return;
    }

    // 解析上游的 SSE，转成我们自己的 {delta}
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") { send({ done: true }); res.end(); return; }
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) send({ delta });
        } catch {
          /* 跳过不完整片段 */
        }
      }
    }
    send({ done: true });
    res.end();
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") { res.end(); return; }
    send({ error: (err as Error)?.message || "AI 请求失败" });
    res.end();
  }
});
