"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  RotateCcw,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { reviewCard } from "./actions";

type Card = {
  id: string;
  front: string;
  back: string;
  topic_name: string | null;
  subject_name: string | null;
};
type Deck = { topicName: string; subjectName: string; total: number; due: number };
type Subject = { id: string; name: string; topics: { id: string; name: string }[] };

const RATINGS = [
  { q: 2, label: "Tekrar", cls: "bg-rose-500/15 text-rose-500 hover:bg-rose-500/25" },
  { q: 3, label: "Zor", cls: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25" },
  { q: 4, label: "İyi", cls: "bg-sky-500/15 text-sky-500 hover:bg-sky-500/25" },
  { q: 5, label: "Kolay", cls: "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25" },
];

export function KartlarClient({
  due,
  totalCards,
  decks,
  subjects,
  aiReady,
}: {
  due: Card[];
  totalCards: number;
  decks: Deck[];
  subjects: Subject[];
  aiReady: boolean;
}) {
  const router = useRouter();
  const [queue, setQueue] = useState<Card[]>(due);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [pending, startTransition] = useTransition();

  // Üretim formu
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [count, setCount] = useState(8);
  const [generating, setGenerating] = useState(false);

  const topics = subjects.find((s) => s.id === subjectId)?.topics ?? [];
  const current = queue[idx];

  function rate(q: number) {
    if (!current) return;
    startTransition(async () => {
      await reviewCard(current.id, q);
      setQueue((prev) => {
        const next = [...prev];
        // "Tekrar" ise bu oturumda sona ekle
        if (q < 3) next.push(current);
        return next;
      });
      setFlipped(false);
      setIdx((i) => i + 1);
    });
  }

  async function generate() {
    if (!topicId) {
      toast.error("Önce konu seç.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, count }),
      });
      const text = await res.text();
      if (!res.ok) {
        toast.error(text || "Üretim başarısız");
      } else {
        const data = JSON.parse(text);
        toast.success(`${data.added} kart üretildi.`);
        router.refresh();
      }
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setGenerating(false);
    }
  }

  const reviewDone = idx >= queue.length;

  return (
    <div className="space-y-6">
      {/* Özet */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <Stat label="Bugün tekrar" value={String(queue.length - idx > 0 ? queue.length - idx : 0)} />
        <Stat label="Toplam kart" value={String(totalCards)} />
        <Stat label="Deste" value={String(decks.length)} />
      </div>

      {/* Tekrar modu */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <RotateCcw size={16} className="text-primary" />
          Bugünün tekrarı
        </h2>

        {queue.length === 0 ? (
          <p className="mt-4 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
            Bugün tekrar edilecek kart yok. Aşağıdan yeni kart üret veya yarın gel.
          </p>
        ) : reviewDone ? (
          <div className="mt-4 rounded-lg bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Bugünün tekrarını bitirdin! 🎉
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {current.subject_name} · {current.topic_name}
              </span>
              <span>{idx + 1}/{queue.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="flex min-h-[160px] w-full flex-col items-center justify-center rounded-xl border border-border bg-background p-6 text-center transition hover:border-primary/40"
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {flipped ? "Cevap" : "Soru"}
              </span>
              <span className="mt-2 text-base font-medium">
                {flipped ? current.back : current.front}
              </span>
              {!flipped && (
                <span className="mt-3 text-xs text-muted-foreground">
                  Çevirmek için tıkla
                </span>
              )}
            </button>

            {flipped && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {RATINGS.map((r) => (
                  <button
                    key={r.q}
                    type="button"
                    disabled={pending}
                    onClick={() => rate(r.q)}
                    className={`rounded-md px-2 py-2 text-sm font-medium transition disabled:opacity-50 ${r.cls}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Yeni kart üret */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-violet-500" />
          AI ile kart üret
        </h2>
        {!aiReady ? (
          <p className="mt-3 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
            AI bağlantısı yok — kart üretimi için yapılandırma gerekiyor.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="text-xs text-muted-foreground">Ders</span>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopicId("");
                }}
                className="mt-1 block w-44 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Seç…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-xs text-muted-foreground">Konu</span>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId}
                className="mt-1 block w-52 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="">Seç…</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-xs text-muted-foreground">Adet</span>
              <input
                type="number"
                min={4}
                max={15}
                value={count}
                onChange={(e) => setCount(Math.max(4, Math.min(15, Number(e.target.value) || 8)))}
                className="mt-1 block w-20 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <button
              type="button"
              onClick={generate}
              disabled={generating || !topicId}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {generating ? "Üretiliyor…" : "Üret"}
            </button>
          </div>
        )}
      </section>

      {/* Desteler */}
      {decks.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Layers size={16} className="text-primary" />
            Destelerim
          </h2>
          <ul className="mt-4 space-y-2">
            {decks.map((d) => (
              <li
                key={`${d.subjectName}-${d.topicName}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{d.topicName}</div>
                  <div className="truncate text-xs text-muted-foreground">{d.subjectName}</div>
                </div>
                {d.due > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {d.due} tekrar
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{d.total} kart</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
