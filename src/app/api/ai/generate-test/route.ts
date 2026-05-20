import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamChat } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 120;

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

  const system = `Sen MF AYT'ye hazırlanan Türk lise öğrencisi için ÖSYM tarzı çoktan seçmeli soru üreten bir öğretmensin. Sadece istenen JSON formatını döndür, başka hiçbir şey yazma.`;

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
    return new Response(`Ollama hatası: ${String(err)}`, { status: 502 });
  }

  // JSON parse
  const match = acc.match(/\{[\s\S]*"questions"[\s\S]*\}/);
  if (!match) {
    return new Response(
      `Format hatası — AI çıktısı parse edilemedi.\n\n${acc.slice(0, 500)}`,
      { status: 500 },
    );
  }
  let parsed: { questions: Question[] };
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return new Response("JSON parse hatası", { status: 500 });
  }

  if (!parsed.questions || parsed.questions.length === 0) {
    return new Response("Soru üretilemedi", { status: 500 });
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

  return Response.json({ ok: true, resourceId: inserted.id, count: parsed.questions.length });
}
