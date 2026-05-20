import { redirect } from "next/navigation";
import {
  User,
  GraduationCap,
  Target,
  Clock,
  Sparkles,
  BookOpenCheck,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { saveOnboarding } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { MotivationCard } from "@/components/motivation-card";
import { universities } from "@/data/universities";

const grades = [
  { value: 9, label: "9. sınıf" },
  { value: 10, label: "10. sınıf" },
  { value: 11, label: "11. sınıf" },
  { value: 12, label: "12. sınıf" },
  { value: 13, label: "Mezun" },
];

const tracks = [
  { value: "MF", label: "Sayısal (MF)", hint: "Mat·Fiz·Kim·Biy" },
  { value: "TM", label: "Eşit Ağırlık (TM)", hint: "Mat·Edebiyat·Tarih·Coğrafya" },
  { value: "EA", label: "EA", hint: "Eski adlandırma" },
  { value: "Sozel", label: "Sözel", hint: "Edebiyat·Tarih·Coğrafya·Felsefe" },
  { value: "Dil", label: "Dil", hint: "İngilizce ağırlıklı" },
];

const goals = [
  { value: 30, label: "30 dk" },
  { value: 60, label: "1 sa" },
  { value: 120, label: "2 sa" },
  { value: 180, label: "3 sa" },
  { value: 300, label: "5 sa" },
];

const subjects = [
  { id: "matematik", name: "Matematik" },
  { id: "fizik", name: "Fizik" },
  { id: "kimya", name: "Kimya" },
  { id: "biyoloji", name: "Biyoloji" },
];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
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
              Hoş geldin
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Önce seni biraz tanıyalım
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bu bilgiler programını ve önerilen konuları şekillendirecek.
              Sonradan ayarlardan değiştirebilirsin.
            </p>
          </div>

          <form action={saveOnboarding} className="space-y-6">
            {/* İsim */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <User size={16} className="text-primary" />
                Sana nasıl hitap edelim?
              </header>
              <input
                name="display_name"
                type="text"
                required
                defaultValue={profile?.display_name ?? ""}
                placeholder="Adın"
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
              />
            </section>

            {/* Sınıf + sınav öğrencisi */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <GraduationCap size={16} className="text-primary" />
                Hangi sınıftasın?
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
                    Sınava hazırlanıyorum
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    İşaretlersen sınav-odaklı program: yoğun tekrar, deneme analizi,
                    konu önceliği geriye doğru sayım. İşaretlemezsen sınıf
                    müfredatına göre normal program.
                  </p>
                </div>
              </label>
            </section>

            {/* Lise bölümü */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <BookOpenCheck size={16} className="text-primary" />
                Lise bölümün
              </header>
              <div className="grid gap-2 sm:grid-cols-2">
                {tracks.map((t) => (
                  <label
                    key={t.value}
                    className="cursor-pointer rounded-xl border border-border bg-background p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="high_school_track"
                      value={t.value}
                      required
                      className="hidden"
                      defaultChecked={profile?.high_school_track === t.value}
                    />
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.hint}</div>
                  </label>
                ))}
              </div>
            </section>

            {/* Hedef + üniversite autocomplete */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Target size={16} className="text-primary" />
                Hedefin
              </header>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="text-muted-foreground">Hedef üniversite</span>
                  <input
                    name="target_university"
                    type="text"
                    list="university-list"
                    placeholder="yazmaya başla, listeden seç"
                    defaultValue={profile?.target_university ?? ""}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                  <datalist id="university-list">
                    {universities.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">Hedef bölüm</span>
                  <input
                    name="target_department"
                    type="text"
                    placeholder="örn. Bilgisayar Mühendisliği"
                    defaultValue={profile?.target_department ?? ""}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                  />
                </label>
              </div>
            </section>

            {/* Günlük hedef */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Clock size={16} className="text-primary" />
                Günlük çalışma hedefin
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
              <p className="mt-3 text-xs text-muted-foreground">
                Streak ateşini söndürmemek için günde en az 25 dk yeterli.
              </p>
            </section>

            {/* Güçlü / zayıf */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Sparkles size={16} className="text-primary" />
                Dersler — kendini nasıl görüyorsun?
              </header>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-500">
                    Güçlü olduğun
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <label
                        key={s.id}
                        className="cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-sm transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/10 has-[:checked]:text-emerald-500"
                      >
                        <input
                          type="checkbox"
                          name="strong"
                          value={s.id}
                          defaultChecked={profile?.strong_subjects?.includes(s.id)}
                          className="hidden"
                        />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-500">
                    Geliştirmen gereken
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <label
                        key={s.id}
                        className="cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-sm transition has-[:checked]:border-rose-500 has-[:checked]:bg-rose-500/10 has-[:checked]:text-rose-500"
                      >
                        <input
                          type="checkbox"
                          name="weak"
                          value={s.id}
                          defaultChecked={profile?.weak_subjects?.includes(s.id)}
                          className="hidden"
                        />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition hover:opacity-90"
              >
                Programımı oluştur →
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <MotivationCard />
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Neden bu sorular?</h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>• Sınıf + sınav öğrencisi → programın yoğunluğu</li>
              <li>• Lise bölümü → hangi derslere ne kadar ağırlık verileceği</li>
              <li>• Hedef bölüm → dashboard'da motivasyon olarak görünür</li>
              <li>• Günlük hedef → streak ve günlük görev</li>
              <li>• Zayıf dersler → üstte gözükür, daha sık tekrar önerilir</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
