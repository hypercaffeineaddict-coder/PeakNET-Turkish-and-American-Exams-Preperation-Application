// Ollama HTTP client - server-side only.

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const BASE = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? "qwen2.5:7b";

export async function ollamaHealth(): Promise<{
  ok: boolean;
  models: string[];
  hasChatModel: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE}/api/tags`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return { ok: false, models: [], hasChatModel: false, error: `HTTP ${res.status}` };
    const data = (await res.json()) as { models?: { name: string }[] };
    const models = (data.models ?? []).map((m) => m.name);
    return {
      ok: true,
      models,
      hasChatModel: models.some((m) => m === CHAT_MODEL || m.startsWith(CHAT_MODEL.split(":")[0] + ":")),
    };
  } catch (err) {
    return { ok: false, models: [], hasChatModel: false, error: String(err) };
  }
}

export async function streamChat(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      stream: true,
      options: { temperature: 0.4 },
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama chat error: ${res.status}`);
  }

  // Ollama döner: NDJSON satırları. Bunu sade text stream'e çevir.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";

  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done) {
        if (buf.trim()) {
          try {
            const obj = JSON.parse(buf);
            if (obj.message?.content) controller.enqueue(encoder.encode(obj.message.content));
          } catch {}
        }
        controller.close();
        return;
      }
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.message?.content) controller.enqueue(encoder.encode(obj.message.content));
        } catch {
          // skip
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
