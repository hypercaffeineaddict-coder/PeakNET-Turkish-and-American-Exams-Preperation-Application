import Link from "next/link";
import {
  Flame,
  Target,
  Clock,
  TrendingUp,
  GraduationCap,
  ListChecks,
  FlaskConical,
  BookOpen,
  Sparkles as SparklesIcon,
  Languages as LanguagesIcon,
  Camera as CameraIcon,
  ScanLine as ScanLineIcon,
  CalendarDays,
  Calculator,
  Zap,
  ArrowRight,
  Flag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MotivationCard } from "@/components/motivation-card";
import { aiHealth } from "@/lib/ai";
import { DailyPlanCard } from "./daily-plan";
import { DailyQuests } from "./daily-quests";
import { YKS_DATES, daysUntil } from "@/data/exam-date";
import { levelForXp, effectiveStreak } from "@/lib/gamification";

function SummitStrip({ totalXp }: { totalXp: number }) {
  const tytDays = daysUntil(YKS_DATES.TYT);
  const aytDays = daysUntil(YKS_DATES.AYT);
  const showCountdown = tytDays >= 0 || aytDays >= 0;
  const primary = tytDays >= 0 ? tytDays : aytDays;
  const label = tytDays >= 0 ? "TYT" : "AYT";

  const lv = levelForXp(totalXp);
  const pct = Math.round((lv.current / lv.needed) * 100);

  return (
    <div className="bg-summit relative overflow-hidden rounded-2xl border border-border p-5 shadow-soft sm:p-6">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {showCountdown && (
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
              <Flame size={24} className="animate-ember" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-500">
                YKS&apos;ye kalan
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tabular-nums">
                  {primary}
                </span>
                <span className="text-sm text-muted-foreground">
                  gün · {label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Seviye ilerleme */}
        <div className="min-w-0 sm:w-64">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-primary">
              <Zap size={13} className="fill-primary" /> Seviye {lv.level}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {lv.current}/{lv.needed} XP
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="shimmer h-full rounded-full bg-primary transition-[width] duration-700"
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-muted-foreground">
            Sonraki seviyeye {lv.nextLevelXp} XP
          </div>
        </div>
      </div>
    </div>
  );
}

const gradeLabel = (g?: number | null) => {
  if (!g) return "—";
  if (g === 13) return "Mezun";
  return `${g}. sınıf`;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: streak }, { data: profile }, { count: sessionCount }, health] =
    await Promise.all([
      supabase.from("streaks").select("*").eq("user_id", user!.id).single(),
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase
        .from("study_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
      aiHealth(),
    ]);

  const streakCount = effectiveStreak(streak);

  const secondaryStats = [
    {
      label: "En uzun seri",
      value: `${streak?.longest_streak ?? 0}`,
      unit: "gün",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Toplam seans",
      value: `${sessionCount ?? 0}`,
      unit: "",
      icon: Clock,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      label: "Günlük hedef",
      value: `${profile?.daily_goal_minutes ?? 60}`,
      unit: "dk",
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <header className="animate-fade-up">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Merhaba, {profile?.display_name ?? "öğrenci"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.target_department && profile?.target_university ? (
              <>
                Hedef:{" "}
                <span className="font-medium text-foreground">
                  {profile.target_department}
                </span>{" "}
                · {profile.target_university}
              </>
            ) : (
              "YKS yolculuğunda bugün de iyi bir gün olsun."
            )}
          </p>
        </header>

        <div className="animate-fade-up anim-d1">
          <SummitStrip totalXp={profile?.total_xp ?? 0} />
        </div>

        {/* Streak hero + ikincil istatistikler */}
        <div className="animate-fade-up anim-d2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/15 to-card p-5 shadow-soft sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Güncel seri
              </span>
              <Flame
                size={20}
                className={`text-orange-500 ${streakCount > 0 ? "animate-ember" : ""}`}
              />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-bold tabular-nums text-orange-500">
                {streakCount}
              </span>
              <span className="text-sm text-muted-foreground">gün</span>
            </div>
          </div>

          {secondaryStats.map(({ label, value, unit, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} ${color}`}>
                  <Icon size={15} />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold tabular-nums">
                  {value}
                </span>
                {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Hızlı erişim */}
        <section className="animate-fade-up anim-d3">
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Hızlı erişim
          </h2>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
            <QuickLink href="/hedef" icon={Flag} label="Hedef" />
            <QuickLink href="/panel" icon={CalendarDays} label="Panel" />
            <QuickLink href="/konular" icon={ListChecks} label="Konular" />
            <QuickLink href="/ustalik" icon={GraduationCap} label="Ustalık" />
            <QuickLink href="/pomodoro" icon={Clock} label="Pomodoro" />
            <QuickLink href="/coz" icon={CameraIcon} label="Soru çöz" />
            <QuickLink href="/soru-takibi" icon={Target} label="Soru takibi" />
            <QuickLink href="/tarama" icon={ScanLineIcon} label="Tarama" />
            <QuickLink href="/araclar" icon={Calculator} label="Araçlar" />
            <QuickLink href="/denemeler" icon={FlaskConical} label="Denemeler" />
            <QuickLink href="/yanlislar" icon={BookOpen} label="Yanlışlar" />
            <QuickLink href="/asistan" icon={SparklesIcon} label="Asistan" />
            <QuickLink href="/rapor" icon={SparklesIcon} label="Haftalık koç" />
            <QuickLink href="/istatistikler" icon={TrendingUp} label="İstatistik" />
            <QuickLink href="/basarimlar" icon={Zap} label="Başarımlar" />
          </div>
        </section>

        <section className="animate-fade-up anim-d4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GraduationCap size={16} className="text-primary" />
            Profilin
          </div>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Sınıf</dt>
              <dd className="mt-0.5 font-medium">{gradeLabel(profile?.grade)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Hedef üniversite</dt>
              <dd className="mt-0.5 font-medium">{profile?.target_university || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Güçlü dersler</dt>
              <dd className="mt-0.5 font-medium capitalize">
                {profile?.strong_subjects?.length
                  ? profile.strong_subjects.join(", ")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Geliştirilecek</dt>
              <dd className="mt-0.5 font-medium capitalize">
                {profile?.weak_subjects?.length
                  ? profile.weak_subjects.join(", ")
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <div className="animate-fade-up anim-d5">
          <DailyPlanCard aiReady={health.ok && health.hasChatModel} />
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <DailyQuests />
        <MotivationCard />
        <Link
          href="/diller"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-soft"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LanguagesIcon size={18} />
          </span>
          <div className="flex-1">
            <div className="text-sm font-semibold">Diller</div>
            <div className="text-xs text-muted-foreground">
              JP · CN · FR · RU — yan beceri
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </Link>
      </aside>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3.5 text-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-primary transition group-hover:bg-primary/10 group-hover:scale-110">
        <Icon size={17} />
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
