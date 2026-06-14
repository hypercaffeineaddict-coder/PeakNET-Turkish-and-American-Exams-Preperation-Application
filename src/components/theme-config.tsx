"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeScheme = 
  | "violet"      // Default purple/violet
  | "blue"        // Professional blue
  | "emerald"     // Fresh green
  | "amber"       // Warm amber
  | "rose"        // Soft pink
  | "slate"       // Neutral slate
  | "indigo"      // Deep indigo
  | "orange"      // Vibrant orange
  | "cyan"        // Bright cyan
  | "fuchsia";    // Bold magenta

export type ThemeMode = "light" | "dark" | "system";

interface ThemeConfig {
  scheme: ThemeScheme;
  mode: ThemeMode;
  density: "comfortable" | "compact" | "spacious";
  radius: "none" | "sm" | "md" | "lg" | "xl" | "full";
}

const defaultConfig: ThemeConfig = {
  scheme: "violet",
  mode: "system",
  density: "comfortable",
  radius: "lg",
};

const storageKey = "peaknet-theme-config";

function getInitialConfig(): ThemeConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultConfig, ...parsed };
    }
  } catch {}
  return defaultConfig;
}

function applyTheme(config: ThemeConfig, isDark: boolean) {
  const root = document.documentElement;
  
  // Apply color scheme
  root.dataset.themeScheme = config.scheme;
  
  // Apply density
  root.dataset.density = config.density;
  
  // Apply radius
  root.dataset.radius = config.radius;
  
  // Update CSS custom properties based on scheme
  const schemes: Record<ThemeScheme, { light: Record<string, string>; dark: Record<string, string> }> = {
    violet: {
      light: {
        "--background": "oklch(0.985 0.004 285)",
        "--foreground": "oklch(0.21 0.02 285)",
        "--muted": "oklch(0.955 0.006 285)",
        "--muted-foreground": "oklch(0.42 0.02 285)",
        "--card": "oklch(0.997 0.002 285)",
        "--border": "oklch(0.905 0.008 285)",
        "--primary": "oklch(0.545 0.205 283)",
        "--primary-foreground": "oklch(0.99 0.005 285)",
        "--accent": "oklch(0.69 0.18 55)",
        "--ring": "oklch(0.545 0.205 283)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 285)",
        "--foreground": "oklch(0.96 0.005 285)",
        "--muted": "oklch(0.225 0.014 285)",
        "--muted-foreground": "oklch(0.75 0.018 285)",
        "--card": "oklch(0.197 0.014 285)",
        "--border": "oklch(0.29 0.015 285)",
        "--primary": "oklch(0.72 0.16 285)",
        "--primary-foreground": "oklch(0.17 0.02 285)",
        "--accent": "oklch(0.77 0.16 60)",
        "--ring": "oklch(0.72 0.16 285)",
      },
    },
    blue: {
      light: {
        "--background": "oklch(0.985 0.003 240)",
        "--foreground": "oklch(0.21 0.02 240)",
        "--muted": "oklch(0.955 0.005 240)",
        "--muted-foreground": "oklch(0.42 0.02 240)",
        "--card": "oklch(0.997 0.002 240)",
        "--border": "oklch(0.905 0.007 240)",
        "--primary": "oklch(0.545 0.205 250)",
        "--primary-foreground": "oklch(0.99 0.005 240)",
        "--accent": "oklch(0.69 0.18 200)",
        "--ring": "oklch(0.545 0.205 250)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 240)",
        "--foreground": "oklch(0.96 0.005 240)",
        "--muted": "oklch(0.225 0.014 240)",
        "--muted-foreground": "oklch(0.75 0.018 240)",
        "--card": "oklch(0.197 0.014 240)",
        "--border": "oklch(0.29 0.015 240)",
        "--primary": "oklch(0.72 0.16 250)",
        "--primary-foreground": "oklch(0.17 0.02 240)",
        "--accent": "oklch(0.77 0.16 200)",
        "--ring": "oklch(0.72 0.16 250)",
      },
    },
    emerald: {
      light: {
        "--background": "oklch(0.985 0.003 150)",
        "--foreground": "oklch(0.21 0.02 150)",
        "--muted": "oklch(0.955 0.005 150)",
        "--muted-foreground": "oklch(0.42 0.02 150)",
        "--card": "oklch(0.997 0.002 150)",
        "--border": "oklch(0.905 0.007 150)",
        "--primary": "oklch(0.545 0.205 155)",
        "--primary-foreground": "oklch(0.99 0.005 150)",
        "--accent": "oklch(0.69 0.18 120)",
        "--ring": "oklch(0.545 0.205 155)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 150)",
        "--foreground": "oklch(0.96 0.005 150)",
        "--muted": "oklch(0.225 0.014 150)",
        "--muted-foreground": "oklch(0.75 0.018 150)",
        "--card": "oklch(0.197 0.014 150)",
        "--border": "oklch(0.29 0.015 150)",
        "--primary": "oklch(0.72 0.16 155)",
        "--primary-foreground": "oklch(0.17 0.02 150)",
        "--accent": "oklch(0.77 0.16 120)",
        "--ring": "oklch(0.72 0.16 155)",
      },
    },
    amber: {
      light: {
        "--background": "oklch(0.985 0.003 85)",
        "--foreground": "oklch(0.21 0.02 85)",
        "--muted": "oklch(0.955 0.005 85)",
        "--muted-foreground": "oklch(0.42 0.02 85)",
        "--card": "oklch(0.997 0.002 85)",
        "--border": "oklch(0.905 0.007 85)",
        "--primary": "oklch(0.545 0.205 55)",
        "--primary-foreground": "oklch(0.99 0.005 85)",
        "--accent": "oklch(0.69 0.18 35)",
        "--ring": "oklch(0.545 0.205 55)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 85)",
        "--foreground": "oklch(0.96 0.005 85)",
        "--muted": "oklch(0.225 0.014 85)",
        "--muted-foreground": "oklch(0.75 0.018 85)",
        "--card": "oklch(0.197 0.014 85)",
        "--border": "oklch(0.29 0.015 85)",
        "--primary": "oklch(0.72 0.16 55)",
        "--primary-foreground": "oklch(0.17 0.02 85)",
        "--accent": "oklch(0.77 0.16 35)",
        "--ring": "oklch(0.72 0.16 55)",
      },
    },
    rose: {
      light: {
        "--background": "oklch(0.985 0.003 350)",
        "--foreground": "oklch(0.21 0.02 350)",
        "--muted": "oklch(0.955 0.005 350)",
        "--muted-foreground": "oklch(0.42 0.02 350)",
        "--card": "oklch(0.997 0.002 350)",
        "--border": "oklch(0.905 0.007 350)",
        "--primary": "oklch(0.545 0.205 10)",
        "--primary-foreground": "oklch(0.99 0.005 350)",
        "--accent": "oklch(0.69 0.18 330)",
        "--ring": "oklch(0.545 0.205 10)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 350)",
        "--foreground": "oklch(0.96 0.005 350)",
        "--muted": "oklch(0.225 0.014 350)",
        "--muted-foreground": "oklch(0.75 0.018 350)",
        "--card": "oklch(0.197 0.014 350)",
        "--border": "oklch(0.29 0.015 350)",
        "--primary": "oklch(0.72 0.16 10)",
        "--primary-foreground": "oklch(0.17 0.02 350)",
        "--accent": "oklch(0.77 0.16 330)",
        "--ring": "oklch(0.72 0.16 10)",
      },
    },
    slate: {
      light: {
        "--background": "oklch(0.985 0 0)",
        "--foreground": "oklch(0.21 0 0)",
        "--muted": "oklch(0.955 0 0)",
        "--muted-foreground": "oklch(0.42 0 0)",
        "--card": "oklch(0.997 0 0)",
        "--border": "oklch(0.905 0 0)",
        "--primary": "oklch(0.545 0.02 240)",
        "--primary-foreground": "oklch(0.99 0 0)",
        "--accent": "oklch(0.69 0.02 240)",
        "--ring": "oklch(0.545 0.02 240)",
      },
      dark: {
        "--background": "oklch(0.16 0 0)",
        "--foreground": "oklch(0.96 0 0)",
        "--muted": "oklch(0.225 0 0)",
        "--muted-foreground": "oklch(0.75 0 0)",
        "--card": "oklch(0.197 0 0)",
        "--border": "oklch(0.29 0 0)",
        "--primary": "oklch(0.72 0.02 240)",
        "--primary-foreground": "oklch(0.17 0 0)",
        "--accent": "oklch(0.77 0.02 240)",
        "--ring": "oklch(0.72 0.02 240)",
      },
    },
    indigo: {
      light: {
        "--background": "oklch(0.985 0.003 260)",
        "--foreground": "oklch(0.21 0.02 260)",
        "--muted": "oklch(0.955 0.005 260)",
        "--muted-foreground": "oklch(0.42 0.02 260)",
        "--card": "oklch(0.997 0.002 260)",
        "--border": "oklch(0.905 0.007 260)",
        "--primary": "oklch(0.545 0.205 270)",
        "--primary-foreground": "oklch(0.99 0.005 260)",
        "--accent": "oklch(0.69 0.18 240)",
        "--ring": "oklch(0.545 0.205 270)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 260)",
        "--foreground": "oklch(0.96 0.005 260)",
        "--muted": "oklch(0.225 0.014 260)",
        "--muted-foreground": "oklch(0.75 0.018 260)",
        "--card": "oklch(0.197 0.014 260)",
        "--border": "oklch(0.29 0.015 260)",
        "--primary": "oklch(0.72 0.16 270)",
        "--primary-foreground": "oklch(0.17 0.02 260)",
        "--accent": "oklch(0.77 0.16 240)",
        "--ring": "oklch(0.72 0.16 270)",
      },
    },
    orange: {
      light: {
        "--background": "oklch(0.985 0.003 50)",
        "--foreground": "oklch(0.21 0.02 50)",
        "--muted": "oklch(0.955 0.005 50)",
        "--muted-foreground": "oklch(0.42 0.02 50)",
        "--card": "oklch(0.997 0.002 50)",
        "--border": "oklch(0.905 0.007 50)",
        "--primary": "oklch(0.545 0.205 40)",
        "--primary-foreground": "oklch(0.99 0.005 50)",
        "--accent": "oklch(0.69 0.18 25)",
        "--ring": "oklch(0.545 0.205 40)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 50)",
        "--foreground": "oklch(0.96 0.005 50)",
        "--muted": "oklch(0.225 0.014 50)",
        "--muted-foreground": "oklch(0.75 0.018 50)",
        "--card": "oklch(0.197 0.014 50)",
        "--border": "oklch(0.29 0.015 50)",
        "--primary": "oklch(0.72 0.16 40)",
        "--primary-foreground": "oklch(0.17 0.02 50)",
        "--accent": "oklch(0.77 0.16 25)",
        "--ring": "oklch(0.72 0.16 40)",
      },
    },
    cyan: {
      light: {
        "--background": "oklch(0.985 0.003 195)",
        "--foreground": "oklch(0.21 0.02 195)",
        "--muted": "oklch(0.955 0.005 195)",
        "--muted-foreground": "oklch(0.42 0.02 195)",
        "--card": "oklch(0.997 0.002 195)",
        "--border": "oklch(0.905 0.007 195)",
        "--primary": "oklch(0.545 0.205 195)",
        "--primary-foreground": "oklch(0.99 0.005 195)",
        "--accent": "oklch(0.69 0.18 170)",
        "--ring": "oklch(0.545 0.205 195)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 195)",
        "--foreground": "oklch(0.96 0.005 195)",
        "--muted": "oklch(0.225 0.014 195)",
        "--muted-foreground": "oklch(0.75 0.018 195)",
        "--card": "oklch(0.197 0.014 195)",
        "--border": "oklch(0.29 0.015 195)",
        "--primary": "oklch(0.72 0.16 195)",
        "--primary-foreground": "oklch(0.17 0.02 195)",
        "--accent": "oklch(0.77 0.16 170)",
        "--ring": "oklch(0.72 0.16 195)",
      },
    },
    fuchsia: {
      light: {
        "--background": "oklch(0.985 0.003 315)",
        "--foreground": "oklch(0.21 0.02 315)",
        "--muted": "oklch(0.955 0.005 315)",
        "--muted-foreground": "oklch(0.42 0.02 315)",
        "--card": "oklch(0.997 0.002 315)",
        "--border": "oklch(0.905 0.007 315)",
        "--primary": "oklch(0.545 0.205 320)",
        "--primary-foreground": "oklch(0.99 0.005 315)",
        "--accent": "oklch(0.69 0.18 295)",
        "--ring": "oklch(0.545 0.205 320)",
      },
      dark: {
        "--background": "oklch(0.16 0.013 315)",
        "--foreground": "oklch(0.96 0.005 315)",
        "--muted": "oklch(0.225 0.014 315)",
        "--muted-foreground": "oklch(0.75 0.018 315)",
        "--card": "oklch(0.197 0.014 315)",
        "--border": "oklch(0.29 0.015 315)",
        "--primary": "oklch(0.72 0.16 320)",
        "--primary-foreground": "oklch(0.17 0.02 315)",
        "--accent": "oklch(0.77 0.16 295)",
        "--ring": "oklch(0.72 0.16 320)",
      },
    },
  };

  // Apply color scheme variables
  const colors = schemes[config.scheme][isDark ? "dark" : "light"];
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Apply density spacing multiplier
  const densityValues = {
    comfortable: "1",
    compact: "0.75",
    spacious: "1.25",
  };
  root.style.setProperty("--density", densityValues[config.density]);

  // Apply border radius
  const radiusValues = {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  };
  root.style.setProperty("--radius", radiusValues[config.radius]);
}

import { useTheme } from "next-themes";

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const initial = getInitialConfig();
    
    // Sync initial mode with next-themes if it differs
    if (initial.mode !== theme && initial.mode !== "system") {
      setTheme(initial.mode);
    }
    
    setConfig(initial);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(config, resolvedTheme === "dark");
    }
  }, [config, resolvedTheme, mounted]);

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem(storageKey, JSON.stringify(newConfig));
    if (updates.mode) {
      setTheme(updates.mode);
    }
  };

  const value = { config, updateConfig, mounted };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

const ThemeContext = createContext<{
  config: ThemeConfig;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
  mounted: boolean;
} | null>(null);

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeConfig must be used within a ThemeContextProvider");
  }
  return context;
}