"use client";

import { useState } from "react";
import { examSubjects } from "@/data/exam-subjects";

type Row = { d: number; y: number; total: number };

export function NetForm({
  action,
  defaultType,
  track,
  error,
}: {
  action: (fd: FormData) => void;
  defaultType: "TYT" | "AYT" | "YDT";
  track: string | null;
  error: string | null;
}) {
  const [examType, setExamType] = useState<"TYT" | "AYT" | "YDT">(defaultType);
  const [values, setValues] = useState<Record<string, Row>>({});

  const subjects = examSubjects(examType, track);
  const today = new Date().toISOString().slice(0, 10);

  const rowOf = (sid: string, fallbackTotal: number): Row =>
    values[sid] ?? { d: 0, y: 0, total: fallbackTotal };

  const setRow = (sid: string, patch: Partial<Row>, fallbackTotal: number) =>
    setValues((vs) => ({
      ...vs,
      [sid]: { ...rowOf(sid, fallbackTotal), ...patch },
    }));

  const getNet = (r: Row) => Math.max(0, r.d - r.y / 4);
  const getBos = (r: Row) => Math.max(0, r.total - r.d - r.y);

  const totalNet = subjects.reduce(
    (acc, s) => acc + getNet(rowOf(s.id, s.total)),
    0,
  );

  return (
    <form action={action} className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="text-muted-foreground">Deneme adı</span>
            <input
              name="name"
              required
              placeholder="örn. Tonguç AYT-3"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Tarih</span>
            <input
              name="exam_date"
              type="date"
              required
              defaultValue={today}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Tür</span>
            <select
              name="exam_type"
              value={examType}
              onChange={(e) =>
                setExamType(e.target.value as "TYT" | "AYT" | "YDT")
              }
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            >
              <option value="AYT">AYT</option>
              <option value="TYT">TYT</option>
              <option value="YDT">YDT</option>
            </select>
          </label>
        </div>
      </section>

      {subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Bu sınav türü için ders listesi yok. Lise bölümüne göre TYT, AYT veya
          YDT seç.
        </div>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold">Net girişleri</h3>
            <p className="text-xs text-muted-foreground">
              Soru sayısı (S) yayına göre değiştirilebilir. Çözmediğin dersi 0
              soru bırak.
            </p>
          </div>
          <div className="mt-4 space-y-2.5">
            {/* başlık satırı (geniş ekran) */}
            <div className="hidden grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:grid">
              <span>Ders</span>
              <span className="w-16 text-center">Soru</span>
              <span className="w-16 text-center text-emerald-500">Doğru</span>
              <span className="w-16 text-center text-rose-500">Yanlış</span>
              <span className="w-12 text-center">Boş</span>
              <span className="w-16 text-right">Net</span>
            </div>

            {subjects.map((s) => {
              const r = rowOf(s.id, s.total);
              const bos = getBos(r);
              const net = getNet(r);
              const skipped = r.total === 0;
              const valid = skipped || r.d + r.y <= r.total;
              return (
                <div
                  key={s.id}
                  className={`grid items-center gap-3 rounded-lg border bg-background p-3 md:grid-cols-[1fr_auto_auto_auto_auto_auto] ${
                    skipped ? "border-border opacity-55" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <NumCell
                    label="S"
                    name={`${s.id}_total`}
                    value={r.total}
                    accent="text-muted-foreground"
                    onChange={(n) => setRow(s.id, { total: n }, s.total)}
                  />
                  <NumCell
                    label="D"
                    name={`${s.id}_d`}
                    value={r.d}
                    max={r.total}
                    accent="text-emerald-500"
                    onChange={(n) => setRow(s.id, { d: n }, s.total)}
                  />
                  <NumCell
                    label="Y"
                    name={`${s.id}_y`}
                    value={r.y}
                    max={r.total}
                    accent="text-rose-500"
                    onChange={(n) => setRow(s.id, { y: n }, s.total)}
                  />
                  <div className="text-xs text-muted-foreground md:w-12 md:text-center">
                    <span className="md:hidden">Boş: </span>
                    {bos}
                  </div>
                  <div
                    className={`text-right font-mono font-semibold md:w-16 ${
                      valid ? "text-primary" : "text-rose-500"
                    }`}
                  >
                    {valid ? net.toFixed(2) : "geçersiz"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">Toplam net</span>
            <span className="font-display text-xl font-bold tabular-nums">
              {totalNet.toFixed(2)}
            </span>
          </div>
        </section>
      )}

      {error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={subjects.length === 0}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        >
          Denemeyi kaydet
        </button>
      </div>
    </form>
  );
}

function NumCell({
  label,
  name,
  value,
  max,
  accent,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  max?: number;
  accent: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label className={`text-[10px] md:hidden ${accent}`}>{label}</label>
      <input
        type="number"
        name={name}
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
