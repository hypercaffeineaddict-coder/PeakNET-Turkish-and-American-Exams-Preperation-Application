import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardXp, XP } from "@/lib/gamification";

export const runtime = "nodejs";

type Question = {
  stem: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { resourceId, answers } = (await req.json()) as {
    resourceId: string;
    answers: Record<number, string>;
  };

  const { data: resource } = await supabase
    .from("topic_resources")
    .select("*")
    .eq("id", resourceId)
    .eq("user_id", user.id)
    .single();
  if (!resource || resource.kind !== "test") {
    return new Response("Test not found", { status: 404 });
  }

  const meta = resource.metadata as { questions?: Question[] };
  const questions: Question[] = meta?.questions ?? [];

  let score = 0;
  const wrongQuestions: { idx: number; q: Question; userAnswer: string }[] = [];

  questions.forEach((q, i) => {
    const userAns = answers[i];
    if (!userAns) return;
    if (userAns === q.answer) score++;
    else wrongQuestions.push({ idx: i, q, userAnswer: userAns });
  });

  // Attempt kaydı
  await supabase.from("test_attempts").insert({
    user_id: user.id,
    resource_id: resourceId,
    topic_id: resource.topic_id,
    answers,
    score,
    total: questions.length,
  });

  // Yanlış soruları yanlış defterine otomatik ekle (zaten ekli olanları atla)
  let mistakesAdded = 0;
  if (wrongQuestions.length > 0) {
    // Var olan yanlışları topla (aynı soru metni 2 kez eklenmesin)
    const { data: existing } = await supabase
      .from("mistakes")
      .select("question_text")
      .eq("user_id", user.id)
      .eq("topic_id", resource.topic_id);
    const existingTexts = new Set((existing ?? []).map((e) => e.question_text));

    const rows = wrongQuestions
      .filter((w) => !existingTexts.has(w.q.stem))
      .map((w) => ({
        user_id: user.id,
        topic_id: resource.topic_id,
        question_text: w.q.stem,
        my_answer: `${w.userAnswer}) ${w.q.options[w.userAnswer] ?? ""}`,
        correct_answer: `${w.q.answer}) ${w.q.options[w.q.answer] ?? ""}`,
        reason: w.q.explanation,
        ease: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_at: new Date().toISOString().slice(0, 10),
      }));
    if (rows.length > 0) {
      const { error } = await supabase.from("mistakes").insert(rows);
      if (!error) mistakesAdded = rows.length;
    }
  }

  // XP ödülü: doğru başına + bitirme bonusu
  const xpGained = score * XP.testCorrect + XP.testComplete;
  await awardXp(xpGained, "test_complete");

  return Response.json({
    ok: true,
    score,
    total: questions.length,
    wrongCount: wrongQuestions.length,
    mistakesAdded,
    xpGained,
  });
}
