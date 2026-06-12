"use client";

import type { getDict } from "@/lib/i18n";
type Dict = ReturnType<typeof getDict>;

import { useEffect, useMemo, useState } from "react";
import { Target, Trophy, TrendingUp, Pencil, Flag } from "lucide-react";
import {
  type PuanTuru,
  PUAN_TURU_LABEL,
  tahminiPuan,
  tahminiSiralama,
  hedefIcinPuan,
  formatRank,
} from "@/data/yks-scoring";

export type ExamLite = {
  name: string;
  date: string;
  type: "TYT" | "AYT" | "YDT";
  net: number;
};

type Goal = { rank: number; type: PuanTuru };
const KEY = "peaknet-hedef-v2";

// Her deneme için tahmini sıralama hesapla.
// - type === "TYT": yalnız TYT denemeleri (tek başına TYT puanı)
// - type SAY/EA/SOZ: AYT denemeleri, her birinin tarihindeki en güncel TYT
//   netiyle eşleştir (yoksa 0 varsayar).
function buildSeries(exams: ExamLite[], type: PuanTuru) {
  const sorted = exams.slice().sort((a, b) => a.date.localeCompare(b.date));
  let lastTYTNet = 0;
  const out: { name: string; date: string; rank: number; puan: number }[] = [];
  for (const e of sorted) {
    if (e.type === "TYT") lastTYTNet = e.net;
    if (type === "TYT") {
      if (e.type !== "TYT") continue;
      const puan = tahminiPuan("TYT", e.net, 0);
      const rank = tahminiSiralama("TYT", puan);
      if (rank) out.push({ name: e.name, date: e.date, rank, puan });
    } else {
      if (e.type !== "AYT") continue;
      const puan = tahminiPuan(type, lastTYTNet, e.net);
      const rank = tahminiSiralama(type, puan);
      if (rank) out.push({ name: e.name, date: e.date, rank, puan });
    }
  }
  return out;
}

export function HedefClient({ dict, exams,
  defaultType,
  targetDepartment,
  targetUniversity,
}: { dict: any, exams: ExamLite[];
  defaultType: PuanTuru;
  targetDepartment: string | null;
  targetUniversity: string | null;
}) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState<PuanTuru>(defaultType);
  const [rankInput, setRankInput] = useState<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const g = JSON.parse(raw) as Goal;
        if (g && g.rank && g.type) {
          setGoal(g);
          setType(g.type);
          setRankInput(g.rank);
        }
      }
    } catch {}
    setReady(true);
  }, []);

  const series = useMemo(
    () => (goal ? buildSeries(exams, goal.type) : []),
    [exams, goal],
  );

  function save() {
    if (!rankInput || rankInput <= 0) return;
    const g: Goal = { rank: Math.round(rankInput), type };
    setGoal(g);
    setEditing(false);
    try {
      localStorage.setItem(KEY, JSON.stringify(g));
    } catch {}
  }

  if (!ready) return null;

  if (!goal || editing) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Flag size={15} className="text-primary" /> {dict.setGoalTitle}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hangi puan türünde, kaçıncı sıraya girmek istiyorsun? (Cihazında
          saklanır.)
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr]">
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">{dict.scoreTypeLabel}</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PuanTuru)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="SAY">{PUAN_TURU_LABEL.SAY}</option>
              <option value="EA">{PUAN_TURU_LABEL.EA}</option>
              <option value="SOZ">{PUAN_TURU_LABEL.SOZ}</option>
              <option value="TYT">{PUAN_TURU_LABEL.TYT}</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">{dict.targetRankLabel}</span>
            <input
              type="number"
              min={1}
              step={1000}
              value={rankInput || ""}
              onChange={(e) => setRankInput(Math.max(0, Number(e.target.value) || 0))}
              placeholder={dict.rankPlaceholder}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {goal && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-muted"
            >
              {dict.cancelButton}
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!rankInput}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
          >
            {dict.saveButton}
          </button>
        </div>
      </section>
    );
  }

  const ranks = series.map((s) => s.rank);
  const bestRank = ranks.length ? Math.min(...ranks) : null;
  const worstRank = ranks.length ? Math.max(...ranks) : null;
  const latestRank = ranks.length ? ranks[ranks.length - 1] : null;
  const reached = bestRank != null && bestRank <= goal.rank;
  const requiredPuan = hedefIcinPuan(goal.type, goal.rank);
  const remaining =
    bestRank != null && bestRank > goal.rank ? bestRank - goal.rank : 0;

  // İlerleme yüzdesi (daha küçük rank daha iyi):
  //   pct = (worstRank - bestRank) / (worstRank - target) * 100, sınırlı.
  let pct = 0;
  if (bestRank != null && worstRank != null) {
    if (bestRank <= goal.rank) pct = 100;
    else if (worstRank > goal.rank) {
      pct = Math.max(0, Math.min(100, Math.round(((worstRank - bestRank) / (worstRank - goal.rank)) * 100)));
    }
  }

  // Trend için ters ölçek (küçük rank → uzun bar)
  const chartMin = bestRank != null ? Math.min(bestRank, goal.rank) * 0.85 : 1;
  const chartMax = worstRank != null ? worstRank * 1.05 : 1;
  const span = Math.max(1, chartMax - chartMin);
  const heightFor = (rank: number) =>
    Math.max(4, Math.min(100, ((chartMax - rank) / span) * 100));
  const targetH =
    chartMin <= goal.rank && goal.rank <= chartMax
      ? heightFor(goal.rank)
      : goal.rank < chartMin
        ? 96
        : 4;

  return (
    <div className="space-y-6">
      {/* Hedef kartı */}
      <section className="bg-summit relative overflow-hidden rounded-2xl border border-border p-6 shadow-soft">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              {(targetDepartment || targetUniversity) && (
                <div className="mb-3 space-y-1.5">
                  {targetDepartment && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {String(targetDepartment).split(",").map((dept: string) => (
                        <span key={dept.trim()} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                          {dept.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {targetUniversity && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {String(targetUniversity).split(",").map((uni: string) => (
                        <span key={uni.trim()} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                          {uni.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tabular-nums text-primary">
                  {formatRank(goal.rank)}
                </span>
                <span className="text-sm text-muted-foreground">
                  hedef sıralama · {PUAN_TURU_LABEL[goal.type]}
                </span>
              </div>
              {requiredPuan && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Bunun için yaklaşık <span className="font-semibold text-foreground tabular-nums">{requiredPuan}</span> puan gerek.
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:bg-card"
            >
              <Pencil size={12} /> {dict.changeButton}
            </button>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                En iyi sıralaman:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {bestRank != null ? formatRank(bestRank) : "—"}
                </span>
              </span>
              <span className="font-semibold tabular-nums text-primary">%{pct}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="shimmer h-full rounded-full bg-primary transition-[width] duration-700"
                style={{ width: `${Math.max(3, pct)}%` }}
              />
            </div>
            <div className="mt-2 text-sm">
              {reached ? (
                <span className="font-medium text-emerald-500">
                  {dict.goalReachedText}
                </span>
              ) : bestRank == null ? (
                <span className="text-muted-foreground">
                  Henüz tahmini sıralama yok. {goal.type === "TYT" ? "TYT" : "AYT"} denemen olunca burada görünür.
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Hedefe <span className="font-display font-bold tabular-nums text-foreground">{formatRank(remaining)}</span> sıra daha yakın olmalısın.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* İstatistik */}
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={Trophy}
          label={dict.bestRankLabel}
          value={bestRank != null ? formatRank(bestRank) : "—"}
          color="text-amber-500"
        />
        <MiniStat
          icon={TrendingUp}
          label={dict.latestExamLabel}
          value={latestRank != null ? formatRank(latestRank) : "—"}
          color="text-primary"
        />
        <MiniStat
          icon={Target}
          label={dict.targetLabel}
          value={formatRank(goal.rank)}
          color="text-emerald-500"
        />
      </div>

      {/* Trend + hedef çizgisi (sıralama: küçük = iyi → ters ölçek) */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">
          {PUAN_TURU_LABEL[goal.type]} tahmini sıralama gelişimi
        </h2>
        {series.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Bu puan türünde tahmini sıralama hesaplanabilir denemen yok.{" "}
            {goal.type === "TYT"
              ? dict.addTytExamText
              : dict.addAytExamText}
          </p>
        ) : (
          <div className="relative mt-6 flex items-end gap-1.5">
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-primary/60"
              style={{ bottom: `${targetH}%` }}
            >
              <span className="absolute -top-4 right-0 text-[10px] font-medium text-primary">
                hedef {formatRank(goal.rank)}
              </span>
            </div>
            {series.map((s, i) => {
              const h = heightFor(s.rank);
              const ok = s.rank <= goal.rank;
              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`${s.name}: ${formatRank(s.rank)} (${s.puan} puan)`}
                >
                  <div className="flex h-32 w-full items-end">
                    <div
                      className={`w-full rounded-t-md transition-all ${ok ? "bg-emerald-500" : "bg-primary/40"}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[9px] tabular-nums text-muted-foreground">
                    {new Date(s.date).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          Sıralamalar geçmiş yıl eğilimlerine dayalı kaba tahminlerdir; ÖSYM&apos;nin
          gerçek puanından farklı olabilir.
        </p>
      </section>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon size={15} className={color} />
      </div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
