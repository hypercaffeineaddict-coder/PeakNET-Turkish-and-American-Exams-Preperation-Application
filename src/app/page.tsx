import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Flame,
  ListChecks,
  FlaskConical,
  Sparkles,
  BookOpen,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { MotivationCard } from "@/components/motivation-card";

const features = [
  {
    icon: Flame,
    title: "Streak takibi",
    body: "Her gün 25 dk çalış, ateşi söndürme. Duolingo gibi günlük seri.",
    color: "text-orange-500",
  },
  {
    icon: ListChecks,
    title: "MF AYT müfredatı",
    body: "Mat, Fizik, Kimya, Biyoloji — 68 konu, sınıf seviyesi ve öncelik etiketli.",
    color: "text-emerald-500",
  },
  {
    icon: FlaskConical,
    title: "Deneme analizi",
    body: "Net hesaplama, konu bazlı doğru/yanlış kırılımı, geçmiş grafikleri.",
    color: "text-blue-500",
  },
  {
    icon: BookOpen,
    title: "Yanlış defteri",
    body: "Hatalı sorularını kaydet, aralıklı tekrarla unutma.",
    color: "text-rose-500",
  },
  {
    icon: Sparkles,
    title: "Yerel AI asistan",
    body: "Ollama ile cihazında çalışır — konu anlat, soru çöz, notlarınla konuş.",
    color: "text-violet-500",
  },
  {
    icon: Target,
    title: "Kişisel hedef",
    body: "Hedef bölümün, sınıfın ve zayıf derslerin programını şekillendirir.",
    color: "text-primary",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .single();
    redirect(profile?.onboarding_completed_at ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">
            Peak<span className="text-primary">NET</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Giriş
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Başla
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Flame size={12} className="text-orange-500" />
              MF AYT odaklı çalışma sistemi
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              YKS yolculuğunda <br />
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                her gün bir adım.
              </span>
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              MF müfredatını konu konu takip et, denemelerini analiz et, yanlışlarını
              defterle, yerel AI asistanına sor. Streak'in seni terk etmesin.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/signup"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Ücretsiz hesap aç
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Giriş yap
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <MotivationCard />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl font-semibold">68</div>
                <div className="text-xs text-muted-foreground">MF AYT konusu</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl font-semibold">4</div>
                <div className="text-xs text-muted-foreground">Temel ders</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-1 text-2xl font-semibold text-orange-500">
                  <Flame size={20} />
                  365
                </div>
                <div className="text-xs text-muted-foreground">Günlük seri hedefi</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-2xl font-semibold">∞</div>
                <div className="text-xs text-muted-foreground">Yerel AI sorgu</div>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto mt-24 grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body, color }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
            >
              <Icon size={20} className={color} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-muted-foreground sm:px-10">
        Bilimle, sabırla, disiplinle.
      </footer>
    </div>
  );
}
