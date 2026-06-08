"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/gamification";
import { localDate } from "@/lib/dates";

export async function addQuestionLog(
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const subject = String(formData.get("subject") || "").trim();
  if (!subject) return { error: "Ders seç" };

  const correct = Math.max(0, Number(formData.get("correct")) || 0);
  const wrong = Math.max(0, Number(formData.get("wrong")) || 0);
  const blank = Math.max(0, Number(formData.get("blank")) || 0);
  if (correct + wrong + blank === 0) return { error: "En az bir soru gir" };

  const dateRaw = String(formData.get("log_date") || "");
  const log_date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : localDate();

  const topicId = String(formData.get("topic_id") || "").trim() || null;

  const { error } = await supabase.from("question_logs").insert({
    user_id: user.id,
    subject,
    topic_id: topicId,
    correct,
    wrong,
    blank,
    log_date,
  });
  if (error) {
    const missing = /does not exist|could not find|schema cache/i.test(
      error.message,
    );
    return {
      error: missing
        ? "Soru takibi tablosu yok. 0016 migration'ını bir kez çalıştır."
        : error.message,
    };
  }

  // Soru çözmek = çalışmak → streak'e say + küçük XP.
  try {
    await supabase.rpc("touch_streak");
  } catch {}
  await awardXp(5, "question_log");

  revalidatePath("/soru-takibi");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteQuestionLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id"));
  await supabase
    .from("question_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/soru-takibi");
}
