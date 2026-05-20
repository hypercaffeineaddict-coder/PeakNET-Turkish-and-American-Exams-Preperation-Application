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
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MotivationCard } from "@/components/motivation-card";
import { aiHealth } from "@/lib/ai";
import { DailyPlanCard } from "./daily-plan";

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

  const [
    { data: streak },
    { data: profile },
    { count: sessionCount },
    health,
  ] = await Promise.all([
    supabase.from("streaks").select("*").eq("user_id", user!.id).single(),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase
      .from("study_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    aiHealth(),
  ]);

  const stats = [
    {
      label: "Streak",
      value: `${streak?.current_streak ?? 0} gün`,
      icon: Flame,
      color: "text-orange-500",
    },
    {
      label: "En uzun streak",
      value: `${streak?.longest_streak ?? 0} gün`,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "Toplam seans",
      value: sessionCount ?? 0,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Günlük hedef",
      value: `${profile?.daily_goal_minutes ?? 60} dk`,
      icon: Target,
      color: "text-primary",
    },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Merhaba, {profile?.display_name ?? "öğrenci"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.target_department && profile?.target_university ? (
              <>
                Hedef:{" "}
                <span className="text-foreground">
                  {profile.target_department}
                </span>{" "}
                · {profile.target_university}
              </>
            ) : (
              "MF AYT yolculuğunda bugün de iyi bir gün olsun."
            )}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon size={18} className={color} />
              </div>
              <div className="mt-2 text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <QuickLink href="/pomodoro" icon={Clock} label="Pomodoro" />
          <QuickLink href="/konular" icon={ListChecks} label="Konular" />
          <QuickLink href="/coz" icon={CameraIcon} label="Soru çöz" />
          <QuickLink href="/denemeler" icon={FlaskConical} label="Denemeler" />
          <QuickLink href="/yanlislar" icon={BookOpen} label="Yanlışlar" />
          <QuickLink href="/asistan" icon={SparklesIcon} label="Asistan" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GraduationCap size={16} className="text-primary" />
            Profilin
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Sınıf</dt>
              <dd>{gradeLabel(profile?.grade)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Hedef üniversite</dt>
              <dd>{profile?.target_university || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Güçlü dersler</dt>
              <dd className="capitalize">
                {profile?.strong_subjects?.length
                  ? profile.strong_subjects.join(", ")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Geliştirilecek</dt>
              <dd className="capitalize">
                {profile?.weak_subjects?.length
                  ? profile.weak_subjects.join(", ")
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <DailyPlanCard aiReady={health.ok && health.hasChatModel} />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <MotivationCard />
        <Link
          href="/diller"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
        >
          <LanguagesIcon size={18} className="text-primary" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Diller</div>
            <div className="text-xs text-muted-foreground">
              JP · CN · FR · RU — yan beceri
            </div>
          </div>
          <span className="text-primary">→</span>
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
      className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-3 py-3 text-xs transition hover:border-primary/40 hover:bg-muted"
    >
      <Icon size={16} className="text-primary" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
