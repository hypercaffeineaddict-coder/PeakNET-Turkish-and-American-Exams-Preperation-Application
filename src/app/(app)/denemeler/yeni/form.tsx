"use client";

import { useState } from "react";

const AYT_SUBJECTS = [
  { id: "matematik", name: "Matematik", total: 40, color: "#3b82f6" },
  { id: "fizik", name: "Fizik", total: 14, color: "#ef4444" },
  { id: "kimya", name: "Kimya", total: 13, color: "#10b981" },
  { id: "biyoloji", name: "Biyoloji", total: 13, color: "#a855f7" },
];

const TYT_SUBJECTS = [
  { id: "turkce", name: "Türkçe", total: 40, color: "#f59e0b" },
  { id: "matematik", name: "Matematik", total: 40, color: "#3b82f6" },
  { id: "sosyal", name: "Sosyal Bilimler", total: 20, color: "#06b6d4" },
  { id: "fen", name: "Fen Bilimleri", total: 20, color: "#84cc16" },
];

export function NetForm({
  action,
  defaultType,
  error,
}: {
  action: (fd: FormData) => void;
  defaultType: "TYT" | "AYT" | "YDT";
  error: string | null;
}) {
  const [examType, setExamType] = useState<"TYT" | "AYT" | "YDT">(defaultType);
  const [values, setValues] = useState<Record<string, { d: number; y: number }>>(
    {},
  );

  const subjects =
    examType === "TYT" ? TYT_SUBJECTS : examType === "AYT" ? AYT_SUBJECTS : [];

  const today = new Date().toISOString().slice(0, 10);

  function getNet(sid: string) {
    const v = values[sid] ?? { d: 0, y: 0 };
    return Math.max(0, v.d - v.y / 4);
  }
  function getBos(sid: string, total: number) {
    const v = values[sid] ?? { d: 0, y: 0 };
    return Math.max(0, total - v.d - v.y);
  }

  const totalNet = subjects.reduce((acc, s) => acc + getNet(s.id), 0);

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
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Tarih</span>
            <input
              name="exam_date"
              type="date"
              required
              defaultValue={today}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
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
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            >
              <option value="AYT">AYT</option>
              <option value="TYT">TYT</option>
              <option value="YDT">YDT</option>
            </select>
          </label>
        </div>
      </section>

      {examType === "YDT" ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          YDT deneme şablonu yakında. Şimdilik TYT veya AYT seçebilirsin.
        </div>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Net girişleri</h3>
          <div className="mt-4 space-y-3">
            {subjects.map((s) => {
              const v = values[s.id] ?? { d: 0, y: 0 };
              const bos = getBos(s.id, s.total);
              const net = getNet(s.id);
              const valid = v.d + v.y <= s.total;
              return (
                <div
                  key={s.id}
                  className="grid items-center gap-3 rounded-md border border-border bg-background p-3 md:grid-cols-[1fr_auto_auto_auto_auto]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      / {s.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] text-emerald-500">D</label>
                    <input
                      type="number"
                      name={`${s.id}_d`}
                      min={0}
                      max={s.total}
                      value={v.d}
                      onChange={(e) =>
                        setValues((vs) => ({
                          ...vs,
                          [s.id]: {
                            d: Math.max(0, Number(e.target.value) || 0),
                            y: vs[s.id]?.y ?? 0,
                          },
                        }))
                      }
                      className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] text-rose-500">Y</label>
                    <input
                      type="number"
                      name={`${s.id}_y`}
                      min={0}
                      max={s.total}
                      value={v.y}
                      onChange={(e) =>
                        setValues((vs) => ({
                          ...vs,
                          [s.id]: {
                            d: vs[s.id]?.d ?? 0,
                            y: Math.max(0, Number(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">B: {bos}</div>
                  <div
                    className={`text-right font-mono font-semibold ${
                      valid ? "text-primary" : "text-rose-500"
                    }`}
                  >
                    {valid ? net.toFixed(2) : "geçersiz"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-md bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">Toplam net</span>
            <span className="text-xl font-semibold">{totalNet.toFixed(2)}</span>
          </div>
        </section>
      )}

      {error && (
        <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={examType === "YDT"}
          className="rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          Denemeyi kaydet
        </button>
      </div>
    </form>
  );
}
