import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, friendlyAIError, type ChatMessage } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const baseSystem = (length: "kisa" | "detayli") =>
  `Sen Türk YKS öğrencisi için çalışma notu hazırlayan deneyimli bir öğretmensin.
Net, sıkı, sınava odaklı bir konu notu yaz. Markdown kullan:
- ## ile bölüm başlıkları, ### ile alt başlık, - ile madde işaretleri
- **kalın** ile tanım/formül/anahtar terim
- Sayılarda ve sembollerde sade gösterim (LaTeX değil): x², √, ≤, π, →
- Şu yapıyı izle: ## Tanım/Giriş · ## Anahtar formüller · ## Kavramlar · ## Çözüm adımları/Tipik sorular · ## Sık yapılan hatalar · ## Hızlı hatırlatma
- Gereksiz dolgu yok; her madde sınavda işe yarayacak şekilde.
- ${length === "detayli"
    ? "DETAYLI: 1100-1700 kelime, tüm alt başlıklar dolu, örnek çözüm adımları dahil."
    : "KISA özet: 400-700 kelime, kilit noktalar; her bölümde 3-6 madde yeter."}`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    topic?: string;
    length?: string;
  } | null;
  const topic = (body?.topic ?? "").trim();
  if (!topic) return new Response("Konu boş", { status: 400 });
  const length: "kisa" | "detayli" = body?.length === "detayli" ? "detayli" : "kisa";

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  const messages: ChatMessage[] = [
    { role: "system", content: baseSystem(length) },
    {
      role: "user",
      content: `Konu/istek: ${topic.slice(0, 300)}\n\nBu konunun notunu yukarıdaki yapıda hazırla.`,
    },
  ];

  try {
    const text = await generateText(messages);
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return new Response(friendlyAIError(err), { status: 502 });
  }
}
