"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// SM-2 aralıklı tekrar. quality: 2=Tekrar, 3=Zor, 4=İyi, 5=Kolay
export async function reviewCard(id: string, quality: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const { data: card } = await supabase
    .from("flashcards")
    .select("ease, interval_days, repetitions")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!card) return { error: "Kart bulunamadı" };

  const q = Math.max(0, Math.min(5, quality));
  let ease = card.ease ?? 2.5;
  let interval = card.interval_days ?? 0;
  let reps = card.repetitions ?? 0;

  if (q < 3) {
    // Tekrar: bugün tekrar görünsün
    reps = 0;
    interval = 0;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }

  const next = new Date();
  next.setDate(next.getDate() + interval);

  const { error } = await supabase
    .from("flashcards")
    .update({
      ease,
      interval_days: interval,
      repetitions: reps,
      next_review_at: next.toISOString().slice(0, 10),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  // Not: revalidatePath cagrilmiyor — tekrar kuyrugunu client oturum boyunca
  // yonetir; DB guncellendi, sonraki ziyarette taze veri gelir.
  return { ok: true };
}

export async function deleteCard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const id = String(formData.get("id"));
  await supabase.from("flashcards").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/kartlar");
}
