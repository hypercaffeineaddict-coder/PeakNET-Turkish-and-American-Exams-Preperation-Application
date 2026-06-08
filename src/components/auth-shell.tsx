import Link from "next/link";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import type { getDict } from "@/lib/i18n";

type AuthLabels = ReturnType<typeof getDict>["auth"];

const BRAND_ICONS = [Sparkles, TrendingUp, Flame];

export function AuthShell({
  title,
  subtitle,
  labels,
  children,
}: {
  title: string;
  subtitle: string;
  labels: AuthLabels;
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
          <Logo className="h-9 w-9 rounded-xl shadow-soft" />
          <span className="font-display text-xl font-bold tracking-tight">
            Peak<span className="text-primary">NET</span>
          </span>
        </Link>

        <div className="relative space-y-8">
          <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight">
            {labels.brandTagline1}
            <br />
            {labels.brandTagline2}
          </h2>
          <ul className="space-y-4">
            {labels.brandPoints.map((text, i) => {
              const Icon = BRAND_ICONS[i] ?? Sparkles;
              return (
                <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={15} />
                  </span>
                  <span className="pt-1">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">{labels.brandFooter}</p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* Compact brand mark (mobile) */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <Logo className="h-8 w-8 rounded-xl shadow-soft" />
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
