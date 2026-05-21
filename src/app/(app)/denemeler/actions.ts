"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp, XP } from "@/lib/gamification";

type Totals = Record<
  string,
  { d: number; y: number; b: number; net: number }
>;

function net(d: number, y: number) {
  return Math.max(0, d - y / 4);
}

const AYT_SUBJECTS = [
  { id: "matematik", name: "Matematik", total: 40 },
  { id: "fizik", name: "Fizik", total: 14 },
  { id: "kimya", name: "Kimya", total: 13 },
  { id: "biyoloji", name: "Biyoloji", total: 13 },
];

const TYT_SUBJECTS = [
  { id: "turkce", name: "Türkçe", total: 40 },
  { id: "matematik", name: "Matematik", total: 40 },
  { id: "sosyal", name: "Sosyal Bilimler", total: 20 },
  { id: "fen", name: "Fen Bilimleri", total: 20 },
];

function subjectsForExam(type: string) {
  return type === "TYT" ? TYT_SUBJECTS : AYT_SUBJECTS;
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

  const subs = subjectsForExam(examType);
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
