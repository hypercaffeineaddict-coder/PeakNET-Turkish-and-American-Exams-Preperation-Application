"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp, XP } from "@/lib/gamification";
import { localDate } from "@/lib/dates";

export async function createMistake(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const topicId = String(formData.get("topic_id") || "") || null;
  const questionText =
    String(formData.get("question_text") || "").trim() || null;
  const myAnswer = String(formData.get("my_answer") || "").trim() || null;
  const correctAnswer =
    String(formData.get("correct_answer") || "").trim() || null;
  const reason = String(formData.get("reason") || "").trim() || null;

  if (!questionText) {
    redirect("/yanlislar?error=Soru+metni+gerekli");
  }

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
    next_review_at: localDate(),
  });
  if (error) {
    redirect(`/yanlislar?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/yanlislar");
  redirect("/yanlislar");
}

// SM-2 algoritması: quality 0-5 (0=bilmiyorum, 5=mükemmel)
export async function reviewMistake(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id"));
  const quality = Math.max(0, Math.min(5, Number(formData.get("quality"))));

  const { data: m } = await supabase
    .from("mistakes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!m) return;

  let ease = m.ease ?? 2.5;
  let interval = m.interval_days ?? 1;
  let reps = m.repetitions ?? 0;

  // SM-2
  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  }
  ease = Math.max(
    1.3,
    ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  const next = new Date();
  next.setDate(next.getDate() + interval);

  await supabase
    .from("mistakes")
    .update({
      ease,
      interval_days: interval,
      repetitions: reps,
      next_review_at: localDate(next),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  await awardXp(XP.mistakeReview, "mistake_review");

  revalidatePath("/yanlislar");
}

export async function deleteMistake(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const id = String(formData.get("id"));
  await supabase.from("mistakes").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/yanlislar");
}
