"use client";

import { useState } from "react";
import { Flashcard } from "@/components/flashcard";
import { processFlashcardReview, type Grade } from "./actions";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

interface FlashcardDeckProps {
  cards: FlashcardData[];
  lang: string;
}

export function FlashcardDeck({ cards, lang }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight">
          Günün Kelimeleri Bitti!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Harika iş çıkardın. Bugün tekrar etmen gereken tüm kelimeleri tamamladın.
          Yarın yeni kartlarla görüşmek üzere.
        </p>
        <button 
          onClick={() => router.push(`/diller/${lang}`)}
          className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95"
        >
          Ana Ekrana Dön
        </button>
      </div>
    );
  }

  const handleGrade = async (grade: Grade) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const card = cards[currentIndex];
    const res = await processFlashcardReview(card.id, grade);
    
    if (res.ok) {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(curr => curr + 1);
      } else {
        router.refresh(); // Refresh page to see empty state or get next batch
      }
    }
    
    setIsProcessing(false);
  };

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8">
      {/* Progress Bar */}
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>{currentIndex + 1} / {cards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="relative w-full">
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-sm">
            <RefreshCw size={24} className="animate-spin text-primary" />
          </div>
        )}
        <Flashcard
          key={currentCard.id}
          front={currentCard.front}
          back={currentCard.back}
          onGrade={handleGrade}
        />
      </div>
    </div>
  );
}
