import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJson, friendlyAIError, type ChatMessage } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";
import { normalizeBoard } from "@/lib/board";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `Sen bir YKS matematik/geometri öğretmenisin ve KARE bir çizim tahtasına şekil çiziyorsun (en-boy 1:1).
Yalnızca şu JSON yapısında bir nesne döndür (başka metin yok, kod bloğu da yok):

{
  "explanation": "1-3 cümle kısa Türkçe açıklama",
  "board": {
    "title": "kısa başlık (ops.)",
    "xRange": [xmin, xmax],
    "yRange": [ymin, ymax],
    "showAxes": true,
    "showGrid": true,
    "shapes": [ ...şekiller... ]
  }
}

ÇOK ÖNEMLİ — Aralık seçimi:
- Canvas KARE'dir. **Geometri** için (çember, üçgen, çokgen) x ve y aralığını EŞİT genişlikte ve şekli ortalayacak şekilde seç; oransal bozulma olmasın.
  Örn. birim çember → xRange:[-1.5, 1.5], yRange:[-1.5, 1.5].
  Örn. 3-4-5 üçgen kenarları (0,0)-(4,0)-(0,3) → xRange:[-1, 5], yRange:[-1, 5].
- **Fonksiyon grafiği** için y aralığını fonksiyonun gerçek davranışına göre seç (asimptotsa x aralığı dar tut, y'yi makul sınırla).

Şekil tipleri:
- {"type":"function","points":[[x,y],...],"color":"#hex","label":"f(x)"}
   • Fonksiyon grafiği için x aralığını tarayan en AZ 60 nokta üret, y'yi sen hesapla. Düzgün aralıklı x.
   • Asimptotlu fonksiyonlarda (1/x, tan, vb.) y'yi [ymin, ymax] içine kırp veya kopma noktası civarında atla (büyük sıçramaları SEN engelle).
- {"type":"polyline","points":[[x,y],...],"closed":true,"fill":true,"color":"#hex","label":"ABC"}  // çokgen/üçgen (closed:true ile kapatılır)
- {"type":"segment","from":[x,y],"to":[x,y],"dashed":false,"color":"#hex","label":"d"}
- {"type":"circle","center":[x,y],"r":3,"fill":false,"color":"#hex","label":"O"}
- {"type":"point","at":[x,y],"color":"#hex","label":"A(2,3)"}
- {"type":"text","at":[x,y],"text":"açıklama","color":"#hex"}

Stil kuralları:
- 1-3 farklı renk yeter; gerekmedikçe renk verme (tema rengi kullanılır).
- Etiketler KISA olsun (1-4 kelime). Türkçe.
- Önemli noktaları (kesişim, tepe, başlangıç) "point" olarak ekle.

SADECE geçerli JSON döndür.`;

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
