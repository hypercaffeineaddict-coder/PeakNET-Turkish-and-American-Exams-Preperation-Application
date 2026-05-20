"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TRACKS = ["MF", "TM", "EA", "Sozel", "Dil"] as const;

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const strong = formData.getAll("strong").map(String);
  const weak = formData.getAll("weak").map(String);

  const grade = Number(formData.get("grade"));
  const daily = Number(formData.get("daily_goal_minutes")) || 60;
  const trackRaw = String(formData.get("high_school_track") || "");
  const track = (TRACKS as readonly string[]).includes(trackRaw) ? trackRaw : null;
  const isExam = formData.get("is_exam_student") === "on";

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") || ""),
      grade: Number.isFinite(grade) ? grade : null,
      high_school_track: track,
      is_exam_student: isExam,
      target_university: String(formData.get("target_university") || ""),
      target_department: String(formData.get("target_department") || ""),
      daily_goal_minutes: Math.min(720, Math.max(15, daily)),
      strong_subjects: strong,
      weak_subjects: weak,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/dashboard");
}
