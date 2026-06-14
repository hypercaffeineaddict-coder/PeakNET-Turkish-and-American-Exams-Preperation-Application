"use client";

import { useState } from "react";
import { Check, Frown, Lightbulb, RotateCcw } from "lucide-react";
import { type Grade } from "@/app/(app)/diller/[lang]/kartlar/actions";
import clsx from "clsx";

interface FlashcardProps {
  front: string;
  back: string;
  onGrade: (grade: Grade) => void;
}

export function Flashcard({ front, back, onGrade }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsAnimating(false), 400); // Wait for transition
  };

  const handleGrade = (grade: Grade) => {
    onGrade(grade);
    setIsFlipped(false);
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      {/* 3D Flip Container */}
      <div 
        className="group relative h-72 w-full cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={clsx(
            "preserve-3d absolute h-full w-full rounded-2xl shadow-soft transition-transform duration-500 ease-in-out",
            isFlipped ? "rotate-y-180" : ""
          )}
        >
          {/* Front Side */}
          <div className="backface-hidden absolute flex h-full w-full items-center justify-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {front}
            </h2>
            <div className="absolute bottom-4 flex items-center gap-2 text-xs text-muted-foreground opacity-50">
              <RotateCcw size={14} />
              <span>Çevirmek için tıkla</span>
            </div>
          </div>

          {/* Back Side */}
          <div className="backface-hidden rotate-y-180 absolute flex h-full w-full flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-primary">
              {back}
            </h2>
          </div>
        </div>
      </div>

      {/* Action Buttons (Only visible when flipped) */}
      <div 
        className={clsx(
          "flex w-full gap-3 transition-all duration-300",
          isFlipped ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <button
          onClick={() => handleGrade("hard")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/20 active:scale-95"
        >
          <Frown size={18} /> Zor
        </button>
        <button
          onClick={() => handleGrade("good")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-600 transition hover:bg-amber-500/20 active:scale-95"
        >
          <Lightbulb size={18} /> İyi
        </button>
        <button
          onClick={() => handleGrade("easy")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-500/20 active:scale-95"
        >
          <Check size={18} /> Kolay
        </button>
      </div>
    </div>
  );
}
