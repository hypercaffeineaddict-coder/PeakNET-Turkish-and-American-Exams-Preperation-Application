import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJson, friendlyAIError, type ChatMessage } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";
import { normalizeBoard } from "@/lib/board";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `Sen bir YKS matematik/geometri öğretmenisin ve bir çizim tahtasına şekil çiziyorsun.
Kullanıcının isteğini SADECE şu JSON yapısında bir nesne olarak döndür (başka metin yok):

{
  "explanation": "1-3 cümlelik kısa Türkçe açıklama",
  "board": {
    "title": "kısa başlık (ops.)",
    "xRange": [xmin, xmax],
    "yRange": [ymin, ymax],
    "showAxes": true,
    "showGrid": true,
    "shapes": [ ...şekiller... ]
  }
}

Şekil tipleri:
- {"type":"function","points":[[x,y],...],"color":"#hex","label":"f(x)"}  // grafik için x aralığını tarayan EN AZ 40 nokta üret, y'leri SEN hesapla
- {"type":"polyline","points":[[x,y],...],"closed":true,"fill":true,"color":"#hex","label":"ABC"}  // çokgen/üçgen
- {"type":"segment","from":[x,y],"to":[x,y],"dashed":false,"color":"#hex","label":"d"}
- {"type":"circle","center":[x,y],"r":3,"fill":false,"color":"#hex","label":"O"}
- {"type":"point","at":[x,y],"color":"#hex","label":"A(2,3)"}
- {"type":"text","at":[x,y],"text":"açıklama","color":"#hex"}

Kurallar:
- xRange/yRange'i şekle göre dengeli seç; geometri için x ve y aralığını yakın tut (kare görünüm).
- Fonksiyon grafiğinde noktaları gerçek değerlerle, düzgün aralıklı üret (asimptotlarda makul kal).
- Etiketleri kısa Türkçe yaz. Renk vermezsen tema rengi kullanılır.
- Sadece geçerli JSON döndür.`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = (body?.prompt ?? "").trim();
  if (!prompt) return new Response("İstek boş", { status: 400 });

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: prompt.slice(0, 500) },
  ];

  try {
    const raw = await generateJson(messages);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // bazen kod bloğu içinde gelebilir
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }
    const obj = parsed as { explanation?: string; board?: unknown } | null;
    const board = normalizeBoard(obj?.board);
    if (!board) {
      return new Response("Bunu çizemedim, isteğini biraz daha netleştir.", { status: 422 });
    }
    return Response.json({
      explanation: typeof obj?.explanation === "string" ? obj.explanation.slice(0, 400) : "",
      board,
    });
  } catch (err) {
    return new Response(friendlyAIError(err), { status: 502 });
  }
}
