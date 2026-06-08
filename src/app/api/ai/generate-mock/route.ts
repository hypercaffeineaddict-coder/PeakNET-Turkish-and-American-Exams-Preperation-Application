import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJson, friendlyAIError } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";
import { examSubjects } from "@/data/exam-subjects";
import { localeDirective } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Question = {
  stem: string;
  options: Record<string, string>;
  answer: string;
  subjectId: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { examType = "TYT" } = (await req.json()) as { examType?: string };

  const { data: profile } = await supabase
    .from("profiles")
    .select("high_school_track")
    .eq("id", user.id)
    .single();
  const track = profile?.high_school_track ?? null;

  const subs = examSubjects(examType, track);
  if (subs.length === 0) {
    return new Response("Bu sınav türü için ders yok.", { status: 400 });
  }

  // Mini-deneme: her dersten az soru (hız + token sınırı)
  const plan = subs.map((s) => ({
    id: s.id,
    name: s.name,
    total: s.total,
    count: clamp(Math.round(s.total / 8), 2, 8),
  }));

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  const subjectLines = plan
    .map((p) => `- ${p.name} (subjectId: "${p.id}"): ${p.count} soru`)
    .join("\n");

  const langDir = localeDirective(await getLocaleFromCookies());
  const system = `${langDir}Sen YKS ${examType} için ÖSYM tarzı deneme sınavı hazırlayan bir öğretmensin. Sadece istenen JSON'u döndür.`;

  const userPrompt = `${examType} denemesi için aşağıdaki derslerden belirtilen sayıda ÖSYM tarzı 5 şıklı (A-E) soru üret:

${subjectLines}

Her soru:
- Net bir doğru cevabı olan, ÖSYM zorluğunda
- "subjectId" alanında ait olduğu dersin yukarıdaki kodu
- "answer" doğru şık harfi

SADECE şu JSON'u dön (markdown yok):
{"questions":[{"stem":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":"..."},"answer":"C","subjectId":"matematik"}]}`;

  let acc = "";
  try {
    acc = await generateJson([
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);
  } catch (err) {
    return new Response(friendlyAIError(err), { status: 502 });
  }

  const questions = parseQuestions(acc);
  if (!questions || questions.length === 0) {
    return new Response(
      `Deneme üretilemedi (boş/format). AI: ${acc.slice(0, 200) || "(boş)"}`,
      { status: 500 },
    );
  }

  return Response.json({
    examType,
    subjects: plan.map((p) => ({ id: p.id, name: p.name, total: p.total })),
    questions,
  });
}

function parseQuestions(raw: string): Question[] | null {
  const tryParse = (s: string) => {
    try {
      const obj = JSON.parse(s);
      if (obj && Array.isArray(obj.questions) && obj.questions.length > 0) {
        return obj.questions.filter(
          (q: Question) =>
            q && q.stem && q.options && q.answer && q.subjectId,
        ) as Question[];
      }
    } catch {}
    return null;
  };
  const trimmed = raw.trim();
  return (
    tryParse(trimmed) ??
    (() => {
      const m = trimmed.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      return m ? tryParse(m[0]) : null;
    })()
  );
}
