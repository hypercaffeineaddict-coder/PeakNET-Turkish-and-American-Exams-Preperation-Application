"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { effectiveStreak, studiedToday } from "@/lib/gamification";
import { createClient } from "@/lib/supabase/client";

export function StreakDisplay({ userId, locale }: { userId: string; locale: string }) {
  const [streakCount, setStreakCount] = useState(0);

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
        setStreakCount(effectiveStreak(data));
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  if (streakCount === 0) return null;

  const title = locale === "tr" ? "Günlük Seri" : "Daily Streak";

  return (
    <span className="group flex items-center gap-1.5 rounded-full bg-orange-500/10 py-1 pl-2 pr-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-500/20" title={title}>
      <Flame size={14} className={streakCount > 0 ? "animate-ember" : ""} />
      <span className="font-display tabular-nums">{streakCount}</span>
    </span>
  );
}