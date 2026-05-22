import { CheckCircle2, Circle, Clock, Flame, Brain, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// Bugünün görevleri — bugünkü veriden hesaplanır, kalıcılık gerektirmez.
// XP zaten ilgili eylemler (pomodoro/tarama/deneme) tarafından veriliyor;
// burası motivasyon amaçlı bir günlük checklist.
export async function DailyQuests() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [{ data: sessions }, { data: xpToday }, { data: profile }] =
    await Promise.all([
      supabase
        .from("study_sessions")
        .select("duration_seconds, pomodoros")
        .eq("user_id", user.id)
        .gte("started_at", todayIso),
      supabase
        .from("xp_events")
        .select("reason")
        .eq("user_id", user.id)
        .gte("created_at", todayIso),
      supabase
        .from("profiles")
        .select("daily_goal_minutes")
        .eq("id", user.id)
        .single(),
    ]);

  const sess = sessions ?? [];
  const minutes = Math.round(
    sess.reduce((a, s) => a + (s.duration_seconds ?? 0), 0) / 60,
  );
  const pomos = sess.reduce((a, s) => a + (s.pomodoros ?? 0), 0);
  const goal = profile?.daily_goal_minutes ?? 60;
  const reasons = (xpToday ?? []).map((e) => e.reason ?? "");
  const practiced = reasons.some((r) =>
    /tarama|test|exam|solve/i.test(r),
  );

  const quests = [
    {
      icon: Flame,
      label: "Bugün çalışmaya başla",
      done: sess.length > 0,
      hint: `${sess.length} seans`,
    },
    {
      icon: Clock,
      label: `Günlük hedefi tamamla (${goal} dk)`,
      done: minutes >= goal,
      hint: `${minutes}/${goal} dk`,
    },
    {
      icon: Target,
      label: "1 Pomodoro tamamla",
      done: pomos >= 1,
      hint: `${pomos} pomodoro`,
    },
    {
      icon: Brain,
      label: "AI ile pratik yap (test / tarama / soru)",
      done: practiced,
      hint: practiced ? "tamam" : "henüz yok",
    },
  ];

  const doneCount = quests.filter((q) => q.done).length;
  const pct = Math.round((doneCount / quests.length) * 100);
  const allDone = doneCount === quests.length;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 size={16} className="text-emerald-500" />
          Bugünün görevleri
        </h2>
        <span className="text-xs text-muted-foreground">
          {doneCount}/{quests.length}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {quests.map((q) => {
          const Icon = q.done ? CheckCircle2 : Circle;
          return (
            <li key={q.label} className="flex items-center gap-3 text-sm">
              <Icon
                size={16}
                className={q.done ? "text-emerald-500" : "text-muted-foreground/40"}
              />
              <span className={`flex-1 ${q.done ? "text-muted-foreground line-through" : ""}`}>
                {q.label}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {q.hint}
              </span>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
          🎉 Bugünün tüm görevlerini tamamladın! Streak güvende.
        </p>
      )}
    </section>
  );
}
