"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const TRACKS = ["MF", "TM", "Sozel", "Dil"] as const;
// Açılabilecek ekstra (YKS-dışı) sınav aileleri.
const VALID_EXTRA_EXAMS = ["AP"];

export async function updateProfile(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const strong = formData.getAll("strong").map(String);
  const weak = formData.getAll("weak").map(String);
  const grade = Number(formData.get("grade"));
  const daily = Number(formData.get("daily_goal_minutes")) || 60;
  const trackRaw = String(formData.get("high_school_track") || "");
  const track = (TRACKS as readonly string[]).includes(trackRaw) ? trackRaw : null;
  const isExam = formData.get("is_exam_student") === "on";
  const extraExams = formData
    .getAll("extra_exams")
    .map(String)
    .filter((e) => VALID_EXTRA_EXAMS.includes(e));

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
      extra_exams: extraExams,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/ayarlar");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateProfileMedia(data: {
  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const patch: Record<string, unknown> = {};
  if (data.avatar_url !== undefined) patch.avatar_url = data.avatar_url;
  if (data.banner_url !== undefined) patch.banner_url = data.banner_url;
  if (data.bio !== undefined) patch.bio = data.bio.slice(0, 280);
  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/ayarlar");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function changePassword(
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok" };

  const newPassword = String(formData.get("new_password") || "");
  if (newPassword.length < 6)
    return { error: "Şifre en az 6 karakter olmalı" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const confirm = String(formData.get("confirm") || "");
  if (confirm !== user.email) {
    redirect(`/ayarlar?danger_error=${encodeURIComponent("E-postanı tam yazmadın")}`);
  }

  // RLS ile kullanıcı kendi profile/streak/sessions vs. zaten cascade silinir
  // auth.users'tan silmek için service role gerekir; bu MVP'de kullanıcının kendi
  // verilerini silip oturumdan çıkarıyoruz (auth user kalır ama 'arşivlenmiş' olur).
  await supabase.from("profiles").delete().eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/login?deleted=1");
}
