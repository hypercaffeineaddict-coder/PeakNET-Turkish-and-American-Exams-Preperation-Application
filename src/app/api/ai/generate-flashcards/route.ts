import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJson, friendlyAIError } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

type Card = { front: string; back: string };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { topicId, count = 8 } = (await req.json()) as {
    topicId: string;
    count?: number;
  };

  const { data: topic } = await supabase
    .from("topics")
    .select("name, subjects(name)")
    .eq("id", topicId)
    .single();
  if (!topic) return new Response("Konu bulunamadı", { status: 404 });

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  const subjectName =
    (topic as { subjects?: { name?: string } }).subjects?.name ?? "";
  const n = Math.max(4, Math.min(15, count));

  const system = `Sen YKS'ye hazırlanan öğrenci için aralıklı tekrar (flashcard) kartları hazırlayan bir öğretmensin. Sadece istenen JSON'u döndür.`;

  const userPrompt = `${subjectName} - ${topic.name} konusundan ${n} adet tekrar kartı (flashcard) üret.

Her kart:
- "front": kısa bir soru, kavram, tanım istemi veya formül adı (1 satır)
- "back": net, öz cevap/açıklama (1-3 cümle veya formül)
- Ezberlenmesi en kritik bilgiler seçilsin (tanımlar, formüller, ayırt edici noktalar, sık karıştırılanlar)

SADECE şu JSON'u dön (markdown yok):
{"cards":[{"front":"...","back":"..."}]}`;

  let acc = "";
  try {
    acc = await generateJson([
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ]);
  } catch (err) {
    return new Response(friendlyAIError(err), { status: 502 });
  }

  const cards = parseCards(acc);
  if (!cards || cards.length === 0) {
    return new Response(
      `Kart üretilemedi (boş/format). AI çıktısı: ${acc.slice(0, 200) || "(boş)"}`,
      { status: 500 },
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const rows = cards.map((c) => ({
    user_id: user.id,
    topic_id: topicId,
    subject_name: subjectName,
    topic_name: topic.name,
    front: c.front,
    back: c.back,
    ease: 2.5,
    interval_days: 0,
    repetitions: 0,
    next_review_at: today,
  }));

  const { error } = await supabase.from("flashcards").insert(rows);
  if (error) return new Response(`Kayıt hatası: ${error.message}`, { status: 500 });

  return Response.json({ ok: true, added: rows.length });
}

function parseCards(raw: string): Card[] | null {
  const tryParse = (s: string) => {
    try {
      const obj = JSON.parse(s);
      if (obj && Array.isArray(obj.cards) && obj.cards.length > 0) {
        return obj.cards.filter(
          (c: Card) => c && typeof c.front === "string" && typeof c.back === "string",
        ) as Card[];
      }
    } catch {}
    return null;
  };
  const trimmed = raw.trim();
  return (
    tryParse(trimmed) ??
    (() => {
      const m = trimmed.match(/\{[\s\S]*"cards"[\s\S]*\}/);
      return m ? tryParse(m[0]) : null;
    })()
  );
}
