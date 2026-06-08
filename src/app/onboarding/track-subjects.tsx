"use client";

import { useState } from "react";
import { BookOpenCheck, Sparkles } from "lucide-react";
import { selfSubjects } from "@/data/exam-subjects";
import type { getDict } from "@/lib/i18n";

type Tracks = ReturnType<typeof getDict>["onboarding"]["tracks"];

const TRACK_ORDER: (keyof Tracks)[] = ["MF", "TM", "Sozel", "Dil"];

export function TrackSubjects({
  defaultTrack,
  defaultStrong,
  defaultWeak,
  labels,
}: {
  defaultTrack: string | null;
  defaultStrong: string[];
  defaultWeak: string[];
  labels: {
    sectionTrack: string;
    sectionSubjects: string;
    strongHeader: string;
    weakHeader: string;
    tracks: Tracks;
  };
}) {
  const [track, setTrack] = useState<string>(defaultTrack ?? "MF");
  const subjects = selfSubjects(track);

  return (
    <>
      {/* Lise bölümü */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <BookOpenCheck size={16} className="text-primary" />
          {labels.sectionTrack}
        </header>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRACK_ORDER.map((key) => {
            const t = labels.tracks[key];
            return (
              <label
                key={key}
                className="cursor-pointer rounded-xl border border-border bg-background p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="radio"
                  name="high_school_track"
                  value={key}
                  required
                  className="hidden"
                  checked={track === key}
                  onChange={() => setTrack(key)}
                />
                <div className="text-sm font-medium">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.hint}</div>
              </label>
            );
          })}
        </div>
      </section>

      {/* Güçlü / zayıf — track'e göre */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-primary" />
          {labels.sectionSubjects}
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-500">
              {labels.strongHeader}
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
              {labels.weakHeader}
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
