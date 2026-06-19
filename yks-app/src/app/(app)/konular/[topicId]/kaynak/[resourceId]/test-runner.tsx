"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, BookOpen, Loader2, RotateCcw } from "lucide-react";

type Question = {
  stem: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
};

export function TestRunner({
  resourceId,
  topicId,
  questions,
}: {
  resourceId: string;
  topicId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    wrongCount: number;
    mistakesAdded: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = Object.keys(answers).length === questions.length;

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch(
        `/konular/${topicId}/kaynak/${resourceId}/submit-test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId, answers }),
        },
      );
      if (!res.ok) {
        alert("Submit hatası");
        return;
      }
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  }

  return (
    <div className="space-y-4">
      {result && (
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="font-display text-3xl font-bold tabular-nums">
                {result.score}
                <span className="text-base font-medium text-muted-foreground">
                  /{result.total}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">doğru cevap</p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                {result.score === result.total ? (
                  <span className="text-emerald-500">Mükemmel! 🎉</span>
                ) : result.score / result.total >= 0.7 ? (
                  <span className="text-emerald-500">Çok iyi 👏</span>
                ) : result.score / result.total >= 0.4 ? (
                  <span className="text-amber-500">Devam et 💪</span>
                ) : (
                  <span className="text-rose-500">Tekrar gerekiyor 📚</span>
                )}
              </p>
              {result.mistakesAdded > 0 && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen size={12} />
                  {result.mistakesAdded} yanlış otomatik olarak yanlış defterine eklendi
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-muted"
            >
              <RotateCcw size={12} /> Tekrar çöz
            </button>
            <a
              href="/yanlislar"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-sm text-amber-500 transition hover:bg-amber-500/10"
            >
              <BookOpen size={12} /> Yanlış defterine git
            </a>
          </div>
        </div>
      )}

      <ol className="space-y-4">
        {questions.map((q, i) => {
          const userAns = answers[i];
          const isCorrect = submitted && userAns === q.answer;
          const isWrong = submitted && userAns && userAns !== q.answer;
          return (
            <li
              key={i}
              className={`rounded-2xl border bg-card p-5 ${
                submitted
                  ? isCorrect
                    ? "border-emerald-500/40"
                    : isWrong
                      ? "border-rose-500/40"
                      : "border-border"
                  : "border-border"
              }`}
            >
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <p className="flex-1 whitespace-pre-wrap text-sm">{q.stem}</p>
                {submitted &&
                  (isCorrect ? (
                    <Check size={18} className="text-emerald-500" />
                  ) : isWrong ? (
                    <X size={18} className="text-rose-500" />
                  ) : null)}
              </div>

              <div className="grid gap-1.5 pl-9">
                {Object.entries(q.options).map(([letter, text]) => {
                  const selected = userAns === letter;
                  const showCorrect = submitted && letter === q.answer;
                  const showWrongPick =
                    submitted && userAns === letter && letter !== q.answer;
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, [i]: letter }))
                      }
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                        showCorrect
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : showWrongPick
                            ? "border-rose-500/40 bg-rose-500/10"
                            : selected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:bg-muted"
                      } disabled:cursor-default`}
                    >
                      <span className="font-semibold">{letter})</span>
                      <span className="flex-1">{text}</span>
                      {showCorrect && (
                        <Check size={14} className="text-emerald-500" />
                      )}
                      {showWrongPick && (
                        <X size={14} className="text-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <div className="mt-3 ml-9 rounded-lg bg-muted/40 p-3">
                  <p className="text-xs font-semibold text-foreground">
                    Çözüm
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {q.explanation}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {!submitted && (
        <div className="sticky bottom-20 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-pop lg:bottom-4">
          <div className="text-sm">
            <span className="font-semibold">{Object.keys(answers).length}</span>
            <span className="text-muted-foreground">/{questions.length} cevaplandı</span>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!allAnswered || submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {allAnswered ? "Cevapları gönder" : "Tüm soruları cevapla"}
          </button>
        </div>
      )}
    </div>
  );
}
