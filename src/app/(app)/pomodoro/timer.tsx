"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Settings2 } from "lucide-react";
import { recordSession } from "./actions";

type Subject = {
  id: string;
  name: string;
  color: string;
  topics: { id: string; name: string; display_order: number }[];
};

type Mode = "work" | "short_break" | "long_break";

const PRESETS = [
  { name: "Klasik", work: 25, short: 5, long: 15 },
  { name: "Uzun odak", work: 50, short: 10, long: 20 },
  { name: "Derin", work: 90, short: 20, long: 30 },
  { name: "Kısa", work: 15, short: 3, long: 10 },
];

const STORAGE_KEY = "yks_pomo_durations_v1";
const RUN_KEY = "yks_pomo_run_v1";

function loadDurations(): { work: number; short: number; long: number } {
  if (typeof window === "undefined") return { work: 25, short: 5, long: 15 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { work: 25, short: 5, long: 15 };
}

function saveDurations(d: { work: number; short: number; long: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {}
}

type RunState = {
  mode: Mode;
  endsAt: number; // ms epoch
  pomoCount: number;
  subjectId: string;
  topicId: string;
};
function saveRunState(s: RunState | null) {
  try {
    if (s) localStorage.setItem(RUN_KEY, JSON.stringify(s));
    else localStorage.removeItem(RUN_KEY);
  } catch {}
}
function loadRunState(): RunState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RunState;
  } catch {
    return null;
  }
}

function notifyBrowser(title: string, body: string) {
  try {
    if (typeof window === "undefined") return;
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icon.svg", silent: false });
    }
  } catch {}
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

const MODE_LABEL: Record<Mode, string> = {
  work: "Odak",
  short_break: "Kısa mola",
  long_break: "Uzun mola",
};

export function PomodoroTimer({
  subjects,
  initialTopic,
  initialSubject,
}: {
  subjects: Subject[];
  initialTopic: string;
  initialSubject: string;
}) {
  const [durations, setDurations] = useState({ work: 25, short: 5, long: 15 });
  const [mode, setMode] = useState<Mode>("work");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pomoCount, setPomoCount] = useState(0);
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [topicId, setTopicId] = useState(initialTopic);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const lastTickRef = useRef<number>(Date.now());

  // localStorage'tan yükle + çalışan timer varsa resume
  useEffect(() => {
    const d = loadDurations();
    setDurations(d);

    const rs = loadRunState();
    if (rs) {
      const remaining = Math.max(0, Math.floor((rs.endsAt - Date.now()) / 1000));
      if (remaining > 0) {
        setMode(rs.mode);
        setSeconds(remaining);
        setPomoCount(rs.pomoCount);
        if (rs.subjectId) setSubjectId(rs.subjectId);
        if (rs.topicId) setTopicId(rs.topicId);
        // Otomatik başlatma — kullanıcı sekmeden çıkmış olsa bile devam et
        lastTickRef.current = Date.now();
        setRunning(true);
        return;
      }
      // Süre geçmiş — sıfırla
      saveRunState(null);
    }
    setSeconds(d.work * 60);
  }, []);

  // Bildirim izni — ilk start'ta iste
  useEffect(() => {
    if (running) void ensureNotificationPermission();
  }, [running]);

  // Çalışırken state'i localStorage'da tut
  useEffect(() => {
    if (running) {
      const endsAt = Date.now() + seconds * 1000;
      saveRunState({ mode, endsAt, pomoCount, subjectId, topicId });
    } else {
      saveRunState(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function secondsForMode(m: Mode) {
    if (m === "work") return durations.work * 60;
    if (m === "short_break") return durations.short * 60;
    return durations.long * 60;
  }

  // 1 saniye tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta > 0) {
        lastTickRef.current = now;
        setSeconds((s) => Math.max(0, s - delta));
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  // Süre bittiğinde
  useEffect(() => {
    if (seconds !== 0 || !running) return;
    setRunning(false);
    saveRunState(null);
    playBeep();

    if (mode === "work") {
      notifyBrowser(
        "Pomodoro bitti 🎯",
        `${durations.work} dakikalık odak seansını tamamladın. Mola zamanı!`,
      );
      const nextCount = pomoCount + 1;
      setPomoCount(nextCount);
      const usedSec = durations.work * 60;
      startTransition(async () => {
        const fd = new FormData();
        fd.set("duration_seconds", String(usedSec));
        fd.set("pomodoros", "1");
        if (subjectId) fd.set("subject_id", subjectId);
        if (topicId) fd.set("topic_id", topicId);
        const res = await recordSession(fd);
        if (res?.error) {
          setSavedMsg(`Hata: ${res.error}`);
        } else {
          setSavedMsg(`${durations.work} dk kaydedildi 🔥`);
          setTimeout(() => setSavedMsg(null), 4000);
        }
      });
      switchMode(nextCount % 4 === 0 ? "long_break" : "short_break");
    } else {
      notifyBrowser("Mola bitti", "Tekrar odaklanma vakti. Çalışmaya dön.");
      switchMode("work");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running]);

  function switchMode(m: Mode) {
    setMode(m);
    setSeconds(secondsForMode(m));
    setRunning(false);
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    const d = { work: p.work, short: p.short, long: p.long };
    setDurations(d);
    saveDurations(d);
    setRunning(false);
    setSeconds(d.work * 60);
    setMode("work");
  }

  function updateDuration(key: "work" | "short" | "long", value: number) {
    const v = Math.max(1, Math.min(180, Math.round(value)));
    const d = { ...durations, [key]: v };
    setDurations(d);
    saveDurations(d);
    if ((key === "work" && mode === "work") ||
        (key === "short" && mode === "short_break") ||
        (key === "long" && mode === "long_break")) {
      setSeconds(v * 60);
    }
  }

  function start() {
    lastTickRef.current = Date.now();
    setRunning(true);
  }

  const totalForMode = secondsForMode(mode);
  const progressPct = ((totalForMode - seconds) / totalForMode) * 100;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const topicsForSubject = subjects.find((s) => s.id === subjectId)?.topics ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      {/* Mode toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {(["work", "short_break", "long_break"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                mode === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "work" ? "🎯" : <Coffee size={12} className="inline" />}{" "}
              {MODE_LABEL[m]} ·{" "}
              {m === "work"
                ? durations.work
                : m === "short_break"
                  ? durations.short
                  : durations.long}{" "}
              dk
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Settings2 size={12} />
          Süreler
        </button>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="mb-6 rounded-xl border border-border bg-muted/20 p-4 space-y-4">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Hızlı preset
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs transition hover:bg-muted"
                >
                  {p.name} · {p.work}/{p.short}/{p.long}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Özel (dakika)
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <DurationInput
                label="Odak"
                value={durations.work}
                onChange={(v) => updateDuration("work", v)}
              />
              <DurationInput
                label="Kısa mola"
                value={durations.short}
                onChange={(v) => updateDuration("short", v)}
              />
              <DurationInput
                label="Uzun mola"
                value={durations.long}
                onChange={(v) => updateDuration("long", v)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Timer dial */}
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="relative h-64 w-64">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/40"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className={mode === "work" ? "text-primary" : "text-emerald-500"}
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={
                2 * Math.PI * 45 - (progressPct / 100) * 2 * Math.PI * 45
              }
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-5xl font-semibold tabular-nums">
              {mm}:{ss}
            </div>
            <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
              {MODE_LABEL[mode]} · {pomoCount} pomodoro
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSeconds(secondsForMode(mode));
              setRunning(false);
            }}
            className="rounded-full border border-border bg-background p-3 transition hover:bg-muted"
            title="Sıfırla"
          >
            <RotateCcw size={18} />
          </button>
          {running ? (
            <button
              type="button"
              onClick={() => setRunning(false)}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Pause size={22} />
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Play size={22} className="fill-current" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSeconds(0)}
            className="rounded-full border border-border bg-background p-3 transition hover:bg-muted"
            title="Atla"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {savedMsg && (
          <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-500">
            {savedMsg}
          </p>
        )}
        {pending && (
          <p className="mt-4 text-xs text-muted-foreground">Kaydediliyor...</p>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-muted-foreground">Hangi ders?</span>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setTopicId("");
            }}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Genel çalışma</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground">Hangi konu? (opsiyonel)</span>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            disabled={!subjectId}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
          >
            <option value="">— Konusuz</option>
            {topicsForSubject
              .slice()
              .sort((a, b) => a.display_order - b.display_order)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function DurationInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(value - 5)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
        >
          -5
        </button>
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
        >
          -1
        </button>
        <input
          type="number"
          min={1}
          max={180}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 1)}
          className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => onChange(value + 5)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
        >
          +5
        </button>
      </div>
    </label>
  );
}

function playBeep() {
  try {
    type WCtor = typeof AudioContext;
    type WindowWithWebkit = Window &
      typeof globalThis & { webkitAudioContext?: WCtor };
    const w = window as WindowWithWebkit;
    const Ctx: WCtor | undefined = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.start();
    o.stop(ctx.currentTime + 0.6);
  } catch {
    /* sessiz */
  }
}
