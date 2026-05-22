import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ClipboardList,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { computeMastery } from "@/lib/mastery";
import { YKS_DATES, daysUntil } from "@/data/exam-date";

export const metadata = { title: "Program · PeakNET" };

type TopicRow = {
  id: string;
  name: string;
  priority: string;
  grade: number | null;
  display_order: number;
};
type SubjectRow = {
  id: string;
  name: string;
  color: string | null;
  exam_type: string;
  tracks: string[] | null;
  topics: TopicRow[];
};
type PlanTopic = { id: string; name: string; subjectName: string; color: string; score: number };

const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const HORIZON = 14; // önümüzdeki 14 gün gösterilir

export default async function ProgramPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: subjectsRaw },
    { data: progressRows },
    { data: mistakeRows },
    { data: sessionRows },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("subjects")
      .select("*, topics(*)")
      .in("exam_type", ["TYT", "AYT"])
      .order("display_order"),
    supabase.from("topic_progress").select("topic_id, status, confidence").eq("user_id", user.id),
    supabase
      .from("mistakes")
      .select("topic_id, repetitions")
      .eq("user_id", user.id)
      .not("topic_id", "is", null),
    supabase
      .from("study_sessions")
      .select("topic_id, duration_seconds")
      .eq("user_id", user.id)
      .not("topic_id", "is", null),
    supabase.from("profiles").select("high_school_track, daily_goal_minutes").eq("id", user.id).single(),
  ]);

  const track = profile?.high_school_track ?? null;
  const goal = profile?.daily_goal_minutes ?? 60;

  const subjects = ((subjectsRaw ?? []) as SubjectRow[]).filter(
    (s) => s.exam_type !== "AYT" || !track || !s.tracks?.length || s.tracks.includes(track),
  );

  const progressMap = new Map((progressRows ?? []).map((p) => [p.topic_id, p]));
  const mistakeMap = new Map<string, number>();
  for (const m of mistakeRows ?? []) {
    if (!m.topic_id || (m.repetitions ?? 0) >= 2) continue;
    mistakeMap.set(m.topic_id, (mistakeMap.get(m.topic_id) ?? 0) + 1);
  }
  const studyMap = new Map<string, number>();
  for (const s of sessionRows ?? []) {
    if (!s.topic_id) continue;
    studyMap.set(s.topic_id, (studyMap.get(s.topic_id) ?? 0) + (s.duration_seconds ?? 0) / 60);
  }

  // Çalışılacak havuz: ustalık düşük (<=2), öncelik + düşük skora göre sırala
  const pool: PlanTopic[] = [];
  let totalTopics = 0;
  let masteredTopics = 0;
  for (const s of subjects) {
    for (const t of s.topics ?? []) {
      totalTopics++;
      const p = progressMap.get(t.id);
      const m = computeMastery({
        status: p?.status,
        confidence: p?.confidence,
        studyMinutes: studyMap.get(t.id),
        openMistakes: mistakeMap.get(t.id),
      });
      if (m.level >= 4) masteredTopics++;
      if (m.level <= 2) {
        pool.push({
          id: t.id,
          name: t.name,
          subjectName: s.name,
          color: s.color ?? "#888",
          score: m.score,
        });
      }
    }
  }
  pool.sort((a, b) => a.score - b.score);
  // önceliği de hesaba kat: yüksek öncelikli + düşük skor öne
  const prRank = new Map<string, number>();
  for (const s of subjects)
    for (const t of s.topics ?? [])
      prRank.set(t.id, t.priority === "high" ? 0 : t.priority === "medium" ? 1 : 2);
  pool.sort((a, b) => {
    const pa = prRank.get(a.id) ?? 1;
    const pb = prRank.get(b.id) ?? 1;
    if (pa !== pb) return pa - pb;
    return a.score - b.score;
  });

  const daysToExam = Math.max(0, daysUntil(YKS_DATES.AYT));
  const tpd = Math.max(1, Math.round(goal / 45)); // günde ~konu sayısı (45 dk/konu)
  const remaining = pool.length;

  // Tempoyu değerlendir: kalan konu / kalan gün
  const neededPerDay = daysToExam > 0 ? remaining / daysToExam : remaining;
  const onTrack = neededPerDay <= tpd;

  // Önümüzdeki HORIZON günü doldur
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days = Array.from({ length: HORIZON }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const slice = pool.slice(i * tpd, i * tpd + tpd);
    return { date: d, topics: slice, isToday: i === 0 };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <ClipboardList className="text-primary" size={26} />
          Çalışma Programı
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sınava kalan güne, zayıf konularına ve günlük hedefine göre otomatik
          plan. Konuyu bitirdikçe program kendini yeniler.
        </p>
      </header>

      {/* Özet */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="AYT'ye kalan" value={`${daysToExam} gün`} />
        <Stat label="Çalışılacak konu" value={String(remaining)} />
        <Stat label="Günlük hedef" value={`~${tpd} konu`} sub={`${goal} dk`} />
        <Stat
          label="Ustalık"
          value={`${masteredTopics}/${totalTopics}`}
          sub="usta"
        />
      </section>

      {/* Tempo uyarısı */}
      {remaining > 0 && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            onTrack
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-amber-500/30 bg-amber-500/5"
          }`}
        >
          {onTrack ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
          ) : (
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          )}
          <div>
            <div className={`font-medium ${onTrack ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {onTrack ? "Tempon yeterli" : "Tempoyu artırman gerek"}
            </div>
            <p className="mt-1 text-muted-foreground">
              {daysToExam > 0 ? (
                <>
                  Kalan {remaining} konuyu {daysToExam} günde bitirmek için günde
                  ortalama <strong>{Math.ceil(neededPerDay)}</strong> konu
                  gerekiyor. Şu anki hedefin günde ~{tpd} konu.
                </>
              ) : (
                <>Sınav tarihi geçti veya çok yakın — kalan {remaining} konuya odaklan.</>
              )}
            </p>
          </div>
        </div>
      )}

      {remaining === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
          <h2 className="mt-4 text-lg font-semibold">Tüm konular yolunda!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Çalışılması gereken zayıf konu kalmadı. Tekrar ve deneme zamanı.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((day, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 ${
                day.isToday ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className={`mb-2 flex items-baseline justify-between ${day.isToday ? "text-primary" : "text-muted-foreground"}`}>
                <span className="text-xs font-semibold">
                  {DAY_NAMES[day.date.getDay()]}
                  {day.isToday && " • bugün"}
                </span>
                <span className="text-[10px]">
                  {day.date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
              <div className="space-y-1.5">
                {day.topics.length === 0 ? (
                  <div className="rounded-md bg-muted/30 px-2 py-3 text-center text-[10px] text-muted-foreground">
                    Tekrar / deneme
                  </div>
                ) : (
                  day.topics.map((t) => (
                    <Link
                      key={t.id}
                      href={`/pomodoro?topic=${t.id}`}
                      className="block rounded-md border border-border bg-background px-2 py-1.5 transition hover:border-primary/50"
                      title={`${t.subjectName} · ustalık ${t.score} · Pomodoro başlat`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="truncate text-[11px] font-medium leading-tight">{t.name}</span>
                      </div>
                      <div className="mt-0.5 truncate text-[9px] text-muted-foreground">
                        {t.subjectName}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock size={13} /> Bir konuya tıklayınca o konu seçili şekilde Pomodoro
        başlar. Konuyu işaretledikçe program güncellenir.
      </p>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">
        {value} {sub && <span className="text-sm font-normal text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
