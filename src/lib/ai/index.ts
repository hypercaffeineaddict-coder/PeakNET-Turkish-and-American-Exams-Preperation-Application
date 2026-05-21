// Yapay zeka sağlayıcısı seçici.
// GEMINI_API_KEY varsa Gemini, yoksa Ollama'ya düşer.

import * as gemini from "./gemini";
import * as ollama from "./ollama";

export type { ChatMessage } from "./ollama";
export type { Attachment } from "./gemini";

export type AIHealth = {
  ok: boolean;
  models: string[];
  hasChatModel: boolean;
  provider: "gemini" | "ollama";
  supportsAttachments: boolean;
  error?: string;
};

export async function aiHealth(): Promise<AIHealth> {
  if (gemini.isConfigured()) {
    const h = await gemini.geminiHealth();
    return { ...h, provider: "gemini", supportsAttachments: true };
  }
  const h = await ollama.ollamaHealth();
  return { ...h, provider: "ollama", supportsAttachments: false };
}

export async function streamChat(
  messages: import("./ollama").ChatMessage[],
  attachments?: import("./gemini").Attachment[],
  opts?: import("./gemini").ChatOptions,
): Promise<ReadableStream<Uint8Array>> {
  if (gemini.isConfigured()) {
    return gemini.streamChat(messages, attachments, opts);
  }
  // Ollama PDF desteklemiyor; attachment varsa yine de mesajları gönder
  return ollama.streamChat(messages, opts);
}

// Tek-atış JSON üretimi (tarama/test soruları için)
export async function generateJson(
  messages: import("./ollama").ChatMessage[],
  attachments?: import("./gemini").Attachment[],
): Promise<string> {
  if (gemini.isConfigured()) {
    return gemini.generateJson(messages, attachments);
  }
  // Ollama fallback: stream'i topla
  const stream = await ollama.streamChat(messages, { json: true });
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
  }
  return acc;
}

export { aiHealth as ollamaHealth };
