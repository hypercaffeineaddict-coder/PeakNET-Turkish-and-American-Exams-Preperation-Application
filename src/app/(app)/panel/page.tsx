import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Flame,
  Zap,
  BookOpen,
  FlaskConical,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Minus,
  Share2,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { computeMastery } from "@/lib/mastery";
import { subjectForTrack } from "@/data/exam-subjects";

export const metadata = { title: "Panel · PeakNET" };

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

type TopicRow = {
  id: string;
  name: string;
  priority: string;
  display_order: number;
  grade: number | null;
};
type SubjectRow = {
  id: string;
  name: string;
  color: string | null;
  exam_type: string;
  tracks: string[] | null;
  topics: TopicRow[];
};

export default async function PanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Hafta sınırları (Pazartesi başlangıç, yerel saat)
  const now = new Date();
  const dayIdx = (now.getDay() + 6) % 7; // 0 = Pazartesi
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - dayIdx);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const weekStartIso = weekStart.toISOString();
  const lastWeekStartIso = lastWeekStart.toISOString();
  const weekStartDate = weekStartIso.slice(0, 10);
  const lastWeekStartDate = lastWeekStartIso.slice(0, 10);

  const [
    { data: streak },
    { data: profile },
    { data: sessions },
    { data: xpEvents },
    { data: exams },
    { data: mistakes },
    { data: subjectsRaw },
    { data: progressRows },
  ] = await Promise.all([
    supabase.from("streaks").select("*").eq("user_id", user.id).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("study_sessions")
      .select("topic_id, duration_seconds, pomodoros, started_at")
      .eq("user_id", user.id)
      .gte("started_at", lastWeekStartIso),
    supabase
      .from("xp_events")
      .select("amount, created_at")
      .eq("user_id", user.id)
      .gte("created_at", lastWeekStartIso),
    supabase
      .from("exams")
      .select("name, exam_date, exam_type, totals")
      .eq("user_id", user.id)
      .order("exam_date", { ascending: false })
      .limit(10),
    supabase
      .from("mistakes")
      .select("topic_id, repetitions, created_at")
      .eq("user_id", user.id),
    supabase.from("subjects").select("*, topics(*)").in("exam_type", ["TYT", "AYT"]).order("display_order"),
    supabase.from("topic_progress").select("topic_id, status, confidence").eq("user_id", user.id),
  ]);

  // --- Haftalık vs geçen hafta toplamları ---
  const inThisWeek = (iso: string) => iso >= weekStartIso;
  const allSessions = sessions ?? [];
  const sumBy = <T,>(arr: T[], pick: (x: T) => number) =>
    arr.reduce((a, x) => a + pick(x), 0);

  const thisWeekSessions = allSessions.filter((s) => inThisWeek(s.started_at));
  const lastWeekSessions = allSessions.filter((s) => !inThisWeek(s.started_at));

  const studyMinThis = Math.round(sumBy(thisWeekSessions, (s) => (s.duration_seconds ?? 0) / 60));
  const studyMinLast = Math.round(sumBy(lastWeekSessions, (s) => (s.duration_seconds ?? 0) / 60));
  const pomoThis = sumBy(thisWeekSessions, (s) => s.pomodoros ?? 0);
  const pomoLast = sumBy(lastWeekSessions, (s) => s.pomodoros ?? 0);

  const xpThis = sumBy((xpEvents ?? []).filter((e) => inThisWeek(e.created_at)), (e) => e.amount ?? 0);
  const xpLast = sumBy((xpEvents ?? []).filter((e) => !inThisWeek(e.created_at)), (e) => e.amount ?? 0);

  const mistakesThis = (mistakes ?? []).filter((m) => m.created_at >= weekStartIso).length;
  const mistakesLast = (mistakes ?? []).filter(
    (m) => m.created_at >= lastWeekStartIso && m.created_at < weekStartIso,
  ).length;

  const examsThis = (exams ?? []).filter((e) => e.exam_date >= weekStartDate).length;
  const examsLast = (exams ?? []).filter(
    (e) => e.exam_date >= lastWeekStartDate && e.exam_date < weekStartDate,
  ).length;

  // --- Mastery (zayıf konu / ders + plan) ---
  // TYT herkese; AYT derslerini lise bölümüne (track) göre filtrele.
  const track = profile?.high_school_track ?? null;
  const subjects: SubjectRow[] = ((subjectsRaw ?? []) as SubjectRow[]).filter(
    (s) => subjectForTrack(s.exam_type, s.tracks, track),
  );
  const progressMap = new Map((progressRows ?? []).map((p) => [p.topic_id, p]));

  const mistakeMap = new Map<string, number>();
  for (const m of mistakes ?? []) {
    if (!m.topic_id || (m.repetitions ?? 0) >= 2) continue;
    mistakeMap.set(m.topic_id, (mistakeMap.get(m.topic_id) ?? 0) + 1);
  }
  const studyMap = new Map<string, number>();
  for (const s of allSessions) {
    if (!s.topic_id) continue;
    studyMap.set(s.topic_id, (studyMap.get(s.topic_id) ?? 0) + (s.duration_seconds ?? 0) / 60);
  }

  type TWM = TopicRow & { score: number; level: number; color: string; subjectName: string };
  const allTopics: TWM[] = [];
  const subjectAvg: { name: string; color: string; avg: number; count: number }[] = [];
  for (const s of subjects) {
    const ts = s.topics ?? [];
    let sum = 0;
    for (const t of ts) {
      const p = progressMap.get(t.id);
      const m = computeMastery({
        status: p?.status,
        confidence: p?.confidence,
        studyMinutes: studyMap.get(t.id),
        openMistakes: mistakeMap.get(t.id),
      });
      sum += m.score;
      allTopics.push({ ...t, score: m.score, level: m.level, color: m.color, subjectName: s.name });
    }
    if (ts.length > 0)
      subjectAvg.push({ name: s.name, color: s.color ?? "#888", avg: Math.round(sum / ts.length), count: ts.length });
  }
  const overallMastery = allTopics.length
    ? Math.round(allTopics.reduce((a, t) => a + t.score, 0) / allTopics.length)
    : 0;
  const weakestSubjects = subjectAvg.slice().sort((a, b) => a.avg - b.avg).slice(0, 3);

  // Haftalık plan: zayıf + öncelikli konular, 7 güne dağıt
  const planPool = allTopics
    .filter((t) => t.level <= 2)
    .sort((a, b) => {
      const pr = (p: string) => (p === "high" ? 0 : p === "medium" ? 1 : 2);
      if (pr(a.priority) !== pr(b.priority)) return pr(a.priority) - pr(b.priority);
      return a.score - b.score;
    })
    .slice(0, 14);
  const planDays: TWM[][] = Array.from({ length: 7 }, () => []);
  planPool.forEach((t, i) => planDays[i % 7].push(t));

  // En son deneme neti
  const lastExam = (exams ?? [])[0];
  const lastExamNet = lastExam
    ? Object.values((lastExam.totals ?? {}) as Record<string, { net?: number }>).reduce(
        (a, v) => a + (v?.net ?? 0),
        0,
      )
    : null;

  const dailyGoal = profile?.daily_goal_minutes ?? 60;
  const weeklyGoal = dailyGoal * 7;
  const goalPct = weeklyGoal ? Math.min(100, Math.round((studyMinThis / weeklyGoal) * 100)) : 0;

  const fmtH = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <CalendarDays className="text-primary" size={26} />
          Panel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Haftalık çalışma raporun, bu haftanın planı ve koç/veli özeti.
        </p>
      </header>

      {/* Haftalık hedef ilerleme */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Bu haftanın hedefi</span>
          <span className="text-muted-foreground">
            {fmtH(studyMinThis)} / {fmtH(weeklyGoal)}
          </span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-muted-foreground">
          Günlük hedef {dailyGoal} dk · haftalık {goalPct}% tamamlandı
        </div>
      </section>

      {/* Haftalık rapor kartları */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Bu hafta (geçen haftaya kıyasla)
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <ReportCard icon={Clock} color="text-blue-500" label="Çalışma" value={fmtH(studyMinThis)} delta={studyMinThis - studyMinLast} unit="dk" />
          <ReportCard icon={Flame} color="text-orange-500" label="Pomodoro" value={String(pomoThis)} delta={pomoThis - pomoLast} />
          <ReportCard icon={Zap} color="text-amber-500" label="XP" value={String(xpThis)} delta={xpThis - xpLast} />
          <ReportCard icon={BookOpen} color="text-rose-500" label="Yeni yanlış" value={String(mistakesThis)} delta={mistakesThis - mistakesLast} invert />
          <ReportCard icon={FlaskConical} color="text-emerald-500" label="Deneme" value={String(examsThis)} delta={examsThis - examsLast} />
        </div>
      </section>

      {/* Haftalık plan */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays size={16} className="text-primary" />
          Bu haftanın planı
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Zayıf ve öncelikli konularından otomatik öneri. Her güne tıklayıp
          konuya geçebilirsin.
        </p>
        {planPool.length === 0 ? (
          <p className="mt-4 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
            Plan için yeterli veri yok. Konular sayfasında konu durumu/güven
            işaretledikçe burada kişisel plan oluşacak.
          </p>
        ) : (
          <div className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {planDays.map((topics, i) => {
              const isToday = i === dayIdx;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-2.5 ${
                    isToday ? "border-primary bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div className={`mb-2 text-center text-xs font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {DAY_LABELS[i]}
                    {isToday && <span className="ml-1">•</span>}
                  </div>
                  <div className="space-y-1.5">
                    {topics.length === 0 ? (
                      <div className="rounded-lg bg-muted/30 px-2 py-3 text-center text-[10px] text-muted-foreground">
                        Tekrar / dinlenme
                      </div>
                    ) : (
                      topics.map((t) => (
                        <Link
                          key={t.id}
                          href={`/konular/${t.id}`}
                          className="block rounded-lg border border-border bg-card px-2 py-1.5 transition hover:border-primary/50"
                          title={`${t.subjectName} · ustalık ${t.score}`}
                        >
                          <div className="truncate text-[11px] font-medium leading-tight">
                            {t.name}
                          </div>
                          <div className="truncate text-[9px] text-muted-foreground">
                            {t.subjectName}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Koç / veli özeti */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Share2 size={16} className="text-primary" />
            Koç / veli özeti
          </h2>
          <span className="text-xs text-muted-foreground">
            {weekStart.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} –{" "}
            {now.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {profile?.display_name ?? "Öğrenci"} bu hafta. Bu özeti koçunla veya
          ailenle paylaşabilirsin.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryStat icon={Flame} label="Güncel streak" value={`${streak?.current_streak ?? 0} gün`} />
          <SummaryStat icon={Clock} label="Haftalık çalışma" value={fmtH(studyMinThis)} />
          <SummaryStat icon={GraduationCap} label="Genel ustalık" value={`%${overallMastery}`} />
          <SummaryStat
            icon={FlaskConical}
            label="Son deneme neti"
            value={lastExamNet != null ? lastExamNet.toFixed(1) : "—"}
          />
        </div>

        {weakestSubjects.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
            <div className="text-xs font-medium text-muted-foreground">
              Odaklanılacak dersler (en düşük ustalık)
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {weakestSubjects.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                  <span className="font-semibold tabular-nums text-muted-foreground">%{s.avg}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/ustalik"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ustalık detayını gör <ChevronRight size={13} />
        </Link>
      </section>
    </div>
  );
}

function ReportCard({
  icon: Icon,
  color,
  label,
  value,
  delta,
  unit,
  invert,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  value: string;
  delta: number;
  unit?: string;
  invert?: boolean;
}) {
  // invert: artış kötü (yanlış sayısı gibi)
  const positive = invert ? delta < 0 : delta > 0;
  const negative = invert ? delta > 0 : delta < 0;
  const DeltaIcon = delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaColor =
    delta === 0
      ? "text-muted-foreground"
      : positive
        ? "text-emerald-500"
        : negative
          ? "text-rose-500"
          : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <div className="mt-1.5 text-xl font-semibold">{value}</div>
      <div className={`mt-0.5 flex items-center gap-1 text-[11px] ${deltaColor}`}>
        <DeltaIcon size={12} />
        {delta === 0 ? "değişim yok" : `${delta > 0 ? "+" : ""}${delta}${unit ? ` ${unit}` : ""}`}
      </div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <Icon size={16} className="text-primary" />
      <div className="mt-2 text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
