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
  Zap,
  Shield,
  Brain,
  Target,
  Users,
  Trophy,
  Palette,
  Code,
  Wand2,
  Globe,
  MousePointerClick,
  BarChart2,
  Music,
  Crown,
  Heart,
  Star,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import { PRIMARY_EXAM_DATE, daysUntil } from "@/data/exam-date";

const featureStyles = [
  { icon: Camera, color: "text-sky-500", bg: "bg-sky-500/10", iconBg: "text-sky-500" },
  { icon: Timer, color: "text-rose-500", bg: "bg-rose-500/10", iconBg: "text-rose-500" },
  { icon: Layers, color: "text-emerald-500", bg: "bg-emerald-500/10", iconBg: "text-emerald-500" },
  { icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-500/10", iconBg: "text-amber-500" },
  { icon: Calculator, color: "text-primary", bg: "bg-primary/10", iconBg: "text-primary" },
  { icon: ScanLine, color: "text-cyan-500", bg: "bg-cyan-500/10", iconBg: "text-cyan-500" },
  { icon: BookOpen, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", iconBg: "text-fuchsia-500" },
  { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", iconBg: "text-orange-500" },
];

const trustIndicators = [
  { icon: Shield, label: "Güvenli Veri", desc: "Verilerin şifrelendi" },
  { icon: Brain, label: "AI Destekli", desc: "7/24 özel öğretmen" },
  { icon: Users, label: "Topluluk", desc: "Binlerce öğrenci" },
  { icon: Trophy, label: "Başarı Odaklı", desc: "Net → Sıralama" },
  { icon: Globe, label: "Çevrimdışı", desc: "İnternetsiz çalış" },
  { icon: Star, label: "Ücretsiz", desc: "Sınırsız erişim" },
];

const statIcons: Record<string, LucideIcon> = {
  topics: BookOpen,
  ai: Sparkles,
  exam: Calculator,
  offline: Globe,
  flashcards: Layers,
  mastery: GraduationCap,
  streak: Flame,
  rank: Target,
  languages: Crown,
  music: Music,
  chess: Crown,
  timer: Timer,
};

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
  bg,
  iconBg,
  index,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  bg: string;
  iconBg: string;
  index: number;
}) {
  return (
    <div
      key={title}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] animate-fade-up ${bg}`}
      style={{ animationDelay: `${0.08 * (index + 1)}s` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${bg} ${iconBg} transition-transform duration-500 group-hover:scale-110`}>
          <Icon size={24} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{desc}</p>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-1/2 transition-all duration-500">
        <ArrowRight size={18} className="text-primary" />
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, label, desc }: { icon: LucideIcon; label: string; desc: string }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
        <Icon size={18} />
      </span>
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, value, label, color, index }: { icon: LucideIcon; value: string; label: string; color: string; index: number }) {
  return (
    <div
      className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-soft animate-fade-up"
      style={{ animationDelay: `${0.06 * (index + 1)}s` }}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={22} />
      </div>
      <div className="font-display text-2xl font-bold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground text-center max-w-[80px]">{label}</div>
    </div>
  );
}

function AppPreview({ copy, daysToYks }: { copy: ReturnType<typeof getDict>["landing"]; daysToYks: number }) {
  return (
    <div className="relative animate-fade-up anim-d2">
      <div className="absolute inset-0 bg-summit/50 -z-10" />
      <div className="absolute inset-0 bg-grid/30 -z-10" />

      <div className="relative w-full max-w-md mx-auto rounded-3xl border border-border bg-card/80 p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-transparent to-orange-500/15 p-3.5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{copy.countdownLabel}</div>
            <div className="font-display text-3xl font-bold tabular-nums text-foreground">{daysToYks} {copy.days}</div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-primary-foreground shadow-[0_0_30px_rgba(249,115,22,0.4)]">
            <Flame size={28} className="animate-ember" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { l: "Streak", v: "21", icon: Flame, color: "text-orange-500" },
            { l: "Net Artışı", v: "+35", icon: Target, color: "text-emerald-500" },
            { l: "Ustalık", v: "%62", icon: GraduationCap, color: "text-amber-500" },
          ].map((s, i) => (
            <div key={s.l} className="group relative rounded-xl border border-border bg-background p-3 text-center">
              <div className={`flex h-8 w-8 mx-auto items-center justify-center rounded-lg ${s.color} transition-transform duration-300 group-hover:scale-110`}>
                <s.icon size={16} />
              </div>
              <div className="mt-2 font-display text-xl font-bold tabular-nums">{s.v}</div>
              <div className="text-[10px] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">{copy.tasksTitle}</span>
            <span className="tabular-nums text-primary font-medium">3/4</span>
          </div>
          <div className="space-y-2 text-xs">
            {copy.tasks.map((task, index) => {
              const done = index < 3;
              return (
                <div
                  key={task}
                  className="group flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border transition-colors">
                    {done && <CheckCircle2 size={10} className="text-emerald-500" />}
                  </div>
                  <span className={`flex-1 truncate transition-colors ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{task}</span>
                  {done && <span className="text-[10px] text-emerald-500 font-medium">Tamam</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 p-3 text-xs text-primary">
          <Sparkles size={14} />
          <span className="font-medium">AI Önerisi: </span>
          <span className="text-muted-foreground">{copy.aiPrompt}</span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>Kart almacak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>Deneme simülasyonu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>AI öğretmen</span>
        </div>
      </div>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-summit" />
      <div className="absolute inset-x-0 top-0 h-[700px] bg-grid/40" />

      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[150px] animate-float-soft" style={{ animationDelay: "0s" }} />
      <div className="absolute top-1/3 right-1/5 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[150px] animate-float-soft" style={{ animationDelay: "-2s" }} />
      <div className="absolute bottom-1/4 left-1/3 h-[200px] w-[200px] rounded-full bg-orange-500/10 blur-[150px] animate-float-soft" style={{ animationDelay: "-4s" }} />

      <svg className="absolute inset-0 -z-10 opacity-30" viewBox="0 0 1440 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.545 0.205 283)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.69 0.18 55)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="url(#gridGradient)" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#gridPattern)" />
        <mask id="fadeMask">
          <rect width="100%" height="100%" fill="url(#fadeGradient)" />
        </mask>
        <defs>
          <linearGradient id="fadeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="black" />
            <stop offset="70%" stopColor="black" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default async function LandingPage() {
  const locale = await getLocaleFromCookies();
  const t = getDict(locale);
  const daysToYks = Math.max(0, daysUntil(PRIMARY_EXAM_DATE));
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
      <AnimatedBackground />

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-transparent px-4 sm:px-6 lg:px-8 xl:px-10 py-4 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5" aria-label="PeakNET Ana Sayfa">
          <Logo className="h-9 w-9 rounded-xl shadow-soft" />
          <span className="font-display text-xl font-bold tracking-tight">
            Peak<span className="text-primary">NET</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex"
          >
            {t.landing.login}
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/80 px-6 py-3 text-base font-bold text-primary-foreground shadow-[0_8px_25px_-4px_rgba(106,79,214,0.4)] transition hover:opacity-90 hover:shadow-[0_12px_30px_-4px_rgba(106,79,214,0.5)] active:scale-[0.98] min-h-[44px]"
          >
            <Sparkles size={16} />
            {t.landing.start}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-10">
        <section className="section mx-auto grid w-full max-w-7xl items-start gap-8 lg:gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-8">
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Flame size={12} className="animate-ember" />
              {t.landing.pill}
            </span>

            <h1 className="animate-fade-up anim-d1 font-display text-5xl font-bold leading-[1.02] tracking-tighter text-balance sm:text-6xl lg:text-7xl">
              {t.landing.title1}
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {t.landing.title2}
              </span>
            </h1>

            <p className="animate-fade-up anim-d2 max-w-xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
              {t.landing.subtitle}
            </p>

            <div className="animate-fade-up anim-d3 flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/80 px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_8px_25px_-4px_rgba(106,79,214,0.35)] transition hover:opacity-90 hover:shadow-[0_12px_30px_-4px_rgba(106,79,214,0.45)] active:scale-[0.98] min-h-[48px]"
              >
                {t.landing.freeStart}
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-8 py-4 text-base font-medium backdrop-blur-sm transition hover:border-primary/40 hover:bg-card hover:shadow-soft min-h-[48px]"
              >
                {t.landing.signIn}
              </Link>
            </div>

            <div className="animate-fade-up anim-d4 flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm text-muted-foreground">
              {t.landing.proofs.map((proof, i) => (
                <span key={proof} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  {proof}
                </span>
              ))}
            </div>
          </div>

          <AppPreview copy={t.landing} daysToYks={daysToYks} />
        </section>

        <section className="section">
          <div className="text-center max-w-3xl mx-auto section-title animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Sparkles size={12} /> Sınava Giden Her Şey, Tek Uygulamada
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t.landing.sectionTitle}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t.landing.sectionBody}</p>
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="bg-summit/50 relative overflow-hidden rounded-3xl border border-primary/10 p-1 sm:p-2 lg:p-3">
              <div className="bg-grid/30 pointer-events-none absolute inset-0" />
              <div className="section-grid relative grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                {t.features.map(([title, desc], index) => (
                  <FeatureCard
                    key={title}
                    icon={featureStyles[index].icon}
                    title={title}
                    desc={desc}
                    color={featureStyles[index].color}
                    bg={featureStyles[index].bg}
                    iconBg={featureStyles[index].iconBg}
                    index={index}
                  />
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex gap-2 lg:hidden">
              <span className="text-[10px] font-medium text-primary">Kaydır</span>
              <MousePointerClick size={18} className="text-primary animate-bounce" />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="text-center max-w-3xl mx-auto section-title animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Wand2 size={12} /> 3 Adımda Başla
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t.landing.howTitle}
            </h2>
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent lg:top-[38%] hidden lg:block" />

            <div className="section-grid relative grid grid-cols-1 gap-6 lg:grid-cols-3">
              {t.steps.map(([n, title, body], index) => (
                <div
                  key={n}
                  className="relative animate-fade-up group z-10 rounded-3xl border border-border bg-card/50 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]"
                  style={{ animationDelay: `${0.12 * (index + 1)}s` }}
                >
                  <div className="mb-5 flex items-center justify-center">
                    <div className="relative flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="font-display text-3xl font-bold text-primary">{n}</span>
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse`} />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-center">{title}</h3>
                  <p className="mt-3 text-center text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="text-center max-w-3xl mx-auto section-title animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Shield size={12} /> Neden PeakNET?
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Binlerce Öğrencinin Tercih Ettiği Nedenler
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Sadece bir uygulama değil, YKS yolculuğundaki en güvenilir arkadaşın.
            </p>
          </div>

          <div className="section-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {trustIndicators.map((item, index) => (
              <TrustBadge key={item.label} icon={item.icon} label={item.label} desc={item.desc} />
            ))}
          </div>
        </section>

        <section className="section">
          <div className="text-center max-w-3xl mx-auto section-title animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <BarChart2 size={12} /> Gerçek Sonuçlar
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Özellikler Sayılarla
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Her gün binlerce öğrenci PeakNET ile hedeflerine yaklaşıyor.
            </p>
          </div>

          <div className="section-grid grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatItem icon={BookOpen} value="150+" label="Müfredat Konusu" color="bg-sky-500/10 text-sky-500" index={0} />
            <StatItem icon={Sparkles} value="100K+" label="AI Sohbeti" color="bg-primary/10 text-primary" index={1} />
            <StatItem icon={Calculator} value="500K+" label="Soru Çözümü" color="bg-emerald-500/10 text-emerald-500" index={2} />
            <StatItem icon={Flame} value="95%" label="Streak Koruma" color="bg-orange-500/10 text-orange-500" index={3} />
            <StatItem icon={Layers} value="200K+" label="Kart Çevrildi" color="bg-amber-500/10 text-amber-500" index={4} />
            <StatItem icon={GraduationCap} value="50K+" label="Ustalık Artışı" color="bg-fuchsia-500/10 text-fuchsia-500" index={5} />
            <StatItem icon={Target} value="10K+" label="Hedef Belirlendi" color="bg-rose-500/10 text-rose-500" index={6} />
            <StatItem icon={Crown} value="99%" label="Memnuniyet" color="bg-cyan-500/10 text-cyan-500" index={7} />
          </div>
        </section>

        <section className="section">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-1">
            <div className="bg-grid/30 pointer-events-none absolute inset-0" />
            <div className="relative rounded-2xl bg-card/80 p-10 sm:p-14 lg:p-20 text-center backdrop-blur-xl">
              <div className="mx-auto max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
                  <Flame size={12} className="animate-ember" /> Bugün Başla, Ateşi Söndürme
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {t.landing.finalTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                  {t.landing.finalBody}
                </p>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/80 px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_8px_25px_-4px_rgba(106,79,214,0.35)] transition hover:opacity-90 hover:shadow-[0_12px_30px_-4px_rgba(106,79,214,0.45)] active:scale-[0.98] min-h-[48px]"
                >
                  {t.landing.createAccount}
                  <ArrowRight size={20} />
                </Link>
                <p className="mt-6 text-sm text-muted-foreground">
                  Kredi kartı gerekmez · İstediğin an çıkabilirsin · Verilerin senin
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 px-4 sm:px-6 lg:px-8 xl:px-10 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5" aria-label="PeakNET Ana Sayfa">
                <Logo className="h-8 w-8 rounded-xl shadow-soft" />
                <span className="font-display text-lg font-bold tracking-tight">
                  Peak<span className="text-primary">NET</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t.landing.footer}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="#" className="text-muted-foreground transition hover:text-primary" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 9.72-1.92 1.92-8.502-9.72-7.227 8.26h-3.308l7.227-8.26-8.502-9.72 1.92-1.92 8.502 9.72 7.227-8.26Z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground transition hover:text-primary" aria-label="GitHub">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground transition hover:text-primary" aria-label="Discord">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.38-.426.77-.613 1.173a19.276 19.276 0 0 0-5.454 0 .077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.061.061 0 0 0-.047.097c.17 3.984 1.39 7.392 4.292 8.993.064.037.133.06.202.073l.666.318a.07.07 0 0 0 .075-.015c.327-.39.877-.847 1.487-1.143a.077.077 0 0 1 .103-.006h.008c1.067.94 2.492.94 3.543 0 .545.313 1.123.795 1.49 1.19.035.042.067.073.1.1l.666-.316a.07.07 0 0 1 .08.016 27.64 27.64 0 0 0 1.49 1.19h.008a.075.075 0 0 1 .103.006c.61.346 1.16.803 1.487 1.193l.665.318a.07.07 0 0 0 .1-.1l-.005-.017c2.892-1.594 4.122-5.026 4.298-9.045a.062.062 0 0 0-.033-.108ZM8.94 12.618a4.982 4.982 0 0 1-.546-2.297l-.038-.1-3.095-.386.834-3.573a.37.37 0 0 1 .568-.128l2.25 2.454c1.85-.564 3.673-.686 5.302-.696.424-.003.848.037 1.253.12l2.32-2.146a.37.37 0 0 1 .577-.02l2.574 2.502.833 3.407-3.26.35a4.932 4.932 0 0 1-.512 2.41l-.04.098-1.208 2.827a1.023 1.023 0 0 1-1.526.368l-2.367-1.146a6.37 6.37 0 0 0-1.88-.966c-.574-.037-1.12-.12-1.61-.252l-2.22 1.09.78 3.3a.365.365 0 0 1-.48.495l-2.676-.437a.375.375 0 0 1-.235-.556l.94-3.383-1.304-.789a.99.99 0 0 1-.509-1.007l.054-.268Zm6.372 3.592a.91.91 0 0 1-.416.154c-.358 0-.687-.328-.687-.743 0-.43.342-.747.718-.747h.01v-.36c0-.55-.387-.984-.893-.984-.513 0-.89.43-.89.984v.361h.011c.364 0 .697.33.706.774Z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Ürün</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/konular" className="text-muted-foreground transition hover:text-primary">Konu Takibi</Link></li>
                <li><Link href="/asistan" className="text-muted-foreground transition hover:text-primary">AI Asistan</Link></li>
                <li><Link href="/denemeler" className="text-muted-foreground transition hover:text-primary">Deneme Simülasyonu</Link></li>
                <li><Link href="/yanlislar" className="text-muted-foreground transition hover:text-primary">Yanlış Defteri</Link></li>
                <li><Link href="/kartlar" className="text-muted-foreground transition hover:text-primary">Tekrar Kartları</Link></li>
                <li><Link href="/ustalik" className="text-muted-foreground transition hover:text-primary">Ustalık Haritası</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Araçlar</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/coz" className="text-muted-foreground transition hover:text-primary">Soru Çözücü</Link></li>
                <li><Link href="/hedef" className="text-muted-foreground transition hover:text-primary">Hedef & Sıralama</Link></li>
                <li><Link href="/pomodoro" className="text-muted-foreground transition hover:text-primary">Pomodoro</Link></li>
                <li><Link href="/program" className="text-muted-foreground transition hover:text-primary">Çalışma Programı</Link></li>
                <li><Link href="/notlar" className="text-muted-foreground transition hover:text-primary">AI Notlar</Link></li>
                <li><Link href="/araclar" className="text-muted-foreground transition hover:text-primary">YKS Hesaplayıcılar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Ekstra</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/satranc" className="text-muted-foreground transition hover:text-primary">Satranç</Link></li>
                <li><Link href="/diller" className="text-muted-foreground transition hover:text-primary">Diller</Link></li>
                <li><Link href="/yurtdisi" className="text-muted-foreground transition hover:text-primary">Yurtdışı</Link></li>
                <li><Link href="/muzik" className="text-muted-foreground transition hover:text-primary">Müzik</Link></li>
                <li><Link href="/tahta" className="text-muted-foreground transition hover:text-primary">Çizim Tahtası</Link></li>
                <li><Link href="/paylas" className="text-muted-foreground transition hover:text-primary">Paylaş</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} PeakNET. Bilimle, sabırla, disiplinle.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="transition hover:text-primary">Gizlilik</Link>
              <Link href="/terms" className="transition hover:text-primary">Kullanım</Link>
              <Link href="/cookies" className="transition hover:text-primary">Çerezler</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}