"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp, XP } from "@/lib/gamification";

export async function updateProgress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const topicId = String(formData.get("topic_id"));
  const status = String(formData.get("status"));
  const confidence = Number(formData.get("confidence")) || 0;

  // Önceki durumu al (yeni 'done' için XP, tekrar tetiklemede verme)
  const { data: prev } = await supabase
    .from("topic_progress")
    .select("status")
    .eq("user_id", user.id)
    .eq("topic_id", topicId)
    .maybeSingle();

  await supabase.from("topic_progress").upsert({
    user_id: user.id,
    topic_id: topicId,
    status,
    confidence,
    updated_at: new Date().toISOString(),
  });

  if (status === "done" && prev?.status !== "done") {
    await awardXp(XP.topicDone, "topic_done");
  }

  revalidatePath(`/konular/${topicId}`);
  revalidatePath("/konular");
}

const ALLOWED_KINDS = ["video", "link", "note", "test", "book", "file"] as const;

export async function uploadFileResource(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const topicId = String(formData.get("topic_id"));
  const title = String(formData.get("title") || "").trim();
  const description =
    String(formData.get("description") || "").trim() || null;
  const file = formData.get("file");

  if (!title) return { error: "Başlık gerekli" };
  if (!(file instanceof File)) return { error: "Dosya yok" };
  if (file.size === 0) return { error: "Dosya boş" };
  if (file.size > 50 * 1024 * 1024) return { error: "Maksimum 50 MB" };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${topicId}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from("resources")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (upErr) return { error: `Yükleme hatası: ${upErr.message}` };

  const { error: insErr } = await supabase.from("topic_resources").insert({
    user_id: user.id,
    topic_id: topicId,
    kind: "file",
    title,
    description,
    storage_path: path,
    mime_type: file.type || null,
    file_size: file.size,
  });

  if (insErr) {
    await supabase.storage.from("resources").remove([path]);
    return { error: `Kayıt hatası: ${insErr.message}` };
  }

  revalidatePath(`/konular/${topicId}`);
  return { ok: true };
}

export async function importRecommendation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const topicId = String(formData.get("topic_id"));
  const kindRaw = String(formData.get("kind"));
  const kind = (ALLOWED_KINDS as readonly string[]).includes(kindRaw)
    ? kindRaw
    : "link";
  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const description =
    String(formData.get("description") || "").trim() || null;

  if (!title || !url) return;

  // Aynı URL ve topic için varsa tekrar ekleme
  const { data: existing } = await supabase
    .from("topic_resources")
    .select("id")
    .eq("user_id", user.id)
    .eq("topic_id", topicId)
    .eq("url", url)
    .maybeSingle();

  if (existing) {
    revalidatePath(`/konular/${topicId}`);
    return;
  }

  await supabase.from("topic_resources").insert({
    user_id: user.id,
    topic_id: topicId,
    kind,
    title,
    url,
    description,
  });

  revalidatePath(`/konular/${topicId}`);
}

export async function addResource(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const topicId = String(formData.get("topic_id"));
  const kindRaw = String(formData.get("kind"));
  const kind = (ALLOWED_KINDS as readonly string[]).includes(kindRaw)
    ? kindRaw
    : "link";
  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim() || null;
  const description =
    String(formData.get("description") || "").trim() || null;
  const content = String(formData.get("content") || "").trim() || null;

  if (!title) return;
  if ((kind === "video" || kind === "link") && !url) return;
  if ((kind === "note" || kind === "test") && !content) return;

  await supabase.from("topic_resources").insert({
    user_id: user.id,
    topic_id: topicId,
    kind,
    title,
    url,
    description,
    content,
  });

  revalidatePath(`/konular/${topicId}`);
}

export async function deleteResource(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id"));
  const topicId = String(formData.get("topic_id"));

  // Önce storage path varsa onu sil
  const { data: existing } = await supabase
    .from("topic_resources")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (existing?.storage_path) {
    await supabase.storage.from("resources").remove([existing.storage_path]);
  }

  await supabase.from("topic_resources").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath(`/konular/${topicId}`);
}

export async function toggleFavoriteResource(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id"));
  const topicId = String(formData.get("topic_id"));
  const current = formData.get("current") === "true";

  await supabase
    .from("topic_resources")
    .update({ is_favorite: !current })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath(`/konular/${topicId}`);
}
