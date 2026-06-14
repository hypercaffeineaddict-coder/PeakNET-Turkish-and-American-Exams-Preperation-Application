"use client";

import { useState } from "react";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function GenerateCardsModal({ lang }: { lang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-language-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, prompt, count: 10 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bilinmeyen bir hata oluştu.");

      setIsOpen(false);
      setPrompt("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
      >
        <Sparkles size={16} /> AI ile Kelime Üret
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold">Yeni Kelimeler Üret</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hangi konudaki veya hangi seviyedeki kelimelere çalışmak istediğinizi yazın.
              </p>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örn: Günlük hayatta restoranda sipariş verirken kullanılan B1 seviye kelimeler..."
                className="mt-4 h-24 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                disabled={isGenerating}
              />

              {error && (
                <p className="mt-2 text-sm text-rose-500">{error}</p>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/50 px-6 py-4">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-background"
                disabled={isGenerating}
              >
                İptal
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {isGenerating ? (
                  <><Loader2 size={16} className="animate-spin" /> Üretiliyor...</>
                ) : (
                  <><Sparkles size={16} /> Üret (10 Kart)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
