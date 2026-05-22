"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp, XP } from "@/lib/gamification";
import { examSubjects } from "@/data/exam-subjects";

type Totals = Record<
  string,
  { d: number; y: number; b: number; net: number }
>;

function net(d: number, y: number) {
  return Math.max(0, d - y / 4);
}

export async function createExam(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const examType = String(formData.get("exam_type") || "AYT");
  const examDate = String(formData.get("exam_date") || "");
  if (!name || !examDate) {
    redirect(`/denemeler/yeni?error=${encodeURIComponent("Ad ve tarih gerekli")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("high_school_track")
    .eq("id", user.id)
    .single();

  const subs = examSubjects(examType, profile?.high_school_track ?? null);
  const totals: Totals = {};
  for (const s of subs) {
    const d = Math.max(0, Number(formData.get(`${s.id}_d`)) || 0);
    const y = Math.max(0, Number(formData.get(`${s.id}_y`)) || 0);
    const b = Math.max(0, s.total - d - y);
    totals[s.id] = { d, y, b, net: net(d, y) };
  }

  const { error } = await supabase.from("exams").insert({
    user_id: user.id,
    name,
    exam_type: examType,
    exam_date: examDate,
    totals,
  });
  if (error) {
    redirect(`/denemeler/yeni?error=${encodeURIComponent(error.message)}`);
  }

  await awardXp(XP.examAdded, "exam_added");

  revalidatePath("/denemeler");
  redirect("/denemeler");
}

export async function deleteExam(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id"));
  await supabase.from("exams").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/denemeler");
}
