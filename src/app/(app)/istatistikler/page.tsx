import { redirect } from "next/navigation";
import {
  BarChart3,
  Clock,
  Flame,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { subjectForTrack } from "@/data/exam-subjects";
import { Heatmap } from "./heatmap";
import { SubjectTimePie } from "./subject-pie";
import { TopicStatusBars } from "./topic-status";
import { TopMistakes } from "./top-mistakes";
import { NetTrendChart } from "./net-trend";

export default async function IstatistiklerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 365 gün geri
  const yearAgo = new Date();
  yearAgo.setDate(yearAgo.getDate() - 365);

  // 7 gün geri (bu haftanın özeti)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // 30 gün geri (ders dağılımı için)
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    { data: sessionsYear },
    { data: sessionsWeek },
    { data: sessionsMonth },
    { data: subjects },
    { data: progress },
    { data: mistakes },
    { data: exams },
    { data: streak },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("study_sessions")
      .select("started_at, duration_seconds, subject_id, pomodoros")
      .eq("user_id", user.id)
      .gte("started_at", yearAgo.toISOString()),
    supabase
      .from("study_sessions")
      .select("duration_seconds, pomodoros")
      .eq("user_id", user.id)
      .gte("started_at", weekAgo.toISOString()),
    supabase
      .from("study_sessions")
      .select("subject_id, duration_seconds")
      .eq("user_id", user.id)
      .gte("started_at", monthAgo.toISOString()),
    supabase
      .from("subjects")
      .select("*, topics(id)")
      .in("exam_type", ["TYT", "AYT"])
      .order("display_order"),
    supabase
      .from("topic_progress")
      .select("topic_id, status")
      .eq("user_id", user.id),
    supabase
      .from("mistakes")
      .select("topic_id, created_at")
      .eq("user_id", user.id)
      .gte("created_at", monthAgo.toISOString()),
    supabase
      .from("exams")
      .select("name, exam_date, totals, exam_type")
      .eq("user_id", user.id)
      .order("exam_date", { ascending: true }),
    supabase
      .from("streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("high_school_track")
      .eq("id", user.id)
      .single(),
  ]);

  // TYT herkese; AYT derslerini lise bölümüne (track) göre filtrele
  const track = profile?.high_school_track ?? null;
  type SubjRow = {
    id: string;
    name: string;
    color: string | null;
    exam_type: string;
    tracks: string[] | null;
    topics: { id: string }[];
  };
  const relevantSubjects = ((subjects ?? []) as SubjRow[]).filter(
    (s) => subjectForTrack(s.exam_type, s.tracks, track),
  );

  // Haftalık özet
  const weekSeconds = (sessionsWeek ?? []).reduce(
    (acc, s) => acc + s.duration_seconds,
    0,
  );
  const weekMinutes = Math.round(weekSeconds / 60);
  const weekPomos = (sessionsWeek ?? []).reduce(
    (acc, s) => acc + (s.pomodoros ?? 0),
    0,
  );
  const weekSessions = sessionsWeek?.length ?? 0;
  const weekNewMistakes = (mistakes ?? []).filter(
    (m) => new Date(m.created_at) >= weekAgo,
  ).length;

  // Heatmap için günlük toplama
  const dailyMinutes = new Map<string, number>();
  for (const s of sessionsYear ?? []) {
    const d = new Date(s.started_at).toISOString().slice(0, 10);
    dailyMinutes.set(
      d,
      (dailyMinutes.get(d) ?? 0) + Math.round(s.duration_seconds / 60),
    );
  }

  // Ders × süre (30 gün)
  const subjectTimeMap = new Map<string, number>();
  for (const s of sessionsMonth ?? []) {
    if (!s.subject_id) continue;
    subjectTimeMap.set(
      s.subject_id,
      (subjectTimeMap.get(s.subject_id) ?? 0) + s.duration_seconds,
    );
  }
  const subjectTimeData = relevantSubjects.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    seconds: subjectTimeMap.get(s.id) ?? 0,
  }));
  const totalMonthSeconds = subjectTimeData.reduce((a, b) => a + b.seconds, 0);

  // Konu durumu (per subject)
  const progressByTopic = new Map(
    (progress ?? []).map((p) => [p.topic_id, p.status]),
  );
  const topicStatusData = relevantSubjects.map((s) => {
    const topicIds = (s.topics ?? []).map((t: { id: string }) => t.id);
    let done = 0,
      inProgress = 0;
    for (const tid of topicIds) {
      const st = progressByTopic.get(tid);
      if (st === "done") done++;
      else if (st === "in_progress") inProgress++;
    }
    return {
      id: s.id,
      name: s.name,
      color: s.color,
      total: topicIds.length,
      done,
      inProgress,
      notStarted: topicIds.length - done - inProgress,
    };
  });

  // En çok yanlış yapılan konular
  const mistakeCounts = new Map<string, number>();
  for (const m of mistakes ?? []) {
    if (!m.topic_id) continue;
    mistakeCounts.set(m.topic_id, (mistakeCounts.get(m.topic_id) ?? 0) + 1);
  }
  const { data: topMistakeTopics } = await supabase
    .from("topics")
    .select("id, name, subjects(name, color)")
    .in("id", Array.from(mistakeCounts.keys()).slice(0, 50));
  const topMistakesData = (
    (topMistakeTopics ?? []) as Array<{
      id: string;
      name: string;
      subjects?: { name: string; color: string } | { name: string; color: string }[] | null;
    }>
  )
    .map((t) => {
      const subj = Array.isArray(t.subjects) ? t.subjects[0] : t.subjects;
      return {
        id: t.id,
        name: t.name,
        subjectName: subj?.name ?? "",
        subjectColor: subj?.color ?? "#888",
        count: mistakeCounts.get(t.id) ?? 0,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Insight cümlesi
  const topSubject = subjectTimeData
    .slice()
    .sort((a, b) => b.seconds - a.seconds)[0];
  const insightSentence = (() => {
    if (totalMonthSeconds === 0)
      return "Son 30 günde henüz çalışma seansı kaydedilmemiş. Pomodoro ile başlayabilirsin.";
    const m = Math.round(topSubject.seconds / 60);
    const pct = Math.round((topSubject.seconds / totalMonthSeconds) * 100);
    return `Son 30 günde toplam ${Math.round(totalMonthSeconds / 60)} dk çalıştın. En çok ${topSubject.name} (${m} dk, %${pct}).`;
  })();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <BarChart3 className="text-primary" size={26} />
          İstatistikler
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerçekten neye ne kadar zaman ayırdın, nerede tıkanıyorsun, net trendin
          nasıl gidiyor — hepsi burada.
        </p>
      </header>

      <p className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        💡 {insightSentence}
      </p>

      {/* Bu hafta */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          BU HAFTA
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Çalışma" value={`${weekMinutes} dk`} icon={Clock} color="text-blue-500" />
          <Stat label="Pomodoro" value={`${weekPomos}`} icon={Flame} color="text-orange-500" />
          <Stat label="Seans" value={`${weekSessions}`} icon={Target} color="text-emerald-500" />
          <Stat label="Yeni yanlış" value={`${weekNewMistakes}`} icon={AlertCircle} color="text-rose-500" />
        </div>
      </section>

      {/* Heatmap */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">365 günlük çalışma haritası</h2>
            <p className="text-xs text-muted-foreground">
              Her kare bir gün. Koyuluk o günkü dakikayı gösterir.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Az</span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((l) => (
                <div
                  key={l}
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{
                    backgroundColor:
                      l === 0
                        ? "oklch(0.62 0.21 285 / 0.10)"
                        : `oklch(0.62 0.21 285 / ${0.2 + l * 0.2})`,
                  }}
                />
              ))}
            </div>
            <span>Çok</span>
          </div>
        </header>
        <Heatmap dailyMinutes={Object.fromEntries(dailyMinutes)} />
      </section>

      {/* Ders × süre + konu durumu */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Ders × süre (30 gün)</h2>
          <p className="text-xs text-muted-foreground">
            Gerçekte hangi derse ne kadar ayırdın.
          </p>
          {totalMonthSeconds > 0 ? (
            <SubjectTimePie data={subjectTimeData} total={totalMonthSeconds} />
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Son 30 günde Pomodoro/seans kaydı yok.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Konu durumu</h2>
          <p className="text-xs text-muted-foreground">
            Her dersteki başlamadın / devam ediyor / bitti dağılımı.
          </p>
          <TopicStatusBars data={topicStatusData} />
        </section>
      </div>

      {/* Yanlışlar + net trend */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">En çok tıkandığın konular</h2>
          <p className="text-xs text-muted-foreground">
            Son 30 günde yanlış defterinde en çok birikenler.
          </p>
          {topMistakesData.length > 0 ? (
            <TopMistakes data={topMistakesData} />
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Henüz yanlış defterine kayıt eklenmemiş. Bir test çöz, kontrol et.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp size={16} className="text-emerald-500" />
            Net trendi
          </h2>
          <p className="text-xs text-muted-foreground">
            Denemelerinin toplam neti zaman içinde.
          </p>
          {exams && exams.length > 0 ? (
            <NetTrendChart exams={exams} />
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Henüz deneme girişi yok. Denemeler sayfasından ekleyebilirsin.
            </p>
          )}
        </section>
      </div>

      {/* Bottom — uzun süreli streak */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-orange-500/5 via-card to-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Streak</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Şu anki seri: <span className="font-semibold text-orange-500">
                {streak?.current_streak ?? 0} gün
              </span>{" "}
              · En uzun: {streak?.longest_streak ?? 0} gün
            </p>
          </div>
          <div className="flex items-center gap-1.5 font-display text-3xl font-bold tabular-nums text-orange-500">
            <Flame size={28} className={`fill-orange-500 ${(streak?.current_streak ?? 0) > 0 ? "animate-ember" : ""}`} />
            {streak?.current_streak ?? 0}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <div className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
