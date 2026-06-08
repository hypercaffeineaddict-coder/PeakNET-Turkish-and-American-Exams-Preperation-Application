import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { DeleteAccountForm } from "./delete-form";
import { OfflineSettings } from "./offline-settings";
import { ProfileMedia } from "./profile-media";
import { NotificationSettings } from "@/components/notification-settings";
import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";

export default async function AyarlarPage({
  searchParams,
}: {
  searchParams: Promise<{ danger_error?: string }>;
}) {
  const { danger_error } = await searchParams;
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const t = dict.settings;
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
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </header>

      <ProfileMedia
        initialAvatar={profile?.avatar_url ?? null}
        initialBanner={profile?.banner_url ?? null}
        initialBio={profile?.bio ?? ""}
        displayName={profile?.display_name ?? ""}
        labels={dict.profileMedia}
      />

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
          extra_exams: profile?.extra_exams ?? [],
        }}
        email={user.email ?? ""}
        labels={dict.profileForm}
        grades={[
          { value: 9, label: dict.onboarding.gradeLabels.g9 },
          { value: 10, label: dict.onboarding.gradeLabels.g10 },
          { value: 11, label: dict.onboarding.gradeLabels.g11 },
          { value: 12, label: dict.onboarding.gradeLabels.g12 },
          { value: 13, label: dict.onboarding.gradeLabels.g13 },
        ]}
        tracks={[
          { value: "MF", label: dict.onboarding.tracks.MF.label },
          { value: "TM", label: dict.onboarding.tracks.TM.label },
          { value: "Sozel", label: dict.onboarding.tracks.Sozel.label },
          { value: "Dil", label: dict.onboarding.tracks.Dil.label },
        ]}
      />

      <PasswordForm labels={dict.passwordForm} />

      <NotificationSettings labels={dict.notifications} />

      <OfflineSettings labels={dict.offlineSettings} />

      <DeleteAccountForm
        email={user.email ?? ""}
        initialError={danger_error}
        labels={dict.deleteForm}
      />
    </div>
  );
}
