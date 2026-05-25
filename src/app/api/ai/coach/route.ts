import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, friendlyAIError, type ChatMessage } from "@/lib/ai";
import { consumeAIQuota } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

type ExamRow = { name: string; exam_date: string; totals: Record<string, { net?: number }> | null };
type QLog = { subject: string; correct: number; wrong: number; blank: number; log_date: string };

const netOf = (c: number, w: number) => Math.max(0, c - w / 4);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const quota = await consumeAIQuota();
  if (!quota.allowed) {
    return new Response(
      `Günlük AI kotanı doldurdun (${quota.count}/${quota.limit}). Yarın yenilenecek.`,
      { status: 429 },
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const weekAgoIso = weekAgo.toISOString();

  const [{ data: profile }, { data: streak }, { data: qlogs }, { data: sessions }, { data: exams }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, target_department, target_university, high_school_track, daily_goal_minutes, is_exam_student, grade")
        .eq("id", user.id)
        .single(),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak, last_study_date")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("question_logs")
        .select("subject, correct, wrong, blank, log_date")
        .eq("user_id", user.id)
        .gte("log_date", weekAgoStr),
      supabase
        .from("study_sessions")
        .select("duration_seconds, started_at")
        .eq("user_id", user.id)
        .gte("started_at", weekAgoIso),
      supabase
        .from("exams")
        .select("name, exam_date, totals")
        .eq("user_id", user.id)
        .order("exam_date", { ascending: false })
        .limit(5),
    ]);

  // Soru takibi 7 gün
  const logs = (qlogs ?? []) as QLog[];
  const bySubject = new Map<string, { c: number; w: number; b: number }>();
  const activeDays = new Set<string>();
  for (const l of logs) {
    activeDays.add(l.log_date);
    const cur = bySubject.get(l.subject) ?? { c: 0, w: 0, b: 0 };
    cur.c += l.correct;
    cur.w += l.wrong;
    cur.b += l.blank;
    bySubject.set(l.subject, cur);
  }
  const totalQ = logs.reduce((a, l) => a + l.correct + l.wrong + l.blank, 0);
  const totalNet = logs.reduce((a, l) => a + netOf(l.correct, l.wrong), 0);
  const subjectLines = Array.from(bySubject, ([name, v]) => {
    const tot = v.c + v.w + v.b;
    const acc = v.c + v.w > 0 ? Math.round((v.c / (v.c + v.w)) * 100) : 0;
    return `${name}: ${tot} soru, net ${netOf(v.c, v.w).toFixed(1)}, isabet %${acc}`;
  });

  // Çalışma süresi
  const totalMin = Math.round(
    ((sessions ?? []).reduce((a, s) => a + (s.duration_seconds ?? 0), 0)) / 60,
  );

  // Denemeler (trend)
  const examNets = ((exams ?? []) as ExamRow[]).map((e) => {
    const t = e.totals ?? {};
    const net = Object.values(t).reduce((a, v) => a + (v?.net ?? 0), 0);
    return { name: e.name, date: e.exam_date, net: Math.round(net * 100) / 100 };
  });

  const dataLines = [
    `Ad: ${profile?.display_name ?? "öğrenci"}${profile?.grade ? `, ${profile.grade}. sınıf` : ""}${profile?.high_school_track ? `, ${profile.high_school_track} alanı` : ""}`,
    profile?.target_department
      ? `Hedef: ${profile.target_department}${profile.target_university ? ` (${profile.target_university})` : ""}`
      : "Hedef: belirtilmemiş",
    `Streak: güncel ${streak?.current_streak ?? 0} gün, en uzun ${streak?.longest_streak ?? 0} gün`,
    `Son 7 gün: ${totalQ} soru çözüldü (toplam net ${totalNet.toFixed(1)}), ${activeDays.size}/7 gün aktif, ${totalMin} dk çalışma (günlük hedef ${profile?.daily_goal_minutes ?? 60} dk)`,
    subjectLines.length
      ? `Ders bazlı (7 gün): ${subjectLines.join(" | ")}`
      : "Bu hafta soru takibi kaydı yok.",
    examNets.length
      ? `Son denemeler (net): ${examNets.map((e) => `${e.name} ${e.net}`).join(", ")}`
      : "Kayıtlı deneme yok.",
  ];

  const system: ChatMessage = {
    role: "system",
    content:
      "Sen Türk YKS öğrencisine eşlik eden sıcak, dürüst ve disiplinli bir çalışma koçusun. Verilere dayanarak kısa bir haftalık değerlendirme yaz. Düz akıcı Türkçe; abartı yok, somut ol. En fazla 200 kelime. Şu yapı: (1) bu haftanın kısa değerlendirmesi (iyi giden + dikkat çeken), (2) 'Önümüzdeki hafta' başlığıyla 3 net, uygulanabilir öneri. İsabet oranı düşük ve az çözülen dersleri önceliklendir. Veri azsa nazikçe daha çok kayıt tutmaya teşvik et. Markdown başlık (#) kullanma, kalın için ** kullanabilirsin.",
  };
  const userMsg: ChatMessage = {
    role: "user",
    content: `Öğrenci verisi:\n${dataLines.join("\n")}\n\nBuna göre haftalık koç değerlendirmesini yaz.`,
  };

  try {
    const text = await generateText([system, userMsg]);
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return new Response(friendlyAIError(err), { status: 502 });
  }
}
