import { redirect } from "next/navigation";
import { Trophy, Zap, Medal, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { levelForXp, effectiveStreak, BADGES, type BadgeStats } from "@/lib/gamification";
import { AvatarView } from "@/components/avatar-view";

type Totals = Record<string, { net?: number }>;
type LeaderRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  weekly_xp: number;
  total_xp: number;
  is_me: boolean;
};

export default async function BasarimlarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: streak },
    { data: sessions },
    { data: progressRows },
    { data: exams },
    { data: mistakes },
    { data: leaderboard },
  ] = await Promise.all([
    supabase.from("profiles").select("total_xp, display_name").eq("id", user.id).single(),
    supabase.from("streaks").select("current_streak, longest_streak, last_study_date").eq("user_id", user.id).single(),
    supabase.from("study_sessions").select("duration_seconds").eq("user_id", user.id),
    supabase.from("topic_progress").select("status").eq("user_id", user.id),
    supabase.from("exams").select("totals").eq("user_id", user.id),
    supabase.from("mistakes").select("repetitions").eq("user_id", user.id),
    supabase.rpc("weekly_leaderboard", { p_limit: 20 }),
  ]);

  const totalXp = profile?.total_xp ?? 0;
  const lv = levelForXp(totalXp);

  const totalSessions = sessions?.length ?? 0;
  const totalMinutes = Math.round(
    (sessions ?? []).reduce((a, s) => a + s.duration_seconds, 0) / 60,
  );
  const topicsDone = (progressRows ?? []).filter((p) => p.status === "done").length;
  const examsCount = exams?.length ?? 0;
  const bestNet = Math.max(
    0,
    ...(exams ?? []).map((e) => {
      const t = (e.totals ?? {}) as Totals;
      return Object.values(t).reduce((a, v) => a + (v?.net ?? 0), 0);
    }),
  );
  const mistakesReviewed = (mistakes ?? []).reduce(
    (a, m) => a + (m.repetitions ?? 0),
    0,
  );

  const stats: BadgeStats = {
    totalXp,
    level: lv.level,
    currentStreak: effectiveStreak(streak),
    longestStreak: streak?.longest_streak ?? 0,
    totalSessions,
    totalMinutes,
    topicsDone,
    examsCount,
    bestNet,
    mistakesReviewed,
  };

  const earnedBadges = BADGES.filter((b) => b.earned(stats));
  const lockedBadges = BADGES.filter((b) => !b.earned(stats));
  const rows = (leaderboard ?? []) as LeaderRow[];
  const myRank = rows.findIndex((r) => r.is_me) + 1;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Trophy className="text-amber-500" size={26} />
          Başarımlar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          XP kazan, seviye atla, rozet topla, liderlik tablosunda yüksel.
        </p>
      </header>

      {/* Seviye kartı */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 font-display text-3xl font-bold tabular-nums text-primary shadow-soft">
              {lv.level}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Seviye
              </div>
              <div className="font-display text-xl font-bold">Seviye {lv.level}</div>
              <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                <Zap size={14} className="fill-amber-500" />
                <span className="tabular-nums">{totalXp.toLocaleString("tr-TR")}</span> XP
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Sonraki seviyeye{" "}
            <span className="font-semibold text-foreground">{lv.nextLevelXp} XP</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Seviye {lv.level}</span>
            <span>
              {lv.current}/{lv.needed} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all"
              style={{ width: `${(lv.current / lv.needed) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* Rozetler */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Medal size={18} className="text-amber-500" />
            Rozetler
          </h2>
          <span className="text-sm text-muted-foreground">
            {earnedBadges.length}/{BADGES.length}
          </span>
        </div>

        {earnedBadges.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {earnedBadges.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center"
              >
                <div className="text-3xl">{b.emoji}</div>
                <div className="mt-2 text-sm font-semibold">{b.name}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {b.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {lockedBadges.length > 0 && (
          <>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Kilitli
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {lockedBadges.map((b) => {
                const prog = b.progress ? b.progress(stats) : 0;
                return (
                  <div
                    key={b.id}
                    className="rounded-xl border border-border bg-background p-4 text-center opacity-70"
                  >
                    <div className="text-3xl grayscale">{b.emoji}</div>
                    <div className="mt-2 text-sm font-semibold">{b.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {b.description}
                    </div>
                    {prog > 0 && (
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${prog * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Liderlik tablosu */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Crown size={18} className="text-amber-500" />
            Haftalık liderlik
          </h2>
          {myRank > 0 && (
            <span className="text-sm text-muted-foreground">
              Senin sıran: <span className="font-semibold text-foreground">#{myRank}</span>
            </span>
          )}
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Bu hafta henüz XP kazanılmadı. İlk sen ol!
          </p>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((r, i) => (
              <li
                key={r.user_id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  r.is_me ? "bg-primary/10 border border-primary/30" : "bg-background"
                }`}
              >
                <span
                  className={`w-7 shrink-0 text-center font-semibold tabular-nums ${
                    i === 0
                      ? "text-amber-500"
                      : i === 1
                        ? "text-slate-300"
                        : i === 2
                          ? "text-orange-600"
                          : "text-muted-foreground"
                  }`}
                >
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                </span>
                <AvatarView src={r.avatar_url} name={r.display_name} size={32} />
                <span className="flex-1 truncate">
                  {r.display_name}
                  {r.is_me && <span className="ml-1 text-xs text-primary">(sen)</span>}
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <Zap size={12} className="fill-amber-500" />
                  {Number(r.weekly_xp).toLocaleString("tr-TR")}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          Liderlik her pazartesi sıfırlanır. Sadece görünen ad ve XP paylaşılır.
        </p>
      </section>
    </div>
  );
}
