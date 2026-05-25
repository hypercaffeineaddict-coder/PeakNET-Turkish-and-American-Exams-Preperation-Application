"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { celebrate } from "@/lib/celebrate";

export type BuiltinQuestion = {
  stem: string;
  options: Record<string, string>;
  answer: string;
  explanation?: string;
};

export function BuiltinTestClient({ questions }: { questions: BuiltinQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const net = Math.max(
    0,
    Math.round((correct - (Object.keys(answers).length - correct) / 4) * 100) / 100,
  );

  if (submitted) {
    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="text-sm text-muted-foreground">Sonuç</div>
          <div className="mt-1 font-display text-5xl font-bold tabular-nums text-primary">
            {correct}/{questions.length}
          </div>
          <div className="text-xs text-muted-foreground">doğru · net {net.toFixed(2)}</div>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="mt-4 rounded-lg border border-border px-5 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Tekrar çöz
          </button>
        </section>

        {questions.map((q, i) => {
          const a = answers[i];
          const ok = a === q.answer;
          return (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold">{i + 1}.</span>
                {a ? (
                  ok ? (
                    <CheckCircle2 size={15} className="text-emerald-500" />
                  ) : (
                    <XCircle size={15} className="text-rose-500" />
                  )
                ) : (
                  <span className="text-[10px] text-muted-foreground">boş</span>
                )}
              </div>
              <p className="text-sm">{q.stem}</p>
              <div className="mt-2 text-xs">
                <div className="text-emerald-500">
                  Doğru: {q.answer}) {q.options[q.answer]}
                </div>
                {a && !ok && (
                  <div className="text-rose-500">
                    Senin: {a}) {q.options[a]}
                  </div>
                )}
                {q.explanation && (
                  <p className="mt-1.5 text-muted-foreground">{q.explanation}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 text-sm font-semibold text-primary">{i + 1}.</div>
          <p className="text-sm leading-relaxed">{q.stem}</p>
          <div className="mt-3 space-y-1.5">
            {Object.entries(q.options)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, val]) => {
                const sel = answers[i] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAnswers((p) => ({ ...p, [i]: key }))}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      sel ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="font-semibold">{key})</span>
                    <span>{val}</span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          setSubmitted(true);
          celebrate();
        }}
        className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
      >
        Bitir ve sonucu gör ({answered}/{questions.length})
      </button>
    </div>
  );
}
