import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { DeleteAccountForm } from "./delete-form";
import { OfflineSettings } from "./offline-settings";

export default async function AyarlarPage({
  searchParams,
}: {
  searchParams: Promise<{ danger_error?: string }>;
}) {
  const { danger_error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Settings className="text-primary" size={26} />
          Ayarlar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profil bilgilerini güncelle, şifreni değiştir veya hesabını sil.
        </p>
      </header>

      <ProfileForm
        profile={{
          display_name: profile?.display_name ?? "",
          grade: profile?.grade ?? null,
          high_school_track: profile?.high_school_track ?? null,
          is_exam_student: profile?.is_exam_student ?? false,
          target_university: profile?.target_university ?? "",
          target_department: profile?.target_department ?? "",
          daily_goal_minutes: profile?.daily_goal_minutes ?? 60,
          strong_subjects: profile?.strong_subjects ?? [],
          weak_subjects: profile?.weak_subjects ?? [],
        }}
        email={user.email ?? ""}
      />

      <PasswordForm />

      <OfflineSettings />

      <DeleteAccountForm email={user.email ?? ""} initialError={danger_error} />
    </div>
  );
}
