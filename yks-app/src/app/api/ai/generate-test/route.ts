import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJson, friendlyAIError } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";
import { localeDirective } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const { topicId, count = 5 } = (await req.json()) as {
    topicId: string;
    count?: number;
  };

  const { data: topic } = await supabase
    .from("topics")
    .select("*, subjects(name)")
    .eq("id", topicId)
    .single();
  if (!topic) return new Response("Topic not found", { status: 404 });

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  const langDir = localeDirective(await getLocaleFromCookies());
  const system = `${langDir}Sen YKS'ye hazırlanan Türk lise öğrencisi için ÖSYM tarzı çoktan seçmeli soru üreten bir öğretmensin. Sadece istenen JSON formatını döndür, başka hiçbir şey yazma.`;

  const userPrompt = `${topic.subjects?.name} - ${topic.name} konusundan ${Math.max(3, Math.min(10, count))} adet ÖSYM tarzı 5 şıklı çoktan seçmeli soru üret.

Her sorunun:
- Açık, kesin doğrusu olan, ÖSYM zorluk seviyesinde olması
- 5 şık (A, B, C, D, E)
- Doğru cevap belirtilmeli
- Çözüm/açıklama 2-3 cümle (öğrenci nerede yanlış yapabilirdi, doğru yaklaşım nedir)

SADECE şu JSON'u dön (markdown veya ekstra metin yok):

{"questions":[{"stem":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":"..."},"answer":"C","explanation":"..."}]}`;

  let acc = "";
  try {
    acc = await generateJson([
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);
  } catch (err) {
    return new Response(friendlyAIError(err), { status: 502 });
  }

  const parsed = parseQuestions(acc);
  if (!parsed) {
    return new Response(
      `Soru üretilemedi (boş/format). AI çıktısı: ${acc.slice(0, 300) || "(boş)"}`,
      { status: 500 },
    );
  }

  // topic_resources'a kaydet
  const title = `AI Test · ${topic.name} (${parsed.questions.length} soru)`;
  const { data: inserted, error } = await supabase
    .from("topic_resources")
    .insert({
      user_id: user.id,
      topic_id: topicId,
      kind: "test",
      title,
      content: `${parsed.questions.length} soruluk AI üretimi test`,
      metadata: { questions: parsed.questions, generated_at: new Date().toISOString() },
    })
    .select("id")
    .single();

  if (error) return new Response(`Kayıt hatası: ${error.message}`, { status: 500 });

  return Response.json({
    ok: true,
    resourceId: inserted.id,
    count: parsed.questions.length,
    questions: parsed.questions,
  });
}

function parseQuestions(raw: string): { questions: Question[] } | null {
  const tryParse = (s: string) => {
    try {
      const obj = JSON.parse(s);
      if (obj && Array.isArray(obj.questions) && obj.questions.length > 0) {
        return obj as { questions: Question[] };
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
