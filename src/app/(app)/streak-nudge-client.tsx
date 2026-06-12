"use client";

import { useEffect, useState } from "react";
import { Flame, X } from "lucide-react";
import { effectiveStreak, studiedToday } from "@/lib/gamification";
import { createClient } from "@/lib/supabase/client";

export function StreakNudgeClient({ userId, labels }: { userId: string; labels: ReturnType<typeof import("@/lib/i18n").getDict>["streakNudge"] }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    supabase
      .from("streaks")
      .select("current_streak, last_study_date")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (!mounted || !data) return;
        const count = effectiveStreak(data);
        if (count > 0 && !studiedToday(data)) setShow(true);
      });
    return () => { mounted = false; };
  }, [userId]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up lg:hidden">
      <div className="flex max-w-sm items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 shadow-lg backdrop-blur">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-500">
          <Flame size={20} className="animate-ember" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{labels.title}</p>
          <p className="text-xs text-muted-foreground">{labels.body}</p>
        </div>
        <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground" aria-label={labels.dismiss}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
}