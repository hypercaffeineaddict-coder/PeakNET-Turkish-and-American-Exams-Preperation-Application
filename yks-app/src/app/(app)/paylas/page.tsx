import { redirect } from "next/navigation";
import { Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { levelForXp, effectiveStreak } from "@/lib/gamification";
import { YKS_DATES, daysUntil } from "@/data/exam-date";
import { PaylasClient } from "./client";

export const metadata = { title: "Paylaş · PeakNET" };

export default async function PaylasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Hafta başı (Pazartesi)
  const now = new Date();
  const dayIdx = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - dayIdx);

  const [{ data: streak }, { data: profile }, { data: sessions }, { data: exams }] =
    await Promise.all([
      supabase.from("streaks").select("current_streak, longest_streak, last_study_date").eq("user_id", user.id).single(),
      supabase.from("profiles").select("display_name, total_xp").eq("id", user.id).single(),
      supabase
        .from("study_sessions")
        .select("duration_seconds")
        .eq("user_id", user.id)
        .gte("started_at", weekStart.toISOString()),
      supabase
        .from("exams")
        .select("totals, exam_date")
        .eq("user_id", user.id)
        .order("exam_date", { ascending: false })
        .limit(1),
    ]);

  const weekMinutes = Math.round(
    (sessions ?? []).reduce((a, s) => a + (s.duration_seconds ?? 0), 0) / 60,
  );
  const lv = levelForXp(profile?.total_xp ?? 0);
  const lastExam = (exams ?? [])[0];
  const lastNet = lastExam
    ? Object.values((lastExam.totals ?? {}) as Record<string, { net?: number }>).reduce(
        (a, v) => a + (v?.net ?? 0),
        0,
      )
    : null;
  const daysToExam = Math.max(0, daysUntil(YKS_DATES.TYT));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Share2 className="text-primary" size={26} />
          İlerlemeni Paylaş
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu haftanın özetini şık bir kartla arkadaşlarınla paylaş — hem
          motivasyon hem de seriyi göster.
        </p>
      </header>

      <PaylasClient
        name={profile?.display_name ?? "Öğrenci"}
        weekMinutes={weekMinutes}
        streak={effectiveStreak(streak)}
        longest={streak?.longest_streak ?? 0}
        level={lv.level}
        net={lastNet}
        daysToExam={daysToExam}
      />
    </div>
  );
}
