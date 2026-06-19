"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addQuestionLog } from "./actions";
import { localDate } from "@/lib/dates";

type Subject = { name: string; color: string; topics: { id: string; name: string }[] };

export function AddLog({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const today = localDate();
  const [subject, setSubject] = useState(subjects[0]?.name ?? "");
  const [topicId, setTopicId] = useState("");
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [blank, setBlank] = useState(0);
  const [date, setDate] = useState(today);
  const [pending, startTransition] = useTransition();

  const topics = subjects.find((s) => s.name === subject)?.topics ?? [];
  const total = correct + wrong + blank;
  const net = Math.max(0, correct - wrong / 4);

  function submit() {
    if (total === 0) {
      toast.error("En az bir soru gir.");
      return;
    }
    const fd = new FormData();
    fd.set("subject", subject);
    if (topicId) fd.set("topic_id", topicId);
    fd.set("correct", String(correct));
    fd.set("wrong", String(wrong));
    fd.set("blank", String(blank));
    fd.set("log_date", date);
    startTransition(async () => {
      const res = await addQuestionLog(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${subject}: ${total} soru kaydedildi (net ${net.toFixed(2)}).`);
      setCorrect(0);
      setWrong(0);
      setBlank(0);
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">Çözdüğün soruları ekle</h2>
      <div className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">Ders</span>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setTopicId("");
              }}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {subjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {topics.length > 0 && (
            <label className="text-sm">
              <span className="text-xs text-muted-foreground">
                Konu <span className="text-muted-foreground/60">(seçersen ustalığa sayılır)</span>
              </span>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">— Konu seçmeden</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Num label="Doğru" accent="text-emerald-500" value={correct} onChange={setCorrect} />
          <Num label="Yanlış" accent="text-rose-500" value={wrong} onChange={setWrong} />
          <Num label="Boş" accent="text-muted-foreground" value={blank} onChange={setBlank} />
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">Tarih</span>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Toplam <span className="font-display font-bold tabular-nums text-foreground">{total}</span> soru ·
          net <span className="font-display font-bold tabular-nums text-primary">{net.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Kaydet
        </button>
      </div>
    </section>
  );
}

function Num({
  label,
  accent,
  value,
  onChange,
}: {
  label: string;
  accent: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="text-sm">
      <span className={`text-xs ${accent}`}>{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-center text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
