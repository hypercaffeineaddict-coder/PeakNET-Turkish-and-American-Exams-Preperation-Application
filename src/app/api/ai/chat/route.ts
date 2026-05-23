import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, friendlyAIError, type ChatMessage, type Attachment } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

// Inline-edilebilir maksimum dosya boyutu (Gemini ~20MB limit ama büyük olunca yavaş)
const MAX_INLINE_BYTES = 15 * 1024 * 1024;

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
