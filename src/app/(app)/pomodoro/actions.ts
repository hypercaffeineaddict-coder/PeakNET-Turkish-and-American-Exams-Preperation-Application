"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function recordSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const topicId = String(formData.get("topic_id") || "") || null;
  const subjectId = String(formData.get("subject_id") || "") || null;
  const duration = Math.max(
    0,
    Math.min(7200, Number(formData.get("duration_seconds")) || 0),
  );
  const pomodoros = Math.max(0, Number(formData.get("pomodoros")) || 0);
  const notes = String(formData.get("notes") || "").trim() || null;

  if (duration < 60) return { error: "Çok kısa seans" };

  const { error: insErr } = await supabase.from("study_sessions").insert({
    user_id: user.id,
    topic_id: topicId,
    subject_id: subjectId,
    duration_seconds: duration,
    pomodoros,
    notes,
  });
  if (insErr) return { error: insErr.message };

  // streak'i güncelle (idempotent — aynı gün tekrar tetiklense de fark etmez)
  await supabase.rpc("touch_streak");

  revalidatePath("/pomodoro");
  revalidatePath("/dashboard");
  return { ok: true };
}
