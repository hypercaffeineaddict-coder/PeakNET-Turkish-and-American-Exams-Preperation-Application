import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import { redirect } from "next/navigation";
import { BookOpen, Trash2, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { localDate } from "@/lib/dates";
import {
  createMistake,
  deleteMistake,
  reviewMistake,
} from "./actions";

type Mistake = {
  id: string;
  topic_id: string | null;
  question_text: string | null;
  my_answer: string | null;
  correct_answer: string | null;
  reason: string | null;
  ease: number | null;
  interval_days: number | null;
  repetitions: number | null;
  next_review_at: string;
  created_at: string;
};

const qualityChoices = [
  { value: 5, label: "Hatırladım", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  { value: 3, label: "Yarı yarıya", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  { value: 0, label: "Unuttum", color: "bg-rose-500/10 text-rose-500 border-rose-500/30" },
];

export default async function YanlislarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = localDate();

  const [{ data: dueRaw }, { data: allRaw }, { data: topics }] =
    await Promise.all([
      supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", user.id)
        .lte("next_review_at", today)
        .order("next_review_at", { ascending: true }),
      supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", user.id)
        .gt("next_review_at", today)
        .order("next_review_at", { ascending: true }),
      supabase
        .from("topics")
        .select("id, name, subjects(name, color)")
        .order("display_order"),
    ]);

  const due = (dueRaw ?? []) as Mistake[];
  const upcoming = (allRaw ?? []) as Mistake[];
  const total = due.length + upcoming.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <BookOpen className="text-primary" size={26} />
          Yanlış defteri
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yanlışlarını kaydet, aralıklı tekrar (SM-2) ile pekiştir.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Bugün tekrar" value={String(due.length)} accent />
        <Stat label="Sıradaki" value={String(upcoming.length)} />
        <Stat label="Toplam" value={String(total)} />
      </div>

      {/* Bugün tekrar */}
      {due.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-500">
            <RotateCcw size={14} /> Bugün tekrar edilecekler ({due.length})
          </h2>
          <ul className="space-y-3">
            {due.map((m) => (
              <MistakeReviewCard key={m.id} mistake={m} topics={topics ?? []} />
            ))}
          </ul>
        </section>
      )}

      {/* Yeni yanlış formu */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Yeni yanlış ekle</h2>
        <form action={createMistake} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-muted-foreground">Konu (opsiyonel)</span>
              <select
                name="topic_id"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">— Konu seçme</option>
                {(topics ?? []).map((t: { id: string; name: string }) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Neden yanlış yaptın?</span>
              <input
                name="reason"
                placeholder="Dikkatsizlik / formül bilmeme / yanlış yorum..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
          <textarea
            name="question_text"
            required
            rows={3}
            placeholder="Soru metnini (veya kısa özetini) yaz..."
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="my_answer"
              placeholder="Senin cevabın"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              name="correct_answer"
              placeholder="Doğru cevap"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Defterime ekle
            </button>
          </div>
        </form>
      </section>

      {/* Sıradakiler (özet) */}
      {upcoming.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">
            Sıradaki tekrarlar ({upcoming.length})
          </h2>
          <ul className="divide-y divide-border">
            {upcoming.slice(0, 10).map((m) => (
              <li
                key={m.id}
                className="flex items-start justify-between gap-3 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate">{m.question_text}</p>
                  {m.topic_id && (
                    <p className="text-xs text-muted-foreground">
                      {(topics ?? []).find(
                        (t: { id: string }) => t.id === m.topic_id,
                      )?.name ?? ""}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(m.next_review_at).toLocaleDateString("tr-TR")}
                </span>
              </li>
            ))}
          </ul>
          {upcoming.length > 10 && (
            <p className="mt-2 text-xs text-muted-foreground">
              +{upcoming.length - 10} daha
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-2xl font-bold tabular-nums ${accent ? "text-amber-500" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function MistakeReviewCard({
  mistake: m,
  topics,
}: {
  mistake: Mistake;
  topics: { id: string; name: string }[];
}) {
  const topicName = topics.find((t) => t.id === m.topic_id)?.name;
  return (
    <li className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {topicName && (
            <span className="text-[10px] uppercase tracking-wider text-primary">
              {topicName}
            </span>
          )}
          <p className="mt-1 whitespace-pre-wrap text-sm">{m.question_text}</p>
          {(m.my_answer || m.correct_answer) && (
            <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
              {m.my_answer && (
                <div>
                  <span className="text-rose-500">Sen:</span> {m.my_answer}
                </div>
              )}
              {m.correct_answer && (
                <div>
                  <span className="text-emerald-500">Doğru:</span>{" "}
                  {m.correct_answer}
                </div>
              )}
            </div>
          )}
          {m.reason && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium">Sebep:</span> {m.reason}
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Tekrar {m.repetitions ?? 0}. · Aralık {m.interval_days} gün · Ease{" "}
            {(m.ease ?? 2.5).toFixed(2)}
          </p>
        </div>
        <form action={deleteMistake}>
          <input type="hidden" name="id" value={m.id} />
          <button
            type="submit"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:text-rose-500"
            title="Sil"
          >
            <Trash2 size={14} />
          </button>
        </form>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {qualityChoices.map((q) => (
          <form key={q.value} action={reviewMistake}>
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="quality" value={q.value} />
            <button
              type="submit"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition hover:opacity-90 ${q.color}`}
            >
              {q.label}
            </button>
          </form>
        ))}
      </div>
    </li>
  );
}
