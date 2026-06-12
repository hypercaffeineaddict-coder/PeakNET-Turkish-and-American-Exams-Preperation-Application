"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Sun, Moon, Monitor, Square, Minus, Circle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useThemeConfig, ThemeScheme, ThemeMode } from "@/components/theme-config";

const schemes: { value: ThemeScheme; label: string; color: string; preview: string }[] = [
  { value: "violet", label: "Violet", color: "bg-violet-500", preview: "oklch(0.72 0.16 285)" },
  { value: "blue", label: "Blue", color: "bg-blue-500", preview: "oklch(0.72 0.16 250)" },
  { value: "indigo", label: "Indigo", color: "bg-indigo-500", preview: "oklch(0.72 0.16 270)" },
  { value: "emerald", label: "Emerald", color: "bg-emerald-500", preview: "oklch(0.72 0.16 155)" },
  { value: "cyan", label: "Cyan", color: "bg-cyan-500", preview: "oklch(0.72 0.16 195)" },
  { value: "amber", label: "Amber", color: "bg-amber-500", preview: "oklch(0.72 0.16 55)" },
  { value: "orange", label: "Orange", color: "bg-orange-500", preview: "oklch(0.72 0.16 40)" },
  { value: "rose", label: "Rose", color: "bg-rose-500", preview: "oklch(0.72 0.16 10)" },
  { value: "fuchsia", label: "Fuchsia", color: "bg-fuchsia-500", preview: "oklch(0.72 0.16 320)" },
  { value: "slate", label: "Slate", color: "bg-slate-500", preview: "oklch(0.72 0.02 240)" },
];

const modes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const densities = [
  { value: "comfortable" as const, label: "Comfortable", icon: Square },
  { value: "compact" as const, label: "Compact", icon: Minus },
  { value: "spacious" as const, label: "Spacious", icon: Circle },
];

const radii = [
  { value: "none" as const, label: "None", preview: "rounded-none" },
  { value: "sm" as const, label: "Small", preview: "rounded-sm" },
  { value: "md" as const, label: "Medium", preview: "rounded-md" },
  { value: "lg" as const, label: "Large", preview: "rounded-lg" },
  { value: "xl" as const, label: "Extra Large", preview: "rounded-xl" },
  { value: "full" as const, label: "Full", preview: "rounded-full" },
];

export function ThemeSelector() {
  const { config, updateConfig, mounted } = useThemeConfig();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "mode" | "density" | "radius">("colors");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!mounted) {
    return <button className="h-9 w-9" aria-hidden="true" />;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef.current?.contains(event.target as Node) || contentRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "mode", label: "Mode", icon: Monitor },
    { id: "density", label: "Density", icon: Square },
    { id: "radius", label: "Radius", icon: Minus },
  ];

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="h-9 w-9 rounded-xl"
        aria-label="Theme settings"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Palette className="h-4 w-4" />
      </Button>

      {open && (
        <div
          ref={contentRef}
          className="fixed right-4 top-14 z-50 w-80 animate-fade-in lg:relative lg:fixed lg:top-auto lg:right-auto lg:z-auto flex flex-col gap-2"
        >
          <Card className="shadow-pop border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex gap-1 border-b border-border pb-3 mb-3">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    className="flex-1 gap-1 text-xs py-1.5"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {activeTab === "colors" && (
                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                  {schemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => updateConfig({ scheme: scheme.value })}
                      className={`relative aspect-square rounded-xl border-2 transition-all ${
                        config.scheme === scheme.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/40"
                      }`}
                      aria-label={scheme.label}
                      aria-pressed={config.scheme === scheme.value}
                    >
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{ background: scheme.preview }}
                      />
                      {config.scheme === scheme.value && (
                        <Check className="absolute inset-0 flex items-center justify-center text-white text-sm" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "mode" && (
                <div className="grid grid-cols-3 gap-2">
                  {modes.map((mode) => (
                    <Button
                      key={mode.value}
                      variant={config.mode === mode.value ? "default" : "outline"}
                      size="sm"
                      className="gap-2 py-2"
                      onClick={() => updateConfig({ mode: mode.value })}
                      aria-pressed={config.mode === mode.value}
                    >
                      <mode.icon className="h-4 w-4" />
                      <span className="capitalize">{mode.label}</span>
                    </Button>
                  ))}
                </div>
              )}

              {activeTab === "density" && (
                <div className="grid grid-cols-3 gap-2">
                  {densities.map((density) => (
                    <Button
                      key={density.value}
                      variant={config.density === density.value ? "default" : "outline"}
                      size="sm"
                      className="gap-2 py-2"
                      onClick={() => updateConfig({ density: density.value })}
                      aria-pressed={config.density === density.value}
                    >
                      <density.icon className="h-4 w-4" />
                      <span>{density.label}</span>
                    </Button>
                  ))}
                </div>
              )}

              {activeTab === "radius" && (
                <div className="grid grid-cols-3 gap-2">
                  {radii.map((radius) => (
                    <Button
                      key={radius.value}
                      variant={config.radius === radius.value ? "default" : "outline"}
                      size="sm"
                      className={`gap-2 py-2 ${radius.preview}`}
                      onClick={() => updateConfig({ radius: radius.value })}
                      aria-pressed={config.radius === radius.value}
                    >
                      <span className="w-6 h-6 border border-border rounded-md flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-md bg-primary ${radius.preview.replace("rounded-", "")}`} />
                      </span>
                      <span>{radius.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}