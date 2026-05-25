"use client";

import { useEffect, useState } from "react";
import { Target, Trophy, TrendingUp, Pencil, Flag } from "lucide-react";

export type Point = { name: string; date: string; net: number };

type Goal = { net: number; type: "TYT" | "AYT" | "YDT" };
const KEY = "peaknet-hedef";

export function HedefClient({
  byType,
  targetDepartment,
  targetUniversity,
}: {
  byType: Record<string, Point[]>;
  targetDepartment: string | null;
  targetUniversity: string | null;
}) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState<Goal["type"]>("AYT");
  const [net, setNet] = useState<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const g = JSON.parse(raw) as Goal;
        setGoal(g);
        setType(g.type);
        setNet(g.net);
      }
    } catch {}
    setReady(true);
  }, []);

  function save() {
    if (!net || net <= 0) return;
    const g: Goal = { net: Math.round(net * 100) / 100, type };
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
          <Flag size={15} className="text-primary" /> Net hedefini belirle
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hangi sınav için ve kaç net hedefliyorsun? (Cihazında saklanır.)
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr]">
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">Sınav</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Goal["type"])}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="AYT">AYT</option>
              <option value="TYT">TYT</option>
              <option value="YDT">YDT</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-xs text-muted-foreground">Hedef net</span>
            <input
              type="number"
              min={0}
              step="0.25"
              value={net || ""}
              onChange={(e) => setNet(Math.max(0, Number(e.target.value) || 0))}
              placeholder="örn. 65"
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
              Vazgeç
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!net}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </section>
    );
  }

  const series = byType[goal.type] ?? [];
  const nets = series.map((s) => s.net);
  const best = nets.length ? Math.max(...nets) : 0;
  const latest = nets.length ? nets[nets.length - 1] : 0;
  const avg = nets.length ? nets.reduce((a, b) => a + b, 0) / nets.length : 0;
  const pct = Math.min(100, Math.round((best / goal.net) * 100));
  const remaining = Math.max(0, goal.net - best);
  const reached = best >= goal.net;
  const chartMax = Math.max(goal.net, best, 1);

  return (
    <div className="space-y-6">
      {/* Hedef kartı */}
      <section className="bg-summit relative overflow-hidden rounded-2xl border border-border p-6 shadow-soft">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              {(targetDepartment || targetUniversity) && (
                <div className="mb-1 text-sm text-muted-foreground">
                  {targetDepartment}
                  {targetUniversity ? ` · ${targetUniversity}` : ""}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tabular-nums text-primary">
                  {goal.net}
                </span>
                <span className="text-sm text-muted-foreground">net hedefi · {goal.type}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:bg-card"
            >
              <Pencil size={12} /> Değiştir
            </button>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">En iyi netin: <span className="font-semibold text-foreground tabular-nums">{best.toFixed(2)}</span></span>
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
                  🎯 Hedefe ulaştın! Yeni bir hedef koymaya ne dersin?
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Hedefe <span className="font-display font-bold tabular-nums text-foreground">{remaining.toFixed(2)}</span> net kaldı.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* İstatistik */}
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat icon={Trophy} label="En iyi" value={best.toFixed(2)} color="text-amber-500" />
        <MiniStat icon={TrendingUp} label="Ortalama" value={avg.toFixed(2)} color="text-sky-500" />
        <MiniStat icon={Target} label="Son deneme" value={latest.toFixed(2)} color="text-primary" />
      </div>

      {/* Trend + hedef çizgisi */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">{goal.type} net gelişimi</h2>
        {series.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Bu sınav türünde henüz deneme yok. Denemeler sayfasından ekleyince ilerlemen burada görünür.
          </p>
        ) : (
          <div className="relative mt-6 flex items-end gap-1.5">
            {/* hedef çizgisi */}
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-primary/60"
              style={{ bottom: `${(goal.net / chartMax) * 100}%` }}
            >
              <span className="absolute -top-4 right-0 text-[10px] font-medium text-primary">
                hedef {goal.net}
              </span>
            </div>
            {series.map((s, i) => {
              const h = (s.net / chartMax) * 100;
              const ok = s.net >= goal.net;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${s.name}: ${s.net}`}>
                  <div className="flex h-32 w-full items-end">
                    <div
                      className={`w-full rounded-t-md transition-all ${ok ? "bg-emerald-500" : "bg-primary/40"}`}
                      style={{ height: `${Math.max(3, h)}%` }}
                    />
                  </div>
                  <span className="text-[9px] tabular-nums text-muted-foreground">
                    {new Date(s.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
