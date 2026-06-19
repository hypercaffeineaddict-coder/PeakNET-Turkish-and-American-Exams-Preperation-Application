"use client";
import { Volume2, VolumeX } from "lucide-react";

type SpeakerToggleProps = {
  on: boolean;
  onChange: (on: boolean) => void;
  title?: string;
};

export function SpeakerToggle({
  on,
  onChange,
  title = "Sesli oku",
}: SpeakerToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      title={title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
        on
          ? "bg-primary/10 text-primary"
          : "border border-border bg-background text-muted-foreground hover:text-foreground"
      }`}
    >
      {on ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
}
