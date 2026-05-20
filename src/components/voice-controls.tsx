"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

// Web Speech API tipleri (TypeScript'in DOM lib'inde Recognition tipleri yok)
type SpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};
type SpeechRecognitionEvent = Event & {
  results: { length: number; [index: number]: SpeechRecognitionResult };
  resultIndex: number;
};
type SpeechRecognitionErrorEvent = Event & { error: string };
type SpeechRecognitionInstance = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;
type WindowWithSpeech = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as WindowWithSpeech;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.speechSynthesis !== "undefined";
}

// BCP 47 dil kodu — UI parametresinden geliyor.
export function speak(
  text: string,
  options?: { lang?: string; rate?: number; pitch?: number },
): void {
  if (!isSpeechSynthesisSupported()) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = options?.lang ?? "tr-TR";
  utt.rate = options?.rate ?? 1;
  utt.pitch = options?.pitch ?? 1;
  // Mevcut konuşmayı durdurup yenisini başlat
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}

export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}

/**
 * Mikrofon butonu — kullanıcı konuştuğunda transcript'i parent'a verir.
 * Tek-atımlı (push-to-talk benzeri) - butona basınca dinler, tekrar basınca durur.
 */
export function MicButton({
  lang = "tr-TR",
  onTranscript,
  disabled = false,
  title,
}: {
  lang?: string;
  onTranscript: (text: string, isFinal: boolean) => void;
  disabled?: boolean;
  title?: string;
}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const supported = isSpeechRecognitionSupported();

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
    };
  }, []);

  function start() {
    if (!supported) {
      setError("Tarayıcı sesli giriş desteklemiyor (Chrome/Edge dene)");
      return;
    }
    setError(null);
    const w = window as WindowWithSpeech;
    const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition)!;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let acc = "";
      let isFinal = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        acc += r[0].transcript;
        if (r.isFinal) isFinal = true;
      }
      onTranscript(acc.trim(), isFinal);
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "no-speech") {
        setError("Ses algılanmadı");
      } else if (e.error === "not-allowed") {
        setError("Mikrofon izni reddedildi");
      } else {
        setError(e.error);
      }
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Mikrofon başlatılamadı");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={listening ? stop : start}
        disabled={disabled || !supported}
        title={
          !supported
            ? "Sesli giriş bu tarayıcıda yok (Chrome/Edge dene)"
            : title ?? (listening ? "Dinlemeyi durdur" : "Sesli soru sor")
        }
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
          listening
            ? "border-rose-500 bg-rose-500/10 text-rose-500 animate-pulse"
            : "border-border bg-card text-muted-foreground hover:text-foreground"
        } disabled:opacity-50`}
      >
        {listening ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
      {error && (
        <div className="absolute right-0 top-11 z-10 w-48 rounded-md border border-border bg-card p-2 text-xs text-rose-500 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Sesli okuma toggle butonu — açık olduğunda parent kendisi speak() çağıracak.
 */
export function SpeakerToggle({
  on,
  onChange,
  title,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  title?: string;
}) {
  const supported = isSpeechSynthesisSupported();
  return (
    <button
      type="button"
      onClick={() => {
        if (on) stopSpeaking();
        onChange(!on);
      }}
      disabled={!supported}
      title={
        !supported
          ? "Tarayıcı sesli okumayı desteklemiyor"
          : title ?? (on ? "Sesli okumayı kapat" : "Cevapları sesli oku")
      }
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
        on
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      } disabled:opacity-50`}
    >
      {on ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
}
