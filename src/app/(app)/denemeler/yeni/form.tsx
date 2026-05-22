"use client";

import { useState } from "react";
import { examSubjects } from "@/data/exam-subjects";

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
  const [values, setValues] = useState<Record<string, { d: number; y: number }>>(
    {},
  );

  const subjects = examSubjects(examType, track);

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

      {subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Bu sınav türü için ders listesi yok. Lise bölümüne göre TYT, AYT veya
          YDT seç.
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
          disabled={subjects.length === 0}
          className="rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          Denemeyi kaydet
        </button>
      </div>
    </form>
  );
}
