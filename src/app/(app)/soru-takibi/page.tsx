import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Target, Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { examSubjects, subjectForTrack } from "@/data/exam-subjects";
import { localDate } from "@/lib/dates";
import { AddLog } from "./add-log";
import { deleteQuestionLog } from "./actions";

const RANGES = [
  { id: "7", label: "Son 7 gün", days: 7 },
  { id: "30", label: "Son 30 gün", days: 30 },
  { id: "90", label: "Son 90 gün", days: 90 },
  { id: "all", label: "Tümü", days: null as number | null },
] as const;
type RangeId = (typeof RANGES)[number]["id"];

export const metadata = { title: "Soru Takibi · PeakNET" };

type Log = {
  id: string;
  log_date: string;
  subject: string;
  correct: number;
  wrong: number;
  blank: number;
};

const netOf = (c: number, w: number) => Math.max(0, c - w / 4);

export default async function SoruTakibiPage({
  searchParams,
}: {
  searchParams: Promise<{ aralik?: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const { aralik } = await searchParams;
  const activeRange: RangeId =
    (RANGES.find((r) => r.id === aralik)?.id ?? "30") as RangeId;
  const rangeDays = RANGES.find((r) => r.id === activeRange)?.days ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("high_school_track")
    .eq("id", user.id)
    .single();
  const track = profile?.high_school_track ?? null;

  // Ders + konu listesi: müfredat (subjects+topics) varsa onu kullan (konu
  // seçilince ustalığa sayılır); yoksa kaba ders listesine düş.
  type SRow = {
    name: string;
    color: string | null;
    exam_type: string;
    tracks: string[] | null;
    topics: { id: string; name: string; display_order: number }[];
  };
  const { data: subjectsRaw } = await supabase
    .from("subjects")
    .select("name, color, exam_type, tracks, topics(id, name, display_order)")
    .in("exam_type", ["TYT", "AYT", "YDT"])
    .order("display_order");

  const curriculum = new Map<string, { color: string; topics: { id: string; name: string }[] }>();
  for (const s of ((subjectsRaw ?? []) as SRow[]).filter((s) =>
    subjectForTrack(s.tracks, track),
  )) {
    const cur = curriculum.get(s.name) ?? { color: s.color ?? "#8b7cf6", topics: [] };
    for (const t of (s.topics ?? []).slice().sort((a, b) => a.display_order - b.display_order)) {
      cur.topics.push({ id: t.id, name: t.name });
    }
    curriculum.set(s.name, cur);
  }

  const subjects =
    curriculum.size > 0
      ? Array.from(curriculum, ([name, v]) => ({ name, color: v.color, topics: v.topics }))
      : [
          ...examSubjects("TYT", track),
          ...examSubjects("AYT", track),
          ...examSubjects("YDT", track),
        ].map((s) => ({ name: s.name, color: s.color, topics: [] as { id: string; name: string }[] }));

  const colorFor = (n: string) =>
    subjects.find((s) => s.name === n)?.color ?? "#8b7cf6";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = localDate(today);

  let logsQuery = supabase
    .from("question_logs")
    .select("id, log_date, subject, correct, wrong, blank")
    .eq("user_id", user.id);
  if (rangeDays !== null) {
    const start = new Date(today);
    start.setDate(start.getDate() - (rangeDays - 1));
    logsQuery = logsQuery.gte("log_date", localDate(start));
  }
  const { data: logsRaw, error } = await logsQuery
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });

  const tableMissing =
    !!error && /does not exist|could not find|schema cache/i.test(error.message);
  const logs: Log[] = (logsRaw ?? []) as Log[];

  // Bugün özeti
  const todayLogs = logs.filter((l) => l.log_date === todayStr);
  const sum = (arr: Log[], k: "correct" | "wrong" | "blank") =>
    arr.reduce((a, l) => a + (l[k] ?? 0), 0);
  const tC = sum(todayLogs, "correct");
  const tW = sum(todayLogs, "wrong");
  const tB = sum(todayLogs, "blank");
  const tTotal = tC + tW + tB;
  const tNet = netOf(tC, tW);

  // Son 7 gün günlük toplam (mini grafik)
  const days: { label: string; total: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = localDate(d);
    const dayLogs = logs.filter((l) => l.log_date === ds);
    days.push({
      label: d.toLocaleDateString("tr-TR", { weekday: "short" }),
      total: sum(dayLogs, "correct") + sum(dayLogs, "wrong") + sum(dayLogs, "blank"),
      isToday: ds === todayStr,
    });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.total));

  // 30 gün ders bazlı toplam
  const bySubject = new Map<string, { total: number; net: number }>();
  for (const l of logs) {
    const cur = bySubject.get(l.subject) ?? { total: 0, net: 0 };
    cur.total += l.correct + l.wrong + l.blank;
    cur.net += netOf(l.correct, l.wrong);
    bySubject.set(l.subject, cur);
  }
  const subjectTotals = Array.from(bySubject, ([name, v]) => ({ name, ...v })).sort(
    (a, b) => b.total - a.total,
  );
  const monthTotal = subjectTotals.reduce((a, s) => a + s.total, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Target className="text-primary" size={26} />
          Soru Takibi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hangi dersten kaç soru çözdüğünü kaydet; net, günlük ritim ve ders
          dağılımını gör. Çözüm streak&apos;ine de sayılır.
        </p>
      </header>

      {tableMissing && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">Tablo hazır değil</div>
            <p className="mt-1 text-muted-foreground">
              <code className="rounded bg-muted px-1">0016_question_logs</code>{" "}
              migration&apos;ını (RUN dosyasında da var) bir kez çalıştır.
            </p>
          </div>
        </div>
      )}

      {/* Bugün özeti */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Bugün soru" value={tTotal} accent />
        <Stat label="Net" value={Number(tNet.toFixed(2))} />
        <Stat label="Doğru" value={tC} color="text-emerald-500" />
        <Stat label="Yanlış" value={tW} color="text-rose-500" />
      </div>

      <AddLog subjects={subjects} />

      {/* Son 7 gün ritim */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Son 7 gün</h2>
        <div className="mt-4 flex items-end justify-between gap-2">
          {days.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="font-display text-xs font-bold tabular-nums text-muted-foreground">
                {d.total || ""}
              </span>
              <div className="flex h-28 w-full items-end">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    d.isToday ? "bg-primary" : "bg-primary/35"
                  }`}
                  style={{ height: `${Math.max(4, (d.total / maxDay) * 100)}%` }}
                />
              </div>
              <span className={`text-[10px] ${d.isToday ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Ders dağılımı (seçili aralık) */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">
            Ders dağılımı ·{" "}
            <span className="text-muted-foreground">
              {RANGES.find((r) => r.id === activeRange)?.label}
            </span>
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {RANGES.map((r) => {
              const isActive = r.id === activeRange;
              return (
                <Link
                  key={r.id}
                  href={r.id === "30" ? "/soru-takibi" : `/soru-takibi?aralik=${r.id}`}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </Link>
              );
            })}
          </div>
        </div>
        {subjectTotals.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Henüz kayıt yok. Yukarıdan çözdüğün soruları ekleyerek başla.
          </p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {subjectTotals.map((s) => (
              <div key={s.name} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate">{s.name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(3, (s.total / Math.max(1, subjectTotals[0].total)) * 100)}%`,
                      backgroundColor: colorFor(s.name),
                    }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {s.total} soru · {s.net.toFixed(1)} net
                </span>
              </div>
            ))}
            <div className="pt-1 text-right text-xs text-muted-foreground">
              Toplam <span className="font-semibold text-foreground tabular-nums">{monthTotal}</span> soru
            </div>
          </div>
        )}
      </section>

      {/* Geçmiş */}
      {logs.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Son kayıtlar</h2>
          <ul className="divide-y divide-border">
            {logs.slice(0, 40).map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorFor(l.subject) }}
                />
                <span className="w-28 shrink-0 truncate font-medium">{l.subject}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {new Date(l.log_date).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                <span className="flex-1 text-xs tabular-nums text-muted-foreground">
                  <span className="text-emerald-500">{l.correct}D</span>{" "}
                  <span className="text-rose-500">{l.wrong}Y</span>{" "}
                  <span>{l.blank}B</span>
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-primary">
                  {netOf(l.correct, l.wrong).toFixed(2)}
                </span>
                <form action={deleteQuestionLog}>
                  <input type="hidden" name="id" value={l.id} />
                  <button
                    type="submit"
                    className="rounded-lg p-1 text-muted-foreground transition hover:text-rose-500"
                    title="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  accent,
}: {
  label: string;
  value: number;
  color?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "border-primary/25 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="text-sm text-muted-foreground">{label}</div>
      <div
        className={`mt-1 font-display text-2xl font-bold tabular-nums ${color ?? (accent ? "text-primary" : "")}`}
      >
        {value}
      </div>
    </div>
  );
}
