"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { awardXp, XP } from "@/lib/gamification";

export type Grade = "hard" | "good" | "easy";

export async function processFlashcardReview(id: string, grade: Grade) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get current flashcard stats
  const { data: card, error: fetchErr } = await supabase
    .from("flashcards")
    .select("ease, interval_days, repetitions")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !card) return { error: "Card not found" };

  let ease = card.ease;
  let interval = card.interval_days;
  let reps = card.repetitions;

  // SM-2 Logic Implementation
  if (grade === "hard") {
    // Forgot or hard
    reps = 0;
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else if (grade === "good") {
    reps += 1;
    if (reps === 1) {
      interval = 1;
    } else if (reps === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
  } else if (grade === "easy") {
    reps += 1;
    ease += 0.15;
    if (reps === 1) {
      interval = 4;
    } else if (reps === 2) {
      interval = 10;
    } else {
      interval = Math.round(interval * ease * 1.3);
    }
  }

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  const { error: updateErr } = await supabase
    .from("flashcards")
    .update({
      ease,
      interval_days: interval,
      repetitions: reps,
      next_review_at: nextReviewAt.toISOString().split('T')[0],
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateErr) return { error: updateErr.message };

  // Award XP for successful review
  await awardXp(XP.flashcardReview, "flashcard_review");

  return { ok: true };
}

export async function addFlashcard(front: string, back: string, lang: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("flashcards").insert({
    user_id: user.id,
    front,
    back,
    subject_name: lang, // Store language as subject
  });

  if (error) return { error: error.message };
  revalidatePath(`/diller/${lang}/kartlar`);
  return { ok: true };
}
