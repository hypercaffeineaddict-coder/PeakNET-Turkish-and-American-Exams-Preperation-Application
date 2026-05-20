"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveSolutionAsMistake(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const topicId = String(formData.get("topic_id") || "") || null;
  const questionText = String(formData.get("question_text") || "").trim();
  const myAnswer = String(formData.get("my_answer") || "").trim() || null;
  const correctAnswer =
    String(formData.get("correct_answer") || "").trim() || null;
  const reason = String(formData.get("reason") || "").trim() || null;

  if (!questionText) return { error: "Soru metni gerekli" };

  const { error } = await supabase.from("mistakes").insert({
    user_id: user.id,
    topic_id: topicId,
    question_text: questionText,
    my_answer: myAnswer,
    correct_answer: correctAnswer,
    reason,
    ease: 2.5,
    interval_days: 1,
    repetitions: 0,
    next_review_at: new Date().toISOString().slice(0, 10),
  });
  if (error) return { error: error.message };
  return { ok: true };
}
