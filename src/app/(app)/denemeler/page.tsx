import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FlaskConical, Plus, Trash2, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteExam } from "./actions";
import { SUBJECT_DISPLAY } from "@/data/exam-subjects";

type SubjectTotal = { d: number; y: number; b: number; net: number; name?: string };
type Totals = Record<string, SubjectTotal>;

export default async function DenemelerPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: exams } = await supabase
    .from("exams")
    .select("*")
    .eq("user_id", user.id)
    .order("exam_date", { ascending: false });

  const items = exams ?? [];

  // Toplam net hesapla
  const totalNets = items.map((e) => {
    const totals = (e.totals ?? {}) as Totals;
    return Object.values(totals).reduce((acc, t) => acc + (t?.net ?? 0), 0);
  });

  const maxTotal = Math.max(60, ...totalNets);
  const lastTotal = totalNets[0] ?? 0;
  const bestTotal = Math.max(...totalNets, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <FlaskConical className="text-primary" size={26} />
            Denemeler
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Çözdüğün denemelerin net analizi ve gelişim grafiği.
          </p>
        </div>
        <Link
          href="/denemeler/yeni"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus size={14} /> Yeni deneme
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Toplam deneme" value={String(items.length)} />
        <Stat label="Son net" value={lastTotal.toFixed(2)} />
        <Stat label="En yüksek net" value={bestTotal.toFixed(2)} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FlaskConical
            size={36}
            className="mx-auto text-muted-foreground"
          />
          <h2 className="mt-4 text-lg font-semibold">Henüz deneme yok</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            İlk denemeni gir, gelişim grafiği oluşmaya başlasın.
          </p>
          <Link
            href="/denemeler/yeni"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus size={14} /> İlk denemeyi ekle
          </Link>
        </div>
      ) : (
        <>
          {/* Net trend chart */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp size={16} className="text-emerald-500" />
              Net gelişimi
            </h2>
            <NetChart items={items.slice().reverse()} maxNet={maxTotal} />
          </section>

          {/* Deneme listesi */}
          <section className="space-y-3">
            {items.map((exam) => {
              const totals = (exam.totals ?? {}) as Totals;
              const total = Object.values(totals).reduce(
                (acc, t) => acc + (t?.net ?? 0),
                0,
              );
              return (
                <article
                  key={exam.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <header className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">
                        <Link
                          href={`/denemeler/${exam.id}`}
                          className="transition hover:text-primary hover:underline"
                        >
                          {exam.name}
                        </Link>{" "}
                        <span className="ml-1 rounded-lg bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                          {exam.exam_type}
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exam.exam_date).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-display text-xl font-bold tabular-nums">
                          {total.toFixed(2)}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          toplam net
                        </div>
                      </div>
                      <form action={deleteExam}>
                        <input type="hidden" name="id" value={exam.id} />
                        <button
                          type="submit"
                          className="rounded-lg p-1.5 text-muted-foreground transition hover:text-rose-500"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </header>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {Object.entries(totals).map(([sid, t]) => (
                      <div
                        key={sid}
                        className="rounded-lg border border-border bg-background p-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className="rounded-lg px-1.5 py-0.5 font-medium"
                            style={{
                              backgroundColor: `${SUBJECT_DISPLAY[sid]?.color ?? "#8b7cf6"}20`,
                              color: SUBJECT_DISPLAY[sid]?.color ?? "#8b7cf6",
                            }}
                            title={t.name ?? SUBJECT_DISPLAY[sid]?.short ?? sid}
                          >
                            {t.name ?? SUBJECT_DISPLAY[sid]?.short ?? sid}
                          </span>
                          <span className="text-base font-semibold">
                            {t.net.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-1.5 grid grid-cols-3 gap-1 text-center text-[10px] text-muted-foreground">
                          <span>
                            <span className="text-emerald-500">D</span> {t.d}
                          </span>
                          <span>
                            <span className="text-rose-500">Y</span> {t.y}
                          </span>
                          <span>
                            <span>B</span> {t.b}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-right">
                    <Link
                      href={`/denemeler/${exam.id}`}
                      className="text-xs font-medium text-primary transition hover:underline"
                    >
                      Detaylı analiz →
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

type ExamItem = {
  id: string;
  exam_date: string;
  totals: unknown;
};

function NetChart({ items, maxNet }: { items: ExamItem[]; maxNet: number }) {
  if (items.length === 0) return null;
  const points = items.map((e, i) => {
    const totals = (e.totals ?? {}) as Totals;
    const total = Object.values(totals).reduce(
      (acc, t) => acc + (t?.net ?? 0),
      0,
    );
    return {
      x: i,
      y: total,
      label: new Date(e.exam_date).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
      }),
    };
  });
  const W = 800;
  const H = 200;
  const pad = 30;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;
  const xStep = points.length > 1 ? innerW / (points.length - 1) : 0;
  const yScale = (v: number) => H - pad - (v / maxNet) * innerH;

  const polyline = points
    .map((p) => `${pad + p.x * xStep},${yScale(p.y)}`)
    .join(" ");

  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full min-w-[400px]">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1={pad}
            x2={W - pad}
            y1={pad + p * innerH}
            y2={pad + p * innerH}
            stroke="currentColor"
            strokeOpacity={0.1}
          />
        ))}
        {/* Line */}
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={polyline}
          className="text-primary"
        />
        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={pad + p.x * xStep}
              cy={yScale(p.y)}
              r={4}
              className="fill-primary"
            />
            <text
              x={pad + p.x * xStep}
              y={yScale(p.y) - 10}
              textAnchor="middle"
              className="fill-foreground text-[10px]"
            >
              {p.y.toFixed(1)}
            </text>
            <text
              x={pad + p.x * xStep}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
