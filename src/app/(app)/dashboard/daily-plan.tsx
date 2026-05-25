"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

export function DailyPlanCard({ aiReady }: { aiReady: boolean }) {
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
            {
              role: "system",
              content: `Sen bir Türk lise öğrencisinin YKS koçusun. Aşağıdaki bağlamda kişisel günlük çalışma önerisi ver:
- 4-6 cümle. Konuşma diliyle, dostça ama net.
- Sabah/öğle/akşam 3 mini-blok öner (her biri 1 cümle).
- Hangi konuda Pomodoro önereceğini bir konu adı vererek söyle.
- Bir küçük motive edici cümleyle bitir.
- Liste/markdown kullanma; düz paragraf yaz.`,
            },
            {
              role: "user",
              content: "Bugün için günlük çalışma önerimi hazırla.",
            },
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
    <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-primary" />
          Günün önerisi
        </h2>
        <button
          type="button"
          onClick={generate}
          disabled={pending || !aiReady}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs transition hover:bg-muted disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : plan ? (
            <RefreshCw size={12} />
          ) : (
            <Sparkles size={12} />
          )}
          {plan ? "Yeniden öner" : "Plan oluştur"}
        </button>
      </div>

      {!aiReady && !plan && (
        <p className="mt-3 text-xs text-muted-foreground">
          AI bağlantısı yok. .env.local'da Gemini API key eklenmesi gerekiyor.
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-500">
          {error}
        </p>
      )}

      {plan ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
          {plan}
        </p>
      ) : (
        !error && (
          <p className="mt-3 text-sm text-muted-foreground">
            Profiline ve geçmiş çalışmana göre kişisel günlük plan üretir.{" "}
            {aiReady && '"Plan oluştur" düğmesine bas.'}
          </p>
        )
      )}
    </section>
  );
}
