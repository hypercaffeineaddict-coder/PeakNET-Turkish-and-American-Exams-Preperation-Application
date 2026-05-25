import Link from "next/link";
import { Mountain, Flame, Sparkles, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const points = [
  { icon: Sparkles, text: "AI öğretmen, soru çözücü ve deneme simülasyonu" },
  { icon: TrendingUp, text: "Ustalık haritası: zayıf konunu gör, oraya yüklen" },
  { icon: Flame, text: "Streak, XP ve günlük görevlerle her gün devam et" },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* Brand panel (desktop) */}
      <aside className="bg-summit relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Mountain size={19} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Peak<span className="text-primary">NET</span>
          </span>
        </Link>

        <div className="relative space-y-8">
          <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight">
            Zirveye giden yol,
            <br />
            her gün bir adım.
          </h2>
          <ul className="space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={15} />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          Bilimle, sabırla, disiplinle. TYT · AYT · YDT.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* Compact brand mark (mobile) */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Mountain size={17} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Peak<span className="text-primary">NET</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
