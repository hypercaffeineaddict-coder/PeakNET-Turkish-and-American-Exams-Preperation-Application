import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJson, friendlyAIError } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";
import { localDate } from "@/lib/dates";

export const runtime = "nodejs";
export const maxDuration = 60;

type Card = { front: string; back: string };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { lang, prompt = "", count = 10 } = (await req.json()) as {
    lang: string;
    prompt?: string;
    count?: number;
  };

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 }
    );
  }

  const n = Math.max(5, Math.min(20, count));

  const system = `Sen ${lang} dili öğretimi uzmanı bir yapay zekasın. Kullanıcıya kelime çalışması (flashcard) için kartlar üreteceksin.
SADECE JSON döndürmelisin. Başka hiçbir şey yazma.`;

  const userPrompt = `Bana ${lang} dili öğrenimi için ${n} adet kelime/ifade içeren flashcard üret.
İsteğim: ${prompt || "Günlük hayatta sık kullanılan seviyeye uygun karışık kelimeler"}

Her kart için:
- "front": Öğrenilecek kelime veya ifade (${lang} dilinde)
- "back": Türkçe çevirisi ve kelimeyi içeren kısa bir örnek cümle (${lang} dilinde, ardından Türkçe çevirisi)

SADECE şu JSON'u dön (markdown veya fazladan açıklama yok):
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
      `Kart üretilemedi. Format hatası. AI çıktısı: ${acc.slice(0, 200)}`,
      { status: 500 }
    );
  }

  const today = localDate();
  const rows = cards.map((c) => ({
    user_id: user.id,
    subject_name: lang, // Diller için subject_name olarak dili tutuyoruz
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
