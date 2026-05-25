"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Uygulama-içi streak hatırlatması: streak canlı ama bugün çalışılmamışsa,
// günde bir kez (kapatılana dek kalan) bir uyarı gösterir. Altyapı gerektirmez.
export function StreakNudge({
  atRisk,
  streakCount,
}: {
  atRisk: boolean;
  streakCount: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!atRisk) return;
    const key = `streak-nudge-${new Date().toISOString().slice(0, 10)}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {}

    const id = setTimeout(() => {
      toast(`${streakCount} günlük serin tehlikede!`, {
        description: "Bugün henüz çalışmadın. Kısa bir Pomodoro serini kurtarır.",
        icon: "🔥",
        duration: Infinity,
        action: {
          label: "Başla",
          onClick: () => router.push("/pomodoro"),
        },
      });
      try {
        localStorage.setItem(key, "1");
      } catch {}
    }, 1200);

    return () => clearTimeout(id);
  }, [atRisk, streakCount, router]);

  return null;
}
