"use client";

import { useState } from "react";
import { BookOpenCheck, Sparkles } from "lucide-react";
import { selfSubjects } from "@/data/exam-subjects";

const TRACKS: { value: string; label: string; hint: string }[] = [
  { value: "MF", label: "Sayısal (MF)", hint: "Mat·Fiz·Kim·Biy" },
  { value: "TM", label: "Eşit Ağırlık (TM)", hint: "Mat·Edebiyat·Tarih·Coğrafya" },
  { value: "Sozel", label: "Sözel", hint: "Edebiyat·Tarih·Coğrafya·Felsefe" },
  { value: "Dil", label: "Dil", hint: "İngilizce ağırlıklı" },
];

export function TrackSubjects({
  defaultTrack,
  defaultStrong,
  defaultWeak,
}: {
  defaultTrack: string | null;
  defaultStrong: string[];
  defaultWeak: string[];
}) {
  const [track, setTrack] = useState<string>(defaultTrack ?? "MF");
  const subjects = selfSubjects(track);

  return (
    <>
      {/* Lise bölümü */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <BookOpenCheck size={16} className="text-primary" />
          Lise bölümün
        </header>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRACKS.map((t) => (
            <label
              key={t.value}
              className="cursor-pointer rounded-xl border border-border bg-background p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="high_school_track"
                value={t.value}
                required
                className="hidden"
                checked={track === t.value}
                onChange={() => setTrack(t.value)}
              />
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.hint}</div>
            </label>
          ))}
        </div>
      </section>

      {/* Güçlü / zayıf — track'e göre */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-primary" />
          Dersler — kendini nasıl görüyorsun?
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-500">
              Güçlü olduğun
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <label
                  key={s.id}
                  className="cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-sm transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/10 has-[:checked]:text-emerald-500"
                >
                  <input
                    type="checkbox"
                    name="strong"
                    value={s.id}
                    defaultChecked={defaultStrong.includes(s.id)}
                    className="hidden"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-500">
              Geliştirmen gereken
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <label
                  key={s.id}
                  className="cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-sm transition has-[:checked]:border-rose-500 has-[:checked]:bg-rose-500/10 has-[:checked]:text-rose-500"
                >
                  <input
                    type="checkbox"
                    name="weak"
                    value={s.id}
                    defaultChecked={defaultWeak.includes(s.id)}
                    className="hidden"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
