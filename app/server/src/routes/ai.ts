import { Router } from "express";
import type { AICredentials } from "../types.js";

export const aiRouter = Router();

interface CompleteBody {
  credentials?: Partial<AICredentials>;
  system: string;
  prompt: string;
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

aiRouter.post("/complete", async (req, res) => {
  const body = req.body as CompleteBody;
  const creds = resolveCreds(body);

  if (!creds.apiUrl || !creds.apiKey || !creds.model) {
    res.status(400).json({ error: "缺少 AI 凭据：请在「设置」填写 API URL / API Key / 模型。" });
    return;
  }

  const base = creds.apiUrl.replace(/\/+$/, "");
  const endpoint = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;

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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${creds.apiKey}` },
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
        } catch { /* skip partial */ }
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
