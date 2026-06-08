"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { localDate } from "@/lib/dates";
import type { getDict } from "@/lib/i18n";

type Labels = ReturnType<typeof getDict>["weeklyCoach"];

function weekKey() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Pazartesi = 0
  d.setDate(d.getDate() - day);
  return `coach-${localDate(d)}`;
}

// **kalın** desteğiyle basit metin render
function renderRich(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-sm leading-relaxed">
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j} className="font-semibold text-foreground">
              {p.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{p}</span>
          ),
        )}
      </p>
    );
  });
}

export function Coach({ aiReady, labels }: { aiReady: boolean; labels: Labels }) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(weekKey());
      if (c) {
        setReport(c);
        setCached(true);
      }
    } catch {}
  }, []);

  async function generate() {
    if (!aiReady) {
      toast.error(labels.errNoAI);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/coach", { method: "POST" });
      const text = await res.text();
      if (!res.ok) {
        toast.error(text.slice(0, 160));
        return;
      }
      setReport(text);
      setCached(false);
      try {
        localStorage.setItem(weekKey(), text);
      } catch {}
    } catch (e) {
      toast.error(labels.errReportPrefix + String(e).slice(0, 120));
    } finally {
      setLoading(false);
    }
  }

  if (!report) {
    return (
      <div className="bg-summit relative overflow-hidden rounded-2xl border border-border p-8 text-center shadow-soft">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Sparkles size={22} />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">{labels.ctaTitle}</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            {labels.ctaDesc}
          </p>
          <button
            type="button"
            onClick={generate}
            disabled={loading || !aiReady}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-pop transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? labels.generatingBtn : labels.generateBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-primary" />
          {labels.reportTitle}
          {cached && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-normal text-muted-foreground">
              {labels.cachedTag}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          {labels.refreshBtn}
        </button>
      </header>
      <div className="space-y-1 text-foreground">{renderRich(report)}</div>
    </section>
  );
}
