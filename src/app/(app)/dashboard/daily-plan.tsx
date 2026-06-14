"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import type { getDict } from "@/lib/i18n";

type PlanLabels = ReturnType<typeof getDict>["dashWidgets"]["plan"];

export function DailyPlanCard({
  aiReady,
  labels,
}: {
  aiReady: boolean;
  labels: PlanLabels;
}) {
  const [plan, setPlan] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (pending) return;
    setError(null);
    setPlan("");
    setPending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: labels.aiSystem },
            { role: "user", content: labels.aiUser },
          ],
        }),
      });
      if (!res.ok) {
        setError((await res.text()).slice(0, 200) || `HTTP ${res.status}`);
        setPending(false);
        return;
      }
      const text = await res.text();
      setPlan(text);
    } catch (err) {
      setError(String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="section rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-primary" />
          {labels.title}
        </h2>
        <button
          type="button"
          onClick={generate}
          disabled={pending || !aiReady}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs transition hover:bg-muted disabled:opacity-50 min-h-[44px]"
        >
          {pending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : plan ? (
            <RefreshCw size={12} />
          ) : (
            <Sparkles size={12} />
          )}
          {plan ? labels.regenerate : labels.generate}
        </button>
      </div>

      {!aiReady && !plan && (
        <p className="mt-3 text-xs text-muted-foreground">{labels.noAI}</p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-500">
          {error}
        </p>
      )}

      {plan ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{plan}</p>
      ) : (
        !error && (
          <p className="mt-3 text-sm text-muted-foreground">
            {labels.description} {aiReady && labels.cta}
          </p>
        )
      )}
    </section>
  );
}
