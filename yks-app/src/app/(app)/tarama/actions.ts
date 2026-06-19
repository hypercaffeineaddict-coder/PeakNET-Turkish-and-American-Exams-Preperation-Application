"use server";

import { createClient } from "@/lib/supabase/server";
import { awardXp, XP } from "@/lib/gamification";
import { localDate } from "@/lib/dates";

type WrongItem = {
  stem: string;
  topic: string;
  myAnswer: string;
  correctAnswer: string;
  explanation: string;
};

export async function saveTaramaWrongs(
  subjectName: string,
  wrongs: WrongItem[],
  correctCount = 0,
): Promise<{ added: number; xpGained: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { added: 0, xpGained: 0, error: "Oturum yok" };

  // XP: doğru başına + bitirme bonusu (yanlış olmasa bile ver)
  const xpGained = correctCount * XP.testCorrect + XP.testComplete;
  await awardXp(xpGained, "tarama_complete");

  if (wrongs.length === 0) return { added: 0, xpGained };

  const rows = wrongs.map((w) => ({
    user_id: user.id,
    topic_id: null, // tarama soruları AI üretimi, topic_id eşlemesi yok
    question_text: `[${subjectName} · ${w.topic}] ${w.stem}`,
    my_answer: w.myAnswer,
    correct_answer: w.correctAnswer,
    reason: w.explanation,
    ease: 2.5,
    interval_days: 1,
    repetitions: 0,
    next_review_at: localDate(),
  }));

  const { error } = await supabase.from("mistakes").insert(rows);
  if (error) return { added: 0, xpGained, error: error.message };
  return { added: rows.length, xpGained };
}
