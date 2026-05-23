"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Timer as TimerIcon,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { saveMockExam } from "./actions";
import { celebrate } from "@/lib/celebrate";

type Question = {
  stem: string;
  options: Record<string, string>;
  answer: string;
  subjectId: string;
};
type SubjectMeta = { id: string; name: string };

const SECONDS_PER_Q = 75;

export function DenemeSimClient({ aiReady }: { aiReady: boolean }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"setup" | "running" | "result">("setup");
  const [examType, setExamType] = useState<"TYT" | "AYT">("AYT");
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<SubjectMeta[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  const subjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ?? id;

  const finish = useCallback(async () => {
    if (finishedRef.current) return; // çift kayıt koruması (süre bitişi + Bitir)
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    // Skor hesapla — ders bazlı d/y/b/net
    const totals: Record<string, { d: number; y: number; b: number; net: number }> = {};
    questions.forEach((q, i) => {
      const sid = q.subjectId;
      if (!totals[sid]) totals[sid] = { d: 0, y: 0, b: 0, net: 0 };
      const a = answers[i];
      if (!a) totals[sid].b++;
      else if (a === q.answer) totals[sid].d++;
      else totals[sid].y++;
    });
    for (const sid of Object.keys(totals)) {
      const t = totals[sid];
      t.net = Math.max(0, Math.round((t.d - t.y / 4) * 100) / 100);
    }
    setPhase("result");
    celebrate("big");
    const res = await saveMockExam(examType, totals);
    if (res?.ok) {
      toast.success("Deneme sonucu denemelerine kaydedildi.");
      router.refresh();
    } else if (res?.error) {
      toast.error(`Kayıt: ${res.error}`);
    }
  }, [questions, answers, examType, router]);

  // Geri sayım
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, finish]);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType }),
      });
      const text = await res.text();
      if (!res.ok) {
        toast.error(text || "Üretim başarısız");
        return;
      }
      const data = JSON.parse(text) as {
        questions: Question[];
        subjects: SubjectMeta[];
      };
      setQuestions(data.questions);
      setSubjects(data.subjects);
      setAnswers({});
      finishedRef.current = false;
      setTimeLeft(data.questions.length * SECONDS_PER_Q);
      setPhase("running");
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  // ---- SETUP ----
  if (phase === "setup") {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">Deneme türü</h2>
        <div className="mt-3 flex gap-2">
          {(["TYT", "AYT"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setExamType(t)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                examType === t
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          AI, {examType} derslerinden çok-dersli kısa bir deneme üretir. Süre soru
          başına ~{SECONDS_PER_Q} sn. Bitince netin denemelerine kaydedilir.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={!aiReady || loading}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {loading ? "Üretiliyor…" : "Deneme oluştur"}
        </button>
      </section>
    );
  }

  // ---- RUNNING ----
  if (phase === "running") {
    const answered = Object.keys(answers).length;
    const mm = Math.floor(timeLeft / 60);
    const ss = String(timeLeft % 60).padStart(2, "0");
    const low = timeLeft <= 60;
    return (
      <div className="space-y-4">
        <div className="sticky top-2 z-10 flex items-center justify-between rounded-2xl border border-border bg-card/95 px-5 py-3 backdrop-blur">
          <span className="text-sm text-muted-foreground">
            {answered}/{questions.length} işaretli
          </span>
          <span
            className={`flex items-center gap-1.5 font-mono text-lg font-semibold ${low ? "text-rose-500" : "text-foreground"}`}
          >
            <TimerIcon size={16} />
            {mm}:{ss}
          </span>
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Flag size={14} /> Bitir
          </button>
        </div>

        {questions.map((q, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-primary">{i + 1}.</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {subjectName(q.subjectId)}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{q.stem}</p>
            <div className="mt-3 space-y-1.5">
              {Object.entries(q.options)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, val]) => {
                  const selected = answers[i] === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [i]: key }))}
                      className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/40"
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
          onClick={finish}
          className="w-full rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
        >
          Bitir ve sonucu gör
        </button>
      </div>
    );
  }

  // ---- RESULT ----
  const perSubject: Record<string, { d: number; y: number; b: number; net: number }> = {};
  questions.forEach((q, i) => {
    const sid = q.subjectId;
    if (!perSubject[sid]) perSubject[sid] = { d: 0, y: 0, b: 0, net: 0 };
    const a = answers[i];
    if (!a) perSubject[sid].b++;
    else if (a === q.answer) perSubject[sid].d++;
    else perSubject[sid].y++;
  });
  for (const sid of Object.keys(perSubject)) {
    const t = perSubject[sid];
    t.net = Math.max(0, Math.round((t.d - t.y / 4) * 100) / 100);
  }
  const totalNet = Object.values(perSubject).reduce((a, t) => a + t.net, 0);
  const totalCorrect = Object.values(perSubject).reduce((a, t) => a + t.d, 0);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-6 text-center">
        <div className="text-sm text-muted-foreground">{examType} deneme sonucu</div>
        <div className="mt-1 text-4xl font-bold text-primary">{totalNet.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">
          toplam net · {totalCorrect}/{questions.length} doğru
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.entries(perSubject).map(([sid, t]) => (
            <div key={sid} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
              <span className="font-medium">{subjectName(sid)}</span>
              <span className="text-xs text-muted-foreground">
                <span className="text-emerald-500">{t.d}D</span> ·{" "}
                <span className="text-rose-500">{t.y}Y</span> ·{" "}
                <span className="font-semibold text-foreground">{t.net.toFixed(2)} net</span>
              </span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setPhase("setup");
            setQuestions([]);
            setAnswers({});
          }}
          className="mt-5 rounded-md border border-border px-5 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Yeni deneme
        </button>
      </section>

      {/* Cevap anahtarı / inceleme */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Cevaplar</h2>
        {questions.map((q, i) => {
          const a = answers[i];
          const correct = a === q.answer;
          return (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold">{i + 1}.</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {subjectName(q.subjectId)}
                </span>
                {a ? (
                  correct ? (
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
                <span className="text-emerald-500">Doğru: {q.answer}) {q.options[q.answer]}</span>
                {a && !correct && (
                  <span className="ml-3 text-rose-500">Senin: {a}) {q.options[a]}</span>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
