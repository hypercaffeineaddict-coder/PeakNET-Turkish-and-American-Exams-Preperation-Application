"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";

type MicButtonProps = {
  lang: string;
  disabled?: boolean;
  title?: string;
  onTranscript: (text: string, isFinal: boolean) => void;
};

export function MicButton({
  lang,
  disabled = false,
  title = "Konuş",
  onTranscript,
}: MicButtonProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      if (interim) onTranscript(interim, false);
      if (final) onTranscript(final.trim(), true);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        toast.error(`Ses tanıma hatası: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Tarayıcınız ses tanımayı desteklemiyor.");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
    }
  };

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      title={title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
        listening
          ? "bg-rose-500/10 text-rose-500"
          : "border border-border bg-background text-muted-foreground hover:text-foreground"
      } disabled:opacity-50`}
    >
      {listening ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Mic size={16} />
      )}
    </button>
  );
}
