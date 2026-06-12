"use client";

import type { getDict } from "@/lib/i18n";
type Dict = ReturnType<typeof getDict>;

import { useState } from "react";
import { Sparkles, Loader2, FileDown, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/markdown";



const EXAMPLES = [
  "Türev Alma Kuralları",
  "Organik Kimya - Alkanlar",
  "Polinomlar - Bölme İşlemi",
  "Paragrafta Ana Düşünce",
  "Trigonometrik Özdeşlikler",
];

export function NotlarClient({ dict, aiReady }: { dict: any, aiReady: boolean }) {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<"kisa" | "detayli">("kisa");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  async function generate(text?: string) {
    const t = (text ?? topic).trim();
    if (!t) return;
    if (!aiReady) {
      toast.error(dict.noAiConnection);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, length }),
      });
      const txt = await res.text();
      if (!res.ok) {
        toast.error(txt.slice(0, 160));
        return;
      }
      setNotes(txt);
      setTitle(t);
    } catch (e) {
      toast.error("Hata: " + String(e).slice(0, 120));
    } finally {
      setLoading(false);
    }
  }

  function downloadPdf() {
    if (!notes) return;
    // Tarayıcının "PDF olarak kaydet" akışı — UTF-8 (Türkçe) sorunsuz çalışır.
    const original = document.title;
    document.title = `PeakNET — ${title} notu`;
    window.print();
    setTimeout(() => {
      document.title = original;
    }, 500);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5 no-print">
        <label className="text-sm">
          <span className="text-xs text-muted-foreground">{dict.inputLabel}</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void generate();
              }
            }}
            placeholder={dict.inputPlaceholder}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLength("kisa")}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                length === "kisa" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {dict.shortSummary}
            </button>
            <button
              type="button"
              onClick={() => setLength("detayli")}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                length === "detayli" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {dict.detailed}
            </button>
          </div>
          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading || !topic.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Notu çıkar
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setTopic(ex);
                void generate(ex);
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
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-10 text-sm text-muted-foreground no-print">
          <Loader2 size={16} className="animate-spin" /> {dict.preparing}
        </div>
      )}

      {!notes && !loading && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center no-print">
          <NotebookPen size={36} className="mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">{dict.waitingTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Konuyu yaz; AI sınava odaklı, başlıklı/maddeli bir çalışma notu
            hazırlasın. Hazırlandığında PDF olarak indirebilirsin.
          </p>
        </div>
      )}

      {notes && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="text-sm text-muted-foreground">
              Konu: <span className="font-medium text-foreground">{title}</span>
            </div>
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/40 hover:bg-muted"
            >
              <FileDown size={14} /> {dict.downloadPdf}
            </button>
          </div>

          <article className="print-area rounded-2xl border border-border bg-card p-6 sm:p-8">
            <header className="mb-3 border-b border-border pb-3">
              <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                PeakNET çalışma notu · {new Date().toLocaleDateString("tr-TR")}
              </p>
            </header>
            <Markdown text={notes} />
          </article>
        </>
      )}
    </div>
  );
}
