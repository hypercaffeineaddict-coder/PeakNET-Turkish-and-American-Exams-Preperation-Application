"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export function GenerateTestButton({
  topicId,
  aiReady,
}: {
  topicId: string;
  aiReady: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(5);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function generate() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/generate-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId, count }),
        });
        if (!res.ok) {
          const t = await res.text();
          setError(t.slice(0, 200) || `HTTP ${res.status}`);
          return;
        }
        router.refresh();
      } catch (err) {
        setError(String(err));
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Soru sayısı:
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2 py-1 text-foreground"
          >
            {[3, 5, 7, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={generate}
          disabled={pending || !aiReady}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-500 transition hover:bg-violet-500/15 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          AI ile test üret
        </button>
        {!aiReady && (
          <span className="text-[11px] text-muted-foreground">
            AI bağlı değil
          </span>
        )}
      </div>
      {pending && (
        <p className="text-[11px] text-muted-foreground">
          AI sorularını üretiyor (~30-60 saniye)...
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}
