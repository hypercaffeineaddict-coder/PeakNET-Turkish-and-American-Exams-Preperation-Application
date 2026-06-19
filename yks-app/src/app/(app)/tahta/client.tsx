"use client";

import { useState } from "react";
import { Sparkles, Loader2, PencilRuler } from "lucide-react";
import { toast } from "sonner";
import { BoardCanvas } from "@/components/board-canvas";
import type { Board } from "@/lib/board";
import type { getDict } from "@/lib/i18n";

type Labels = ReturnType<typeof getDict>["drawingBoard"];
type Item = { id: number; prompt: string; explanation: string; board: Board };

export function TahtaClient({
  aiReady,
  labels,
}: {
  aiReady: boolean;
  labels: Labels;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  async function draw(text: string) {
    const p = text.trim();
    if (!p) return;
    if (!aiReady) {
      toast.error(labels.errNoAI);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      if (!res.ok) {
        toast.error((await res.text()).slice(0, 160));
        return;
      }
      const data = (await res.json()) as { explanation: string; board: Board };
      setItems((prev) => [
        { id: Date.now(), prompt: p, explanation: data.explanation, board: data.board },
        ...prev,
      ]);
      setPrompt("");
    } catch (e) {
      toast.error(labels.errDrawPrefix + String(e).slice(0, 120));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-end gap-2">
          <label className="flex-1 text-sm">
            <span className="text-xs text-muted-foreground">{labels.inputLabel}</span>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void draw(prompt);
                }
              }}
              placeholder={labels.inputPlaceholder}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <button
            type="button"
            onClick={() => void draw(prompt)}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {labels.drawBtn}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {labels.examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setPrompt(ex);
                void draw(ex);
              }}
              disabled={loading}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-10 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> {labels.drawing}
        </div>
      )}

      {items.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <PencilRuler size={36} className="mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">{labels.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {labels.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((it) => (
            <section key={it.id} className="space-y-2">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">&ldquo;{it.prompt}&rdquo;</span>
              </div>
              <BoardCanvas board={it.board} />
              {it.explanation && (
                <p className="rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm leading-relaxed">
                  {it.explanation}
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
