import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TYT_SUBJECTS, AYT_BY_TRACK, YDT_SUBJECTS } from "@/data/exam-subjects";

type SubjectTotal = { d: number; y: number; b: number; net: number };
type Totals = Record<string, SubjectTotal>;
type Exam = {
  id: string;
  name: string;
  exam_type: string;
  exam_date: string;
  totals: Totals | null;
};

const subjMap = new Map(
  [
    ...TYT_SUBJECTS,
    ...Object.values(AYT_BY_TRACK).flat(),
    ...YDT_SUBJECTS,
  ].map((s) => [s.id, { name: s.name, color: s.color }]),
);
const info = (id: string) => subjMap.get(id) ?? { name: id, color: "#8b7cf6" };
const sumNet = (t: Totals | null) =>
  Object.values(t ?? {}).reduce((a, s) => a + (s?.net ?? 0), 0);

function Delta({ value }: { value: number }) {
  if (Math.abs(value) < 0.05)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus size={12} /> 0
      </span>
    );
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
        up ? "text-emerald-500" : "text-rose-500"
      }`}
    >
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? "+" : ""}
      {value.toFixed(2)}
    </span>
  );
}

export default async function DenemeDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exam } = await supabase
    .from("exams")
    .select("id, name, exam_type, exam_date, totals")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!exam) notFound();
  const e = exam as Exam;

  // Aynı türdeki tüm denemeler (trend + önceki kıyas)
  const { data: sameType } = await supabase
    .from("exams")
    .select("id, name, exam_date, totals")
    .eq("user_id", user.id)
    .eq("exam_type", e.exam_type)
    .order("exam_date", { ascending: true });

  const series = (sameType ?? []).map((x) => ({
    id: x.id,
    name: x.name as string,
    date: x.exam_date as string,
    net: sumNet(x.totals as Totals | null),
  }));
  const idx = series.findIndex((s) => s.id === e.id);
  const prev = idx > 0 ? series[idx - 1] : null;
  const prevTotals = prev
    ? ((sameType ?? []).find((x) => x.id === prev.id)?.totals as Totals | null)
    : null;

  const totalNet = sumNet(e.totals);
  const prevNet = prev?.net ?? null;
  const avgNet =
    series.length > 0
      ? series.reduce((a, s) => a + s.net, 0) / series.length
      : 0;
  const bestNet = Math.max(0, ...series.map((s) => s.net));

  const rows = Object.entries(e.totals ?? {}).map(([sid, t]) => {
    const attempted = t.d + t.y;
    const acc = attempted > 0 ? (t.d / attempted) * 100 : 0;
    const total = t.d + t.y + t.b;
    const prevN = prevTotals?.[sid]?.net ?? null;
    return { sid, ...t, total, acc, delta: prevN == null ? null : t.net - prevN };
  });
  const maxNet = Math.max(1, ...rows.map((r) => r.net));
  const weakest = rows
    .filter((r) => r.d + r.y > 0)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 3);

  const dateStr = new Date(e.exam_date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/denemeler"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Denemeler
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {e.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {e.exam_type} · {dateStr}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl font-bold tabular-nums text-primary">
              {totalNet.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              toplam net
              {prevNet != null && <Delta value={totalNet - prevNet} />}
            </div>
          </div>
        </div>
      </div>

      {/* Özet kıyas */}
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat
          label="Önceki denemeye göre"
          value={prevNet != null ? `${totalNet - prevNet >= 0 ? "+" : ""}${(totalNet - prevNet).toFixed(2)}` : "—"}
          color={prevNet != null ? (totalNet - prevNet >= 0 ? "text-emerald-500" : "text-rose-500") : ""}
        />
        <MiniStat label={`${e.exam_type} ortalaman`} value={avgNet.toFixed(2)} />
        <MiniStat label={`En iyi ${e.exam_type}`} value={bestNet.toFixed(2)} color={totalNet >= bestNet ? "text-emerald-500" : ""} />
      </div>

      {/* Zayıf dersler */}
      {weakest.length > 0 && (
        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle size={15} /> Bu denemede en zayıf dersler
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakest.map((r) => (
              <span
                key={r.sid}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: info(r.sid).color }} />
                <span className="font-medium">{info(r.sid).name}</span>
                <span className="tabular-nums text-muted-foreground">%{Math.round(r.acc)} isabet</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Ders kırılımı */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Ders kırılımı</h2>
        <div className="mt-4 space-y-3">
          {rows.map((r) => (
            <div key={r.sid} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: info(r.sid).color }} />
                  {info(r.sid).name}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs tabular-nums text-muted-foreground">
                    <span className="text-emerald-500">{r.d}D</span>{" "}
                    <span className="text-rose-500">{r.y}Y</span>{" "}
                    {r.b}B · /{r.total}
                  </span>
                  {r.delta != null && <Delta value={r.delta} />}
                  <span className="w-12 text-right font-mono font-semibold tabular-nums text-primary">
                    {r.net.toFixed(2)}
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, (r.net / maxNet) * 100)}%`,
                    backgroundColor: info(r.sid).color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trend */}
      {series.length > 1 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp size={15} className="text-emerald-500" /> {e.exam_type} net gelişimi
          </h2>
          <div className="mt-4 flex items-end gap-1.5">
            {series.map((s) => {
              const h = Math.max(4, (s.net / Math.max(1, bestNet)) * 100);
              const isThis = s.id === e.id;
              return (
                <Link
                  key={s.id}
                  href={`/denemeler/${s.id}`}
                  title={`${s.name}: ${s.net.toFixed(2)} net`}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div className="flex h-24 w-full items-end">
                    <div
                      className={`w-full rounded-t-md transition-all ${isThis ? "bg-primary" : "bg-primary/30 hover:bg-primary/50"}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[9px] tabular-nums text-muted-foreground">
                    {new Date(s.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold tabular-nums ${color ?? ""}`}>
        {value}
      </div>
    </div>
  );
}
