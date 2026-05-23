"use client";

import { useState } from "react";
import {
  ScanLine,
  Loader2,
  Check,
  X,
  BookOpen,
  RotateCcw,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { saveTaramaWrongs } from "./actions";
import { celebrate } from "@/lib/celebrate";

type Subject = {
  id: string;
  name: string;
  exam_type: string;
  color: string | null;
  question_count: number | null;
};

type Question = {
  stem: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  topic: string;
};

export function TaramaClient({
  subjects,
  aiReady,
}: {
  subjects: Subject[];
  aiReady: boolean;
}) {
  const [subjectId, setSubjectId] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedWrongs, setSavedWrongs] = useState(false);

  // exam_type'a göre grupla
  const grouped = subjects.reduce<Record<string, Subject[]>>((acc, s) => {
    (acc[s.exam_type] ||= []).push(s);
    return acc;
  }, {});

  async function generate() {
    if (!subjectId) return;
    setLoading(true);
    setError(null);
    setQuestions(null);
    setAnswers({});
    setSubmitted(false);
    setSavedWrongs(false);
    try {
      const res = await fetch("/api/ai/generate-tarama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, count }),
      });
      if (!res.ok) {
        setError((await res.text()).slice(0, 200) || `HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      setQuestions(data.questions);
      setSubjectName(data.subjectName);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!questions) return;
    setSubmitted(true);
    celebrate();
    const correctCount = questions.filter((q, i) => answers[i] === q.answer).length;
    const wrongs = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => answers[i] && answers[i] !== q.answer)
      .map(({ q, i }) => ({
        stem: q.stem,
        topic: q.topic,
        myAnswer: `${answers[i]}) ${q.options[answers[i]] ?? ""}`,
        correctAnswer: `${q.answer}) ${q.options[q.answer] ?? ""}`,
        explanation: q.explanation,
      }));
    const res = await saveTaramaWrongs(subjectName, wrongs, correctCount);
    if (res.added > 0) {
      setSavedWrongs(true);
      toast.success(`${res.added} yanlış, yanlış defterine eklendi`);
    }
    if (res.xpGained > 0) {
      toast.success(`+${res.xpGained} XP kazandın! 🎉`);
    }
  }

  function reset() {
    setQuestions(null);
    setAnswers({});
    setSubmitted(false);
    setSavedWrongs(false);
  }

  // Sonuç: konu bazlı rapor
  const report = (() => {
    if (!questions || !submitted) return null;
    const byTopic = new Map<string, { correct: number; total: number }>();
    questions.forEach((q, i) => {
      const t = byTopic.get(q.topic) ?? { correct: 0, total: 0 };
      t.total++;
      if (answers[i] === q.answer) t.correct++;
      byTopic.set(q.topic, t);
    });
    const score = questions.filter((q, i) => answers[i] === q.answer).length;
    const weak = Array.from(byTopic.entries())
      .filter(([, v]) => v.correct < v.total)
      .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total);
    return { score, total: questions.length, byTopic, weak };
  })();

  // Henüz test üretilmediyse: kurulum ekranı
  if (!questions) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Ders</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Ders seç...</option>
              {Object.entries(grouped).map(([exam, subs]) => (
                <optgroup key={exam} label={exam}>
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.exam_type})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Soru sayısı</label>
            <div className="mt-1 flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`rounded-md border px-4 py-1.5 text-sm transition ${
                    count === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={!aiReady || loading || !subjectId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ScanLine size={16} />
            )}
            {loading ? "AI tarama testini hazırlıyor..." : "Tarama testini başlat"}
          </button>
          {loading && (
            <p className="text-center text-xs text-muted-foreground">
              ~30-60 saniye sürebilir.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Test çözme + sonuç
  return (
    <div className="space-y-4">
      {report && (
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold">
                {report.score}
                <span className="text-base text-muted-foreground">
                  /{report.total}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">{subjectName} tarama sonucu</p>
            </div>
            {savedWrongs && (
              <a
                href="/yanlislar"
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-500"
              >
                <BookOpen size={12} /> Yanlışlar deftere eklendi
              </a>
            )}
          </div>

          {report.weak.length > 0 ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-rose-500">
                <TrendingDown size={14} /> Zayıf konuların
              </div>
              <ul className="space-y-1.5">
                {report.weak.map(([topic, v]) => (
                  <li
                    key={topic}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <span>{topic}</span>
                    <span className="text-muted-foreground">
                      {v.correct}/{v.total} doğru
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-emerald-500">
              Tüm konularda başarılısın! 🎉
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-muted"
          >
            <RotateCcw size={12} /> Yeni tarama
          </button>
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
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {q.topic}
                </span>
              </div>
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
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
                  const showCorrect = submitted && letter === q.answer;
                  const showWrongPick =
                    submitted && userAns === letter && letter !== q.answer;
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: letter }))}
                      className={`flex items-start gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                        showCorrect
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : showWrongPick
                            ? "border-rose-500/40 bg-rose-500/10"
                            : userAns === letter
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:bg-muted"
                      } disabled:cursor-default`}
                    >
                      <span className="font-semibold">{letter})</span>
                      <span className="flex-1">{text}</span>
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <div className="mt-3 ml-9 rounded-md bg-muted/40 p-3">
                  <p className="text-xs font-semibold">Çözüm</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {q.explanation}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {!submitted && (
        <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg">
          <span className="text-sm">
            <span className="font-semibold">{Object.keys(answers).length}</span>
            <span className="text-muted-foreground">/{questions.length}</span>
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={Object.keys(answers).length !== questions.length}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Check size={14} /> Bitir ve sonucu gör
          </button>
        </div>
      )}
    </div>
  );
}
