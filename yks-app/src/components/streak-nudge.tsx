"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { localDate } from "@/lib/dates";
import type { getDict } from "@/lib/i18n";

type Labels = ReturnType<typeof getDict>["streakNudge"];

// Uygulama-içi streak hatırlatması: streak canlı ama bugün çalışılmamışsa,
// günde bir kez (kapatılana dek kalan) bir uyarı gösterir. Altyapı gerektirmez.
export function StreakNudge({
  atRisk,
  streakCount,
  labels,
}: {
  atRisk: boolean;
  streakCount: number;
  labels: Labels;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!atRisk) return;
    const key = `streak-nudge-${localDate()}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {}

    const id = setTimeout(() => {
      toast(`${labels.titlePrefix}${streakCount}${labels.titleSuffix}`, {
        description: labels.description,
        icon: "🔥",
        duration: Infinity,
        action: {
          label: labels.action,
          onClick: () => router.push("/pomodoro"),
        },
      });
      try {
        localStorage.setItem(key, "1");
      } catch {}
    }, 1200);

    return () => clearTimeout(id);
  }, [atRisk, streakCount, router, labels]);

  return null;
}
