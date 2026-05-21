// Google Gemini API client (server-side only)
// Streaming via Server-Sent Events.

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const API_BASE = (
  process.env.GEMINI_API_BASE ?? "https://generativelanguage.googleapis.com/v1beta"
).trim();
const MODEL = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash").trim();
const KEY = (process.env.GEMINI_API_KEY ?? "").trim();

export function isConfigured(): boolean {
  return KEY.length > 0;
}

export async function geminiHealth(): Promise<{
  ok: boolean;
  models: string[];
  hasChatModel: boolean;
  error?: string;
}> {
  if (!KEY) {
    return {
      ok: false,
      models: [],
      hasChatModel: false,
      error: "GEMINI_API_KEY env değişkeni tanımlı değil",
    };
  }
  try {
    const res = await fetch(`${API_BASE}/models/${MODEL}?key=${KEY}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        models: [],
        hasChatModel: false,
        error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    return { ok: true, models: [MODEL], hasChatModel: true };
  } catch (err) {
    return {
      ok: false,
      models: [],
      hasChatModel: false,
      error: String(err),
    };
  }
}

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType: string; data: string };
};
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

export type Attachment = {
  mimeType: string;
  base64: string;
  filename?: string;
};

export type ChatOptions = { json?: boolean };

function toGeminiPayload(
  messages: ChatMessage[],
  attachments?: Attachment[],
  opts?: ChatOptions,
) {
  const systemMessages = messages.filter((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents: GeminiContent[] = chatMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // İlk user mesajına attachment'ları ekle
  if (attachments && attachments.length > 0) {
    const firstUserIdx = contents.findIndex((c) => c.role === "user");
    if (firstUserIdx !== -1) {
      const attachmentParts: GeminiPart[] = attachments.map((a) => ({
        inlineData: { mimeType: a.mimeType, data: a.base64 },
      }));
      contents[firstUserIdx] = {
        ...contents[firstUserIdx],
        parts: [...attachmentParts, ...contents[firstUserIdx].parts],
      };
    }
  }

  const generationConfig: Record<string, unknown> = { temperature: 0.4 };
  if (opts?.json) {
    // JSON modu: geçerli JSON garantisi + thinking kapalı (hız + güvenilirlik)
    generationConfig.responseMimeType = "application/json";
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
    generationConfig.maxOutputTokens = 8192;
  }

  const body: Record<string, unknown> = { contents, generationConfig };

  if (systemMessages.length > 0) {
    body.systemInstruction = {
      parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }],
    };
  }

  return body;
}

export async function streamChat(
  messages: ChatMessage[],
  attachments?: Attachment[],
  opts?: ChatOptions,
): Promise<ReadableStream<Uint8Array>> {
  if (!KEY) throw new Error("GEMINI_API_KEY tanımlı değil");

  const url = `${API_BASE}/models/${MODEL}:streamGenerateContent?alt=sse&key=${KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toGeminiPayload(messages, attachments, opts)),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini error: ${res.status} ${text.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let buf = "";
      let finished = false;
      try {
        while (!finished) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const events = buf.split(/\n\n/);
          buf = events.pop() ?? "";
          for (const ev of events) {
            const dataLines = ev
              .split("\n")
              .filter((l) => l.startsWith("data: "))
              .map((l) => l.slice(6));
            if (dataLines.length === 0) continue;
            const finishReason = tryEmit(dataLines.join(""), controller, encoder);
            if (finishReason) {
              finished = true;
              break;
            }
          }
        }
        if (buf.trim()) {
          tryEmit(buf.startsWith("data: ") ? buf.slice(6) : buf, controller, encoder);
        }
      } catch {
        // ignore - close anyway
      } finally {
        try {
          await reader.cancel();
        } catch {}
        controller.close();
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

function tryEmit(
  jsonStr: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
): string | null {
  if (!jsonStr.trim()) return null;
  try {
    const obj = JSON.parse(jsonStr) as {
      candidates?: {
        content?: { parts?: GeminiPart[] };
        finishReason?: string;
      }[];
    };
    const cand = obj.candidates?.[0];
    const parts = cand?.content?.parts ?? [];
    for (const p of parts) {
      if (p.text) controller.enqueue(encoder.encode(p.text));
    }
    return cand?.finishReason ?? null;
  } catch {
    return null;
  }
}
