"use server";

import { createClient } from "@/lib/supabase/server";

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
): Promise<{ added: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { added: 0, error: "Oturum yok" };
  if (wrongs.length === 0) return { added: 0 };

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
    next_review_at: new Date().toISOString().slice(0, 10),
  }));

  const { error } = await supabase.from("mistakes").insert(rows);
  if (error) return { added: 0, error: error.message };
  return { added: rows.length };
}
