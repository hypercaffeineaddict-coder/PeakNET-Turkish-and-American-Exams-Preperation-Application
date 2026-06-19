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

// Tek-atış düz metin üretimi (chat/solve — güvenilir non-streaming)
export async function generateText(
  messages: import("./ollama").ChatMessage[],
  attachments?: import("./gemini").Attachment[],
): Promise<string> {
  if (gemini.isConfigured()) {
    return gemini.generateText(messages, attachments);
  }
  // Ollama fallback: stream'i topla
  const stream = await ollama.streamChat(messages, {});
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

// Ham AI hatasını kullanıcı dostu mesaja çevirir (tüm AI rotalarında ortak).
export function friendlyAIError(err: unknown): string {
  // Sızıntıya karşı: ham hatada anahtar/anahtar-query geçerse maskele; ayrıca
  // son çare mesajında ham metni istemciye olduğu gibi dökme.
  const msg = String(err).replace(/([?&]key=)[^&\s"']+/gi, "$1***");
  const lower = msg.toLowerCase();
  if (msg.includes("503") || lower.includes("overloaded")) {
    return "AI modeli şu an çok yoğun (503). Birkaç saniye bekleyip tekrar dene.";
  }
  if (msg.includes("429")) {
    return "İstek limitin doldu (429). Birkaç dakika bekle.";
  }
  if (lower.includes("api key") || msg.includes("401") || msg.includes("403")) {
    // Stack/yapılandırma ayrıntısını son kullanıcıya sızdırma.
    return "AI servisi şu an kullanılamıyor (yapılandırma). Lütfen sonra tekrar dene.";
  }
  if (lower.includes("fetch failed") || lower.includes("econnrefused")) {
    return "AI sunucusuna ulaşılamadı. Birkaç saniye sonra tekrar dene.";
  }
  return "AI hatası oluştu. Birkaç saniye sonra tekrar dene.";
}
