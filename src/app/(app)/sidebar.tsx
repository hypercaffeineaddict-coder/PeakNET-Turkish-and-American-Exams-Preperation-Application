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
} from "lucide-react";
import { FocusPlayer } from "@/components/focus-player";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/konular", label: "Konular", icon: ListChecks },
  { href: "/pomodoro", label: "Pomodoro", icon: Clock },
  { href: "/denemeler", label: "Denemeler", icon: FlaskConical },
  { href: "/yanlislar", label: "Yanlış defteri", icon: BookOpen },
  { href: "/coz", label: "Soru çözücü", icon: Camera },
  { href: "/istatistikler", label: "İstatistikler", icon: BarChart3 },
  { href: "/asistan", label: "AI Asistan", icon: Sparkles },
  { href: "/diller", label: "Diller", icon: Languages },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
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
        className="fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm md:hidden"
        aria-label="Menüyü aç"
      >
        <Menu size={18} />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card p-4 transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">
              Peak<span className="text-primary">NET</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Menüyü kapat"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="-mx-4 mb-2 mt-2">
          <FocusPlayer />
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LogOut size={16} />
            Çıkış
          </button>
        </form>
      </aside>
    </>
  );
}
