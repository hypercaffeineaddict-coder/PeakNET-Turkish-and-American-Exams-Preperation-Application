"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  FlaskConical,
  Sparkles,
  LogOut,
  Clock,
  Languages,
  BarChart3,
  Camera,
  Menu,
  X,
  Settings,
  ScanLine,
  Trophy,
  Calculator,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  Layers,
  Timer,
  Wand2,
  Music,
  Share2,
  Target,
  Flag,
  PencilRuler,
  NotebookPen,
  Crown,
} from "lucide-react";
import { FocusPlayer } from "@/components/focus-player";
import { Logo } from "@/components/logo";

type NavItem = { href: string; label: string; icon: React.ElementType };

const navGroups: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [{ href: "/dashboard", label: "Genel bakış", icon: LayoutDashboard }],
  },
  {
    title: "Çalışma",
    items: [
      { href: "/hedef", label: "Hedef", icon: Flag },
      { href: "/panel", label: "Panel", icon: CalendarDays },
      { href: "/konular", label: "Konular", icon: ListChecks },
      { href: "/ustalik", label: "Ustalık", icon: GraduationCap },
      { href: "/program", label: "Program", icon: ClipboardList },
      { href: "/pomodoro", label: "Pomodoro", icon: Clock },
    ],
  },
  {
    title: "Ölç & pratik",
    items: [
      { href: "/soru-takibi", label: "Soru takibi", icon: Target },
      { href: "/denemeler", label: "Denemeler", icon: FlaskConical },
      { href: "/deneme-sim", label: "Deneme sim.", icon: Timer },
      { href: "/tarama", label: "Tarama testi", icon: ScanLine },
      { href: "/coz", label: "Soru çözücü", icon: Camera },
      { href: "/tahta", label: "Çizim tahtası", icon: PencilRuler },
      { href: "/notlar", label: "AI notlar", icon: NotebookPen },
      { href: "/soru-uret", label: "Soru üret", icon: Wand2 },
    ],
  },
  {
    title: "Tekrar",
    items: [
      { href: "/yanlislar", label: "Yanlış defteri", icon: BookOpen },
      { href: "/kartlar", label: "Tekrar kartları", icon: Layers },
    ],
  },
  {
    title: "İlerleme",
    items: [
      { href: "/rapor", label: "Haftalık koç", icon: Sparkles },
      { href: "/istatistikler", label: "İstatistikler", icon: BarChart3 },
      { href: "/basarimlar", label: "Başarımlar", icon: Trophy },
      { href: "/araclar", label: "YKS araçları", icon: Calculator },
      { href: "/asistan", label: "AI asistan", icon: Sparkles },
    ],
  },
  {
    title: "Ekstra",
    items: [
      { href: "/diller", label: "Diller", icon: Languages },
      { href: "/muzik", label: "Müzik", icon: Music },
      { href: "/satranc", label: "Satranç", icon: Crown },
      { href: "/paylas", label: "Paylaş", icon: Share2 },
      { href: "/ayarlar", label: "Ayarlar", icon: Settings },
    ],
  },
];

export function Sidebar({
  logoutAction,
}: {
  logoutAction: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Sayfa değişince mobile menüyü kapat
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC ile kapat
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Mobile hamburger (header'a fixed) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/90 text-foreground shadow-soft backdrop-blur transition hover:border-primary/40 lg:hidden"
        aria-label="Menüyü aç"
      >
        <Menu size={18} />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="group flex items-center gap-2.5">
            <Logo className="h-8 w-8 rounded-xl shadow-soft transition group-hover:scale-105" />
            <span className="font-display text-lg font-bold tracking-tight">
              Peak<span className="text-primary">NET</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-2">
          {navGroups.map((group, gi) => (
            <div key={gi} className="flex flex-col gap-0.5">
              {group.title && (
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                  {group.title}
                </div>
              )}
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-primary/12 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" />
                    )}
                    <Icon
                      size={17}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground transition group-hover:text-foreground"
                      }
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-3">
          <FocusPlayer />
        </div>

        <form action={logoutAction} className="border-t border-border p-3">
          <button
            type="submit"
            onClick={() => {
              // Cikista kimlikli sayfa cache'ini temizle (paylasilan cihaz gizliligi)
              if (typeof caches !== "undefined") {
                caches
                  .keys()
                  .then((keys) =>
                    keys
                      .filter((k) => k.includes("-pages"))
                      .forEach((k) => caches.delete(k)),
                  )
                  .catch(() => {});
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-rose-500/10 hover:text-rose-500"
          >
            <LogOut size={17} />
            Çıkış
          </button>
        </form>
      </aside>
    </>
  );
}
