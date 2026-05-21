import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamChat, type Attachment } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const ACCEPTED_MIMES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("image");
  const topicId = String(formData.get("topic_id") || "") || null;
  const subjectHint = String(formData.get("subject_hint") || "") || null;
  const userNote = String(formData.get("user_note") || "").trim();

  if (!(file instanceof File)) {
    return new Response("Görsel gerekli", { status: 400 });
  }
  if (file.size === 0) {
    return new Response("Boş dosya", { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return new Response(
      `Görsel çok büyük (>${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB)`,
      { status: 400 },
    );
  }
  if (!ACCEPTED_MIMES.includes(file.type)) {
    return new Response(
      `Desteklenmeyen tür: ${file.type}. PNG/JPG/WebP gönder.`,
      { status: 400 },
    );
  }

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  // Topic bağlamı (opsiyonel)
  let topicContext = "";
  if (topicId) {
    const { data: topic } = await supabase
      .from("topics")
      .select("name, subjects(name)")
      .eq("id", topicId)
      .single();
    if (topic) {
      const subj = (topic as { subjects?: { name?: string } }).subjects?.name;
      topicContext = ` Öğrenci bu sorunun ${topic.name}${subj ? ` (${subj})` : ""} konusuyla ilgili olduğunu söylüyor.`;
    }
  } else if (subjectHint) {
    topicContext = ` Öğrenci ipucu olarak şu dersi belirtti: ${subjectHint}.`;
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString("base64");
  const attachment: Attachment = {
    mimeType: file.type,
    base64,
    filename: file.name,
  };

  const system = `Sen YKS hazırlanan Türk lise öğrencisine soru çözen kıdemli bir öğretmensin.${topicContext}

İş akışın:
1. Önce görseldeki soruyu KENDİ KELİMELERİNLE özetle (1-2 cümle). Görselde yazılı her şeyi okudun mu, formüller doğru mu netleştir.
2. Sonra "Çözüm" başlığı altında ADIM ADIM çöz. Her adımı kısa bir paragraf veya numaralı satır olarak yaz.
3. Hesaplamalarda LaTeX değil düz semboller kullan (x², √, ≤, π).
4. Çıkmış soru kalıplarına benziyorsa söyle ("Bu klasik bir 2. dereceden denklem sorusu").
5. Sonda "Cevap: ..." satırıyla doğru şıkkı/değeri belirt.
6. En son tek satır "İpucu:" ile gelecekte benzer soruda nereye dikkat etmesi gerektiğini yaz.

Eğer görselde okuyamadığın bir şey varsa veya soru anlaşılmıyorsa, hangi kısmı göremediğini söyle ve öğrenciden yardım iste.`;

  const userMsg = userNote
    ? `Bu soruyu çözer misin? Takıldığım yer: ${userNote}`
    : "Bu YKS sorusunu adım adım çözer misin?";

  try {
    const stream = await streamChat(
      [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
      [attachment],
    );
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const msg = String(err);
    let userMsgErr = `AI hatası: ${msg}.`;
    if (msg.includes("503") || msg.toLowerCase().includes("overloaded")) {
      userMsgErr = "AI modeli şu an çok yoğun (503). Birkaç saniye bekleyip tekrar dene.";
    } else if (msg.includes("429")) {
      userMsgErr = "İstek limitin doldu (429). Birkaç dakika bekle.";
    }
    return new Response(userMsgErr, { status: 502 });
  }
}
