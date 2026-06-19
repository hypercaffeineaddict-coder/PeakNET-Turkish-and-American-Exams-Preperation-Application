import { redirect } from "next/navigation";
import {
  User,
  GraduationCap,
  Target,
  Clock,
  Sparkles,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { saveOnboarding } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { MotivationCard } from "@/components/motivation-card";
import { TrackSubjects } from "./track-subjects";
import { universities } from "@/data/universities";
import { departments } from "@/data/departments";
import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await getLocaleFromCookies();
  const t = getDict(locale).onboarding;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed_at) redirect("/dashboard");

  const grades = [
    { value: 9, label: t.gradeLabels.g9 },
    { value: 10, label: t.gradeLabels.g10 },
    { value: 11, label: t.gradeLabels.g11 },
    { value: 12, label: t.gradeLabels.g12 },
    { value: 13, label: t.gradeLabels.g13 },
  ];
  const goals = [
    { value: 30, label: t.goalLabels.m30 },
    { value: 60, label: t.goalLabels.m60 },
    { value: 120, label: t.goalLabels.m120 },
    { value: 180, label: t.goalLabels.m180 },
    { value: 300, label: t.goalLabels.m300 },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles size={12} className="text-primary" />
              {t.pill}
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          <form action={saveOnboarding} className="space-y-6">
            {/* İsim */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <User size={16} className="text-primary" />
                {t.sectionName}
              </header>
              <input
                name="display_name"
                type="text"
                required
                defaultValue={profile?.display_name ?? ""}
                placeholder={t.namePlaceholder}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </section>

            {/* Sınıf + sınav öğrencisi */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <GraduationCap size={16} className="text-primary" />
                {t.sectionGrade}
              </header>
              <div className="flex flex-wrap gap-2">
                {grades.map((g) => (
                  <label
                    key={g.value}
                    className="cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
                  >
                    <input
                      type="radio"
                      name="grade"
                      value={g.value}
                      required
                      className="hidden"
                      defaultChecked={profile?.grade === g.value}
                    />
                    {g.label}
                  </label>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 transition has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/5">
                <input
                  type="checkbox"
                  name="is_exam_student"
                  defaultChecked={profile?.is_exam_student ?? false}
                  className="mt-0.5 accent-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Trophy size={14} className="text-orange-500" />
                    {t.examStudentLabel}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.examStudentDesc}
                  </p>
                </div>
              </label>
            </section>

            {/* Lise bölümü + güçlü/zayıf dersler (track'e göre dinamik) */}
            <TrackSubjects
              defaultTrack={profile?.high_school_track ?? null}
              defaultStrong={profile?.strong_subjects ?? []}
              defaultWeak={profile?.weak_subjects ?? []}
              labels={{
                sectionTrack: t.sectionTrack,
                sectionSubjects: t.sectionSubjects,
                strongHeader: t.strongHeader,
                weakHeader: t.weakHeader,
                tracks: t.tracks,
              }}
            />

            {/* Hedef + üniversite autocomplete */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Target size={16} className="text-primary" />
                {t.sectionGoal}
              </header>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="text-muted-foreground">{t.goalUni}</span>
                  <input
                    name="target_university"
                    type="text"
                    list="university-list"
                    placeholder={t.goalPlaceholder}
                    defaultValue={profile?.target_university ?? ""}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <datalist id="university-list">
                    {universities.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">{t.goalDept}</span>
                  <input
                    name="target_department"
                    type="text"
                    list="department-list"
                    placeholder={t.goalPlaceholder}
                    defaultValue={profile?.target_department ?? ""}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <datalist id="department-list">
                    {departments.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </label>
              </div>
            </section>

            {/* Günlük hedef */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Clock size={16} className="text-primary" />
                {t.sectionDailyGoal}
              </header>
              <div className="flex flex-wrap gap-2">
                {goals.map((g) => (
                  <label
                    key={g.value}
                    className="cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
                  >
                    <input
                      type="radio"
                      name="daily_goal_minutes"
                      value={g.value}
                      required
                      className="hidden"
                      defaultChecked={(profile?.daily_goal_minutes ?? 60) === g.value}
                    />
                    {g.label}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t.streakHint}</p>
            </section>

            {error && (
              <p className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-500">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.99]"
              >
                {t.submit}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <MotivationCard />
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">{t.asideTitle}</h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {t.asideItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
