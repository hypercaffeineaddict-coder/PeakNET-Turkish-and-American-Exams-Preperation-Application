import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Flame,
  Sparkles,
  BookOpen,
  Camera,
  Timer,
  Layers,
  GraduationCap,
  Calculator,
  ScanLine,
  ArrowRight,
  CheckCircle2,
  Mountain,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";

const spotlight = {
  icon: Sparkles,
  title: "AI öğretmen",
  body: "Konuyu sıfırdan anlatır, takıldığın yeri tekrar açıklar, sesli de konuşur. Cebinde 7/24 özel hoca.",
};

const features = [
  { icon: Camera, title: "Soru çözücü", body: "Fotoğrafla, AI adım adım çözsün, yanlış defterine eklesin.", color: "text-sky-500", bg: "bg-sky-500/10" },
  { icon: Timer, title: "Deneme simülasyonu", body: "Süreli, çok dersli AI denemesi; netin otomatik kaydedilir.", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Layers, title: "Tekrar kartları", body: "Aralıklı tekrar (SM-2) ile kalıcı öğren.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: GraduationCap, title: "Ustalık sistemi", body: "Hangi konuda ne seviyedesin gör, zayıfa odaklan.", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Calculator, title: "YKS araçları", body: "Net → tahmini puan ve sıralama hesabı.", color: "text-primary", bg: "bg-primary/10" },
  { icon: ScanLine, title: "Tarama testi", body: "Dersin tüm konularına yayılan tanı testi.", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: BookOpen, title: "Yanlış defteri", body: "Hatalarını kaydet, tekrarla, bir daha şaşırma.", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  { icon: Flame, title: "Streak & rozetler", body: "Her gün çalış, XP topla, seviye atla.", color: "text-orange-500", bg: "bg-orange-500/10" },
];

const steps = [
  { n: "1", title: "Hedefini belirle", body: "Sınıfını, alanını ve hedef bölümünü gir; program sana göre şekillensin." },
  { n: "2", title: "Çalış & sor", body: "Konuları işle, AI öğretmene sor, Pomodoro ile odaklan, kart çevir." },
  { n: "3", title: "Ölç & odaklan", body: "Deneme ve taramayla net çıkar, ustalık haritanda zayıfa yönel." },
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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Arka plan */}
      <div className="bg-summit pointer-events-none absolute inset-0 -z-10" />
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]" />

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-transparent px-6 py-4 backdrop-blur-sm sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Mountain size={17} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Peak<span className="text-primary">NET</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground">
            Giriş
          </Link>
          <Link href="/signup" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
            Başla
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 sm:px-10">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="space-y-6">
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Flame size={12} className="text-orange-500" />
              TYT · AYT · YDT — tüm YKS alanları için akıllı sistem
            </span>
            <h1 className="animate-fade-up anim-d1 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              YKS yolculuğunda
              <br />
              <span className="text-primary">her gün bir adım.</span>
            </h1>
            <p className="animate-fade-up anim-d2 max-w-xl text-base text-muted-foreground sm:text-lg">
              AI öğretmen, soru çözücü, deneme simülasyonu, tekrar kartları ve net→sıralama
              araçları tek yerde. Çalış, ölç, zayıf konuna odaklan; serini büyüt.
            </p>
            <div className="animate-fade-up anim-d3 flex flex-wrap gap-3 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-pop transition hover:opacity-90 active:scale-[0.99]"
              >
                Ücretsiz başla <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-muted"
              >
                Giriş yap
              </Link>
            </div>
            <div className="animate-fade-up anim-d4 flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> 150+ konu</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> AI destekli</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Çevrimdışı + Android</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Ücretsiz</span>
            </div>
          </div>

          {/* Ürün önizleme */}
          <div className="animate-fade-up anim-d2 lg:justify-self-end">
            <AppPreview />
          </div>
        </section>

        {/* Özellikler */}
        <section className="w-full max-w-6xl py-12">
          <h2 className="font-display text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Sınava giden her şey, tek uygulamada
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
            Konu takibinden AI öğretmene, denemeden sıralama tahminine kadar.
          </p>

          {/* Spotlight */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="bg-summit group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border p-7 shadow-soft lg:col-span-1 lg:row-span-2">
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft transition group-hover:scale-105">
                  <spotlight.icon size={24} />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">{spotlight.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{spotlight.body}</p>
              </div>
              <div className="relative mt-6 flex items-center gap-2 rounded-xl bg-card/70 p-3 text-xs text-foreground backdrop-blur">
                <Sparkles size={14} className="shrink-0 text-primary" />
                &quot;Türev konusuna baştan başlayalım mı?&quot;
              </div>
            </div>

            {/* Bento: 8 özellik 2x4 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, body, color, bg }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color} transition group-hover:scale-110`}>
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nasıl çalışır */}
        <section className="w-full max-w-5xl py-12">
          <h2 className="font-display text-center text-2xl font-bold tracking-tight sm:text-3xl">
            3 adımda başla
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-display text-lg font-bold text-primary">
                  {s.n}
                </div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full max-w-5xl py-12">
          <div className="bg-summit relative overflow-hidden rounded-3xl border border-border p-10 text-center shadow-soft">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Bugün başla, ateşi söndürme.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Ücretsiz hesap aç, hedefini belirle, ilk Pomodoro&apos;nu başlat.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-pop transition hover:opacity-90 active:scale-[0.99]"
              >
                Ücretsiz hesap aç <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-muted-foreground sm:px-10">
        Bilimle, sabırla, disiplinle. · PeakNET
      </footer>
    </div>
  );
}

// Statik ürün önizlemesi (gerçek UI'ı taklit eder)
function AppPreview() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-4 shadow-pop">
      {/* Geri sayım */}
      <div className="flex items-center justify-between rounded-2xl border border-orange-500/25 bg-gradient-to-r from-orange-500/12 to-transparent p-3.5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-500">
            YKS&apos;ye kalan
          </div>
          <div className="font-display text-2xl font-bold tabular-nums">28 gün</div>
        </div>
        <Flame size={28} className="text-orange-500 animate-ember" />
      </div>

      {/* Stat tiles */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { l: "Streak", v: "21" },
          { l: "Net", v: "+35" },
          { l: "Ustalık", v: "%62" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-background p-2.5 text-center">
            <div className="font-display text-lg font-bold tabular-nums">{s.v}</div>
            <div className="text-[10px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Günün görevleri */}
      <div className="mt-3 rounded-2xl border border-border bg-background p-3.5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">Bugünün görevleri</span>
          <span className="tabular-nums text-muted-foreground">3/4</span>
        </div>
        <div className="space-y-1.5 text-xs">
          {[
            ["Günlük hedefi tamamla", true],
            ["1 Pomodoro", true],
            ["AI ile pratik", true],
            ["Tarama testi çöz", false],
          ].map(([t, done]) => (
            <div key={t as string} className="flex items-center gap-2">
              <CheckCircle2
                size={14}
                className={done ? "text-emerald-500" : "text-muted-foreground/30"}
              />
              <span className={done ? "text-muted-foreground line-through" : ""}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-xs text-primary">
        <Sparkles size={14} /> AI öğretmen: &quot;Türev konusuna başlayalım mı?&quot;
      </div>
    </div>
  );
}
