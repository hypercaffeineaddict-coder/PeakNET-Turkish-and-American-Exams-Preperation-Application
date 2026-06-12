"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useThemeConfig } from "@/components/theme-config";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { config, updateConfig } = useThemeConfig();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const newMode = isDark ? "light" : "dark";
        setTheme(newMode);
        updateConfig({ mode: newMode });
      }}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:border-primary/40 hover:bg-muted"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}