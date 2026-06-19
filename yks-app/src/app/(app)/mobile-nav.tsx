"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Clock,
  FlaskConical,
  GraduationCap,
} from "lucide-react";
import type { getDict } from "@/lib/i18n";

type NavLabels = ReturnType<typeof getDict>["shell"]["nav"];

function items(labels: NavLabels) {
  return [
    { href: "/dashboard", label: labels.home, icon: LayoutDashboard },
    { href: "/konular", label: labels.topics, icon: ListChecks },
    { href: "/pomodoro", label: labels.focus, icon: Clock },
    { href: "/denemeler", label: labels.exam, icon: FlaskConical },
    { href: "/ustalik", label: labels.mastery, icon: GraduationCap },
  ];
}

// Mobil/tablet için alt sekme çubuğu — native uygulama hissi.
// Tam menü için kenar çubuğu (hamburger) hâlâ açılır.
export function MobileNav({
  labels,
  bottomNavLabel,
}: {
  labels: NavLabels;
  bottomNavLabel: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/85 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label={bottomNavLabel}
    >
      <div className="grid grid-cols-5">
        {items(labels).map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-2"
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-xl transition ${
                  isActive ? "bg-primary/12 text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span
                className={`text-[10px] font-medium transition ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
