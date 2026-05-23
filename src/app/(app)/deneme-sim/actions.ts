"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp, XP } from "@/lib/gamification";

type Totals = Record<string, { d: number; y: number; b: number; net: number }>;

// Deneme simülasyonu sonucunu exams tablosuna kaydeder (denemeler trendine düşsün).
export async function saveMockExam(
  examType: string,
  totals: Totals,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const today = new Date().toISOString().slice(0, 10);
  const name = `AI Deneme · ${examType} (${today})`;

  const { error } = await supabase.from("exams").insert({
    user_id: user.id,
    name,
    exam_type: examType === "TYT" || examType === "AYT" || examType === "YDT" ? examType : "AYT",
    exam_date: today,
    totals,
  });
  if (error) return { error: error.message };

  await awardXp(XP.examAdded, "mock_exam");
  revalidatePath("/denemeler");
  return { ok: true };
}
