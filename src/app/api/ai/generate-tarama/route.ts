import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamChat } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

type Question = {
  stem: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  topic: string; // konu adı
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { subjectId, count = 10 } = (await req.json()) as {
    subjectId: string;
    count?: number;
  };

  const { data: subject } = await supabase
    .from("subjects")
    .select("name, exam_type, topics(name, priority)")
    .eq("id", subjectId)
    .single();
  if (!subject) return new Response("Ders bulunamadı", { status: 404 });

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  const topicNames = ((subject.topics ?? []) as { name: string }[])
    .map((t) => t.name)
    .join(", ");
  const n = Math.max(5, Math.min(20, count));

  const system = `Sen ${subject.exam_type} sınavına hazırlanan öğrenciler için ÖSYM tarzı tarama (tanı) testi hazırlayan bir öğretmensin. Tarama testi: bir dersin farklı konularına yayılmış, öğrencinin hangi konularda zayıf olduğunu ölçen test. Sadece istenen JSON'u döndür.`;

  const userPrompt = `${subject.name} (${subject.exam_type}) dersinden ${n} soruluk bir TARAMA TESTİ hazırla.

Sorular şu konulara DAĞILSIN (her sorudan farklı konu tercih et): ${topicNames}.

Her soru:
- ÖSYM zorluk seviyesinde, 5 şıklı (A-E)
- Net bir doğru cevabı olan
- "topic" alanında o sorunun hangi konuya ait olduğu (yukarıdaki konu adlarından birebir biri)
- "explanation" 1-2 cümle çözüm

SADECE şu JSON'u dön (markdown yok):
{"questions":[{"stem":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":"..."},"answer":"C","explanation":"...","topic":"konu adı"}]}`;

  let acc = "";
  try {
    const stream = await streamChat([
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
    }
  } catch (err) {
    return new Response(`AI hatası: ${String(err)}`, { status: 502 });
  }

  const match = acc.match(/\{[\s\S]*"questions"[\s\S]*\}/);
  if (!match) {
    return new Response(`Format hatası.\n${acc.slice(0, 400)}`, { status: 500 });
  }
  let parsed: { questions: Question[] };
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return new Response("JSON parse hatası", { status: 500 });
  }
  if (!parsed.questions?.length) {
    return new Response("Soru üretilemedi", { status: 500 });
  }

  return Response.json({
    subjectName: subject.name,
    examType: subject.exam_type,
    questions: parsed.questions,
  });
}
