import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, friendlyAIError, type ChatMessage, type Attachment } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

// Inline-edilebilir maksimum dosya boyutu (Gemini ~20MB limit ama büyük olunca yavaş)
const MAX_INLINE_BYTES = 15 * 1024 * 1024;
// Mesaj/içerik sınırları — DOS ve AI maliyeti koruması.
const MAX_MESSAGES = 60;
const MAX_MSG_CHARS = 8000;
const MAX_TOTAL_CHARS = 60_000;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json()) as {
    messages: ChatMessage[];
    attachmentResourceId?: string;
  };
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("Bad request", { status: 400 });
  }
  if (body.messages.length > MAX_MESSAGES) {
    return new Response(
      `Çok fazla mesaj (${body.messages.length}/${MAX_MESSAGES}). Sohbeti yenile.`,
      { status: 413 },
    );
  }
  // Şema doğrulaması + uzunluk kapağı.
  let total = 0;
  for (const m of body.messages) {
    if (!m || typeof m !== "object") {
      return new Response("Bad request", { status: 400 });
    }
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (
      role !== "user" &&
      role !== "assistant" &&
      role !== "system"
    ) {
      return new Response("Bad request", { status: 400 });
    }
    if (typeof content !== "string" || content.length > MAX_MSG_CHARS) {
      return new Response(
        `Mesaj çok uzun (>${MAX_MSG_CHARS} karakter)`,
        { status: 413 },
      );
    }
    total += content.length;
    if (total > MAX_TOTAL_CHARS) {
      return new Response(
        `Toplam içerik çok uzun (>${MAX_TOTAL_CHARS} karakter)`,
        { status: 413 },
      );
    }
  }

  // Rate limit
  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  // Attachment varsa: kaynak verisini storage'tan çek, base64 yap
  const attachments: Attachment[] = [];
  if (body.attachmentResourceId) {
    const { data: resource } = await supabase
      .from("topic_resources")
      .select("kind, mime_type, storage_path, file_size, title")
      .eq("id", body.attachmentResourceId)
      .eq("user_id", user.id)
      .single();

    if (!resource) {
      return new Response("Attachment kaynağı bulunamadı", { status: 404 });
    }
    if (!resource.storage_path) {
      return new Response("Bu kaynak dosya içermiyor", { status: 400 });
    }
    if (resource.file_size && resource.file_size > MAX_INLINE_BYTES) {
      return new Response(
        `Dosya çok büyük (>${MAX_INLINE_BYTES / 1024 / 1024} MB)`,
        { status: 400 },
      );
    }

    const { data: file, error: dlErr } = await supabase.storage
      .from("resources")
      .download(resource.storage_path);
    if (dlErr || !file) {
      return new Response(`Dosya indirilemedi: ${dlErr?.message}`, { status: 500 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");
    attachments.push({
      mimeType: resource.mime_type || "application/pdf",
      base64,
      filename: resource.title,
    });
  }

  try {
    const text = await generateText(
      body.messages,
      attachments.length > 0 ? attachments : undefined,
    );
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return new Response(friendlyAIError(err), { status: 502 });
  }
}
