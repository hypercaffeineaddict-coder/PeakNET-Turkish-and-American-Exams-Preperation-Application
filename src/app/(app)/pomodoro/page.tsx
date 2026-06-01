import { redirect } from "next/navigation";
import { Clock, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { subjectForTrack } from "@/data/exam-subjects";
import { PomodoroTimer } from "./timer";

export default async function PomodoroPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Konu listesi (topic selector için)
  const { data: subjectsRaw } = await supabase
    .from("subjects")
    .select("*, topics(id, name, display_order)")
    .in("exam_type", ["TYT", "AYT"])
    .order("display_order");

  // Bugünkü seanslar
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todaySessions } = await supabase
    .from("study_sessions")
    .select("duration_seconds, pomodoros, started_at, topic_id")
    .eq("user_id", user.id)
    .gte("started_at", today.toISOString())
    .order("started_at", { ascending: false });

  const totalSeconds = (todaySessions ?? []).reduce(
    (acc, s) => acc + s.duration_seconds,
    0,
  );
  const totalMinutes = Math.round(totalSeconds / 60);
  const totalPomodoros = (todaySessions ?? []).reduce(
    (acc, s) => acc + (s.pomodoros ?? 0),
    0,
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_goal_minutes, high_school_track")
    .eq("id", user.id)
    .single();
  const goal = profile?.daily_goal_minutes ?? 60;
  const progressPct = Math.min(100, Math.round((totalMinutes / goal) * 100));

  // TYT herkese; AYT derslerini lise bölümüne (track) göre filtrele
  const track = profile?.high_school_track ?? null;
  const subjects = ((subjectsRaw ?? []) as Array<{
    id: string;
    name: string;
    color: string | null;
    exam_type: string;
    tracks: string[] | null;
    topics: { id: string; name: string; display_order: number }[];
  }>).filter(
    (s) => subjectForTrack(s.tracks, track),
  );

  const initialTopic = topic ?? "";
  // Initial topic için subject çıkar
  const initialSubject = (() => {
    if (!initialTopic) return "";
    for (const s of subjects ?? []) {
      if (s.topics?.some((t: { id: string }) => t.id === initialTopic))
        return s.id;
    }
    return "";
  })();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Clock className="text-primary" size={26} />
          Pomodoro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          25 dakikalık bloklarla odaklan. Biten her seans streak'ine eklenir.
        </p>
      </div>

      {/* Bugünkü ilerleme */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bugün toplam</span>
            <Clock size={16} className="text-primary" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold tabular-nums">
            {totalMinutes} dk
            <span className="ml-1 text-sm font-medium text-muted-foreground">/ {goal} dk</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bugün Pomodoro</span>
            <Flame size={16} className="text-orange-500" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold tabular-nums">{totalPomodoros}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Seans sayısı</span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold tabular-nums">
            {todaySessions?.length ?? 0}
          </div>
        </div>
      </div>

      <PomodoroTimer
        subjects={(subjects ?? []) as never}
        initialTopic={initialTopic}
        initialSubject={initialSubject}
      />

      {/* Bugünkü seanslar listesi */}
      {todaySessions && todaySessions.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Bugünkü seanslar</h2>
          <ul className="mt-3 divide-y divide-border">
            {todaySessions.map((s, i) => {
              const m = Math.round(s.duration_seconds / 60);
              const t = new Date(s.started_at).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li
                  key={i}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <span className="text-muted-foreground">{t}</span>
                    {s.topic_id && (
                      <span className="ml-3 text-xs text-muted-foreground">
                        {s.topic_id}
                      </span>
                    )}
                  </div>
                  <span>
                    {m} dk
                    {s.pomodoros && s.pomodoros > 0 && (
                      <span className="ml-2 text-orange-500">
                        🔥 {s.pomodoros}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
