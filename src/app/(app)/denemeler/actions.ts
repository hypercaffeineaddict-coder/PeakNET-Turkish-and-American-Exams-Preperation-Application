"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp, XP } from "@/lib/gamification";
import { examSubjects } from "@/data/exam-subjects";

type Totals = Record<
  string,
  { d: number; y: number; b: number; net: number; name?: string }
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
    // Soru sayısı yayına göre kullanıcı tarafından değiştirilebilir.
    const totalRaw = formData.get(`${s.id}_total`);
    const total = Math.max(
      0,
      totalRaw == null ? s.total : Number(totalRaw) || 0,
    );
    const d = Math.max(0, Number(formData.get(`${s.id}_d`)) || 0);
    const y = Math.max(0, Number(formData.get(`${s.id}_y`)) || 0);
    // 0 soru = bu derste deneme yok → kaydetme.
    if (total === 0 && d === 0 && y === 0) continue;
    const b = Math.max(0, total - d - y);
    totals[s.id] = { d, y, b, net: net(d, y) };
  }

  // Özel/branda dersler (form.tsx hidden JSON ile gönderiyor)
  const rawCustom = String(formData.get("custom_subjects") || "[]");
  try {
    const parsed = JSON.parse(rawCustom) as Array<{
      name?: string;
      total?: number;
      d?: number;
      y?: number;
    }>;
    let cIdx = 0;
    for (const c of parsed) {
      const cname = String(c?.name ?? "").trim().slice(0, 60);
      const ct = Math.max(0, Number(c?.total) || 0);
      const cd = Math.max(0, Number(c?.d) || 0);
      const cy = Math.max(0, Number(c?.y) || 0);
      if (!cname || ct === 0) continue;
      // ID çakışmasını önle: _c_ prefix + slug + index
      const slug = cname
        .toLocaleLowerCase("tr-TR")
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 30) || `c${cIdx}`;
      const cid = `_c_${slug}_${cIdx++}`;
      totals[cid] = {
        d: cd,
        y: cy,
        b: Math.max(0, ct - cd - cy),
        net: net(cd, cy),
        name: cname,
      };
    }
  } catch {
    // bozuk JSON gelirse sessizce yoksay
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
