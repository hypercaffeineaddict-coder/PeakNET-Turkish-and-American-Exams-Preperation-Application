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

// Anahtarı URL query'sinde TAŞIMA — header ile gönder. Böylece anahtar hiçbir
// hata mesajı, log satırı veya proxy erişim kaydındaki URL'de görünmez.
function authHeaders(apiKey: string, extra?: Record<string, string>): Record<string, string> {
  return { "x-goog-api-key": apiKey || KEY, ...(extra ?? {}) };
}

// Son savunma: bir metinde anahtar ya da key= query'si geçerse maskele.
export function redactSecrets(s: string): string {
  let out = s.replace(/([?&]key=)[^&\s"']+/gi, "$1***");
  if (KEY) out = out.split(KEY).join("***");
  return out;
}

export function isConfigured(): boolean {
  return KEY.length > 0;
}

export async function geminiHealth(apiKey?: string): Promise<{
  ok: boolean;
  models: string[];
  hasChatModel: boolean;
  error?: string;
}> {
  const activeKey = apiKey || KEY;
  if (!activeKey) {
    return {
      ok: false,
      models: [],
      hasChatModel: false,
      error: "GEMINI_API_KEY env değişkeni tanımlı değil ve kullanıcı anahtarı yok",
    };
  }
  try {
    const res = await fetch(`${API_BASE}/models/${MODEL}`, {
      headers: authHeaders(activeKey),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        models: [],
        hasChatModel: false,
        error: `HTTP ${res.status}: ${redactSecrets(text).slice(0, 200)}`,
      };
    }
    return { ok: true, models: [MODEL], hasChatModel: true };
  } catch (err) {
    return {
      ok: false,
      models: [],
      hasChatModel: false,
      error: redactSecrets(String(err)),
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

// Tek-atış JSON üretimi (streaming yok) — yapılandırılmış çıktı için güvenilir.
export async function generateJson(
  messages: ChatMessage[],
  attachments?: Attachment[],
  apiKey?: string
): Promise<string> {
  const activeKey = apiKey || KEY;
  if (!activeKey) throw new Error("GEMINI_API_KEY tanımlı değil");

  const systemMessages = messages.filter((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");
  const contents: GeminiContent[] = chatMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  if (attachments && attachments.length > 0) {
    const i = contents.findIndex((c) => c.role === "user");
    if (i !== -1) {
      contents[i].parts = [
        ...attachments.map((a) => ({
          inlineData: { mimeType: a.mimeType, data: a.base64 },
        })),
        ...contents[i].parts,
      ];
    }
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  };
  if (systemMessages.length > 0) {
    body.systemInstruction = {
      parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }],
    };
  }

  const url = `${API_BASE}/models/${MODEL}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(activeKey, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini error: ${res.status} ${redactSecrets(t).slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: {
      content?: { parts?: GeminiPart[] };
      finishReason?: string;
    }[];
    promptFeedback?: { blockReason?: string };
  };
  const cand = data.candidates?.[0];
  const text = (cand?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) {
    const reason =
      cand?.finishReason ?? data.promptFeedback?.blockReason ?? "boş yanıt";
    throw new Error(`Gemini boş yanıt döndü (${reason})`);
  }
  return text;
}

// Non-streaming düz metin üretimi (chat/solve için — streaming 2.5-flash'ta
// uzun yanıtlarda boş dönebiliyordu; bu güvenilir yol).
export async function generateText(
  messages: ChatMessage[],
  attachments?: Attachment[],
  apiKey?: string
): Promise<string> {
  const activeKey = apiKey || KEY;
  if (!activeKey) throw new Error("GEMINI_API_KEY tanımlı değil");

  const systemMessages = messages.filter((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");
  const contents: GeminiContent[] = chatMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  if (attachments && attachments.length > 0) {
    const i = contents.findIndex((c) => c.role === "user");
    if (i !== -1) {
      contents[i].parts = [
        ...attachments.map((a) => ({
          inlineData: { mimeType: a.mimeType, data: a.base64 },
        })),
        ...contents[i].parts,
      ];
    }
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
  };
  if (systemMessages.length > 0) {
    body.systemInstruction = {
      parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }],
    };
  }

  const url = `${API_BASE}/models/${MODEL}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(activeKey, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini error: ${res.status} ${redactSecrets(t).slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
  };
  const cand = data.candidates?.[0];
  const text = (cand?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) {
    const reason =
      cand?.finishReason ?? data.promptFeedback?.blockReason ?? "boş yanıt";
    throw new Error(`Gemini boş yanıt döndü (${reason})`);
  }
  return text;
}
