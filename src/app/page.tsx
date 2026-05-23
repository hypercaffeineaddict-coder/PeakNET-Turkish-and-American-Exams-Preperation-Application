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
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  { icon: Sparkles, title: "AI öğretmen", body: "Konuyu baştan anlatır, takıldıkça sorarsın; sesli de konuşabilirsin.", color: "text-violet-500" },
  { icon: Camera, title: "Soru çözücü", body: "Soruyu fotoğrafla, AI adım adım çözsün, yanlış defterine eklesin.", color: "text-sky-500" },
  { icon: Timer, title: "Deneme simülasyonu", body: "Süreli, çok dersli AI denemesi; net ve sonucun otomatik kaydedilir.", color: "text-rose-500" },
  { icon: Layers, title: "Tekrar kartları", body: "Aralıklı tekrar (SM-2) ile kalıcı öğren — AI konudan kart üretir.", color: "text-emerald-500" },
  { icon: GraduationCap, title: "Ustalık sistemi", body: "Her konuda hangi seviyedesin gör, zayıf konulara odaklan.", color: "text-amber-500" },
  { icon: Calculator, title: "YKS Araçları", body: "Net → tahmini puan ve sıralama; hedefin için gereken neti öğren.", color: "text-blue-500" },
  { icon: ScanLine, title: "Tarama testi", body: "Bir dersin tüm konularına yayılmış tanı testiyle eksiğini bul.", color: "text-cyan-500" },
  { icon: BookOpen, title: "Yanlış defteri", body: "Hatalarını kaydet, aralıklı tekrarla; bir daha şaşırma.", color: "text-fuchsia-500" },
  { icon: Flame, title: "Streak & rozetler", body: "Her gün çalış, seriyi büyüt; XP, seviye, rozet ve liderlik tablosu.", color: "text-orange-500" },
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
      {/* Arka plan ışıltıları */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float-soft" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl animate-float-soft anim-d3" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl animate-float-soft anim-d2" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">
            Peak<span className="text-primary">NET</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground">
            Giriş
          </Link>
          <Link href="/signup" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
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
            <h1 className="animate-fade-up anim-d1 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              YKS yolculuğunda
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-orange-500 bg-clip-text text-transparent bg-gradient-pan">
                her gün bir adım.
              </span>
            </h1>
            <p className="animate-fade-up anim-d2 max-w-xl text-base text-muted-foreground sm:text-lg">
              AI öğretmen, soru çözücü, deneme simülasyonu, tekrar kartları ve net→sıralama
              araçları tek yerde. Çalış, ölç, zayıf konuna odaklan — streak&apos;in seni terk etmesin.
            </p>
            <div className="animate-fade-up anim-d3 flex flex-wrap gap-3 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90"
              >
                Ücretsiz başla <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium transition hover:bg-muted"
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

          {/* Ürün önizleme mockup */}
          <div className="animate-fade-up anim-d2 lg:justify-self-end">
            <AppPreview />
          </div>
        </section>

        {/* Özellikler */}
        <section className="w-full max-w-6xl py-12">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Sınava giden her şey, tek uygulamada
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
            Konu takibinden AI öğretmene, denemeden sıralama tahminine kadar.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body, color }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted transition group-hover:scale-110">
                  <Icon size={20} className={color} />
                </div>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nasıl çalışır */}
        <section className="w-full max-w-5xl py-12">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            3 adımda başla
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
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
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-orange-500/10 p-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Bugün başla, ateşi söndürme.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Ücretsiz hesap aç, hedefini belirle, ilk Pomodoro&apos;nu başlat.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90"
            >
              Ücretsiz hesap aç <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-muted-foreground sm:px-10">
        Bilimle, sabırla, disiplinle. · PeakNET
      </footer>
    </div>
  );
}

// Stil amaçlı statik ürün önizlemesi (gerçek UI'ı taklit eder)
function AppPreview() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-primary/10">
      {/* Geri sayım */}
      <div className="flex items-center justify-between rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-transparent p-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-orange-500">
            YKS&apos;ye kalan
          </div>
          <div className="text-2xl font-bold">28 gün</div>
        </div>
        <Flame size={28} className="text-orange-500" />
      </div>

      {/* Stat tiles */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { l: "Streak", v: "21" },
          { l: "Net", v: "+35" },
          { l: "Ustalık", v: "%62" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-border bg-background p-2.5 text-center">
            <div className="text-lg font-bold">{s.v}</div>
            <div className="text-[10px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Günün görevleri */}
      <div className="mt-3 rounded-xl border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">Bugünün görevleri</span>
          <span className="text-muted-foreground">3/4</span>
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

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-violet-500/10 p-3 text-xs text-violet-500">
        <Sparkles size={14} /> AI öğretmen: &quot;Türev konusuna başlayalım mı?&quot;
      </div>
    </div>
  );
}
