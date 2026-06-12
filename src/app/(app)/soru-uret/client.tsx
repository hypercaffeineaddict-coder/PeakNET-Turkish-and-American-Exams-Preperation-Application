"use client";

import type { getDict } from "@/lib/i18n";
type Dict = ReturnType<typeof getDict>;

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Subject = { id: string; name: string; topics: { id: string; name: string }[] };

export function SoruUretClient({ dict, subjects,
  aiReady,
}: { dict: any, subjects: Subject[];
  aiReady: boolean;
}) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);

  const topics = subjects.find((s) => s.id === subjectId)?.topics ?? [];

  async function generate() {
    if (!topicId) {
      toast.error(dict.selectSubjectAndTopicError);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/ai/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, count }),
      });
      const text = await res.text();
      if (!res.ok) {
        toast.error(text.slice(0, 160) || dict.generationFailed);
        return;
      }
      toast.success(dict.testGeneratedSuccess);
      router.push(`/konular/${topicId}?kaynak=test`);
    } catch {
      toast.error(dict.connectionError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles size={16} className="text-violet-500" />
        {dict.generateTestFromTopic}
      </h2>

      {!aiReady ? (
        <p className="mt-3 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
          {dict.aiNotReady}
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">{dict.subjectLabel}</span>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId("");
              }}
              className="mt-1 block w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">{dict.selectPlaceholder}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">{dict.topicLabel}</span>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={!subjectId}
              className="mt-1 block w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">{dict.selectPlaceholder}</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">{dict.questionLabel}</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-1 block w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {[3, 5, 7, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={generate}
            disabled={busy || !topicId}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {busy ? dict.generating : dict.generateTest}
          </button>
        </div>
      )}
    </section>
  );
}
