"use client";

import { useEffect, useRef, useState } from "react";
import {
  Headphones,
  Play,
  Pause,
  Volume2,
  ChevronUp,
  ChevronDown,
  Wind,
  Waves,
  Cloud,
  Activity,
  Brain,
  Sparkles,
} from "lucide-react";

type SoundKind =
  | "off"
  | "white"
  | "pink"
  | "brown"
  | "binaural_alpha"
  | "binaural_beta"
  | "binaural_theta";

const SOUNDS: {
  id: SoundKind;
  label: string;
  description: string;
  icon: typeof Wind;
}[] = [
  {
    id: "brown",
    label: "Brown noise",
    description: "Yağmur/uğultu — derin odak",
    icon: Cloud,
  },
  {
    id: "pink",
    label: "Pink noise",
    description: "Dengeli, yumuşak",
    icon: Wind,
  },
  {
    id: "white",
    label: "White noise",
    description: "Keskin, dış ses örter",
    icon: Waves,
  },
  {
    id: "binaural_alpha",
    label: "Alpha (10 Hz)",
    description: "Rahat odak, beyin dinginleşir",
    icon: Brain,
  },
  {
    id: "binaural_beta",
    label: "Beta (16 Hz)",
    description: "Aktif konsantrasyon",
    icon: Activity,
  },
  {
    id: "binaural_theta",
    label: "Theta (6 Hz)",
    description: "Derin düşünme, yaratıcılık",
    icon: Sparkles,
  },
];

export function FocusPlayer() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SoundKind>("off");
  const [volume, setVolume] = useState(0.3);

  const audioRef = useRef<{
    ctx: AudioContext;
    nodes: AudioNode[];
    gain: GainNode;
  } | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Volume güncelle
  useEffect(() => {
    if (audioRef.current?.gain) {
      audioRef.current.gain.gain.setTargetAtTime(
        volume,
        audioRef.current.ctx.currentTime,
        0.05,
      );
    }
  }, [volume]);

  function stopAudio() {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.nodes.forEach((n) => {
        if ("stop" in n && typeof n.stop === "function")
          (n as OscillatorNode | AudioBufferSourceNode).stop();
        n.disconnect();
      });
      a.gain.disconnect();
      a.ctx.close();
    } catch {}
    audioRef.current = null;
  }

  function play(kind: SoundKind) {
    if (kind === "off") {
      stopAudio();
      setCurrent("off");
      return;
    }
    stopAudio();

    type WCtor = typeof AudioContext;
    type WindowWithWebkit = Window &
      typeof globalThis & { webkitAudioContext?: WCtor };
    const w = window as WindowWithWebkit;
    const Ctx = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    const nodes: AudioNode[] = [];

    if (kind === "white" || kind === "pink" || kind === "brown") {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      // Brown noise için kümülatif filtre
      let lastOut = 0;
      // Pink noise için Paul Kellet filter
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "white") {
          data[i] = w * 0.5;
        } else if (kind === "pink") {
          b0 = 0.99886 * b0 + w * 0.0555179;
          b1 = 0.99332 * b1 + w * 0.0750759;
          b2 = 0.969 * b2 + w * 0.153852;
          b3 = 0.8665 * b3 + w * 0.3104856;
          b4 = 0.55 * b4 + w * 0.5329522;
          b5 = -0.7616 * b5 - w * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
          b6 = w * 0.115926;
        } else {
          // brown
          lastOut = (lastOut + 0.02 * w) / 1.02;
          data[i] = lastOut * 3.5;
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(gain);
      src.start();
      nodes.push(src);
    } else {
      // Binaural beats
      const baseFreq = 200; // taşıyıcı
      const beat =
        kind === "binaural_alpha" ? 10 : kind === "binaural_beta" ? 16 : 6;
      const merger = ctx.createChannelMerger(2);
      const oL = ctx.createOscillator();
      oL.frequency.value = baseFreq;
      const oR = ctx.createOscillator();
      oR.frequency.value = baseFreq + beat;
      const gL = ctx.createGain();
      gL.gain.value = 0.4;
      const gR = ctx.createGain();
      gR.gain.value = 0.4;
      oL.connect(gL).connect(merger, 0, 0);
      oR.connect(gR).connect(merger, 0, 1);
      merger.connect(gain);
      oL.start();
      oR.start();
      nodes.push(oL, oR, gL, gR, merger);
    }

    audioRef.current = { ctx, nodes, gain };
    setCurrent(kind);
  }

  const isPlaying = current !== "off";
  const currentSound = SOUNDS.find((s) => s.id === current);

  if (!open) {
    return (
      <div className="mx-2 mb-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex w-full items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2 text-sm transition hover:bg-card ${
            isPlaying ? "border-primary/40" : ""
          }`}
        >
          <Headphones
            size={14}
            className={isPlaying ? "text-primary" : "text-muted-foreground"}
          />
          <span className="flex-1 truncate text-left text-xs">
            {isPlaying ? currentSound?.label : "Odak müziği"}
          </span>
          <ChevronUp size={12} className="text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-2 mb-2 rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Headphones size={12} className="text-primary" />
          Odak Müziği
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="space-y-1">
        {SOUNDS.map((s) => {
          const Icon = s.icon;
          const active = s.id === current;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => play(s.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={s.description}
            >
              <Icon size={12} className="shrink-0" />
              <span className="flex-1 truncate">{s.label}</span>
              {active &&
                (isPlaying ? (
                  <Pause size={10} />
                ) : (
                  <Play size={10} className="fill-current" />
                ))}
            </button>
          );
        })}
      </div>

      {isPlaying && (
        <>
          <div className="my-2 border-t border-border" />
          <button
            type="button"
            onClick={() => play("off")}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-border bg-background py-1 text-[10px] text-muted-foreground transition hover:text-foreground"
          >
            <Pause size={10} /> Durdur
          </button>
          <div className="mt-2 flex items-center gap-2">
            <Volume2 size={12} className="text-muted-foreground" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-7 text-right text-[10px] text-muted-foreground tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
          {currentSound && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              {currentSound.description}
            </p>
          )}
        </>
      )}
    </div>
  );
}
