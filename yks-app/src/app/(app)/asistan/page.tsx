import { redirect } from "next/navigation";
import { Sparkles, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth as ollamaHealth } from "@/lib/ai";
import { AsistanChat } from "./chat";
import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";

export default async function AsistanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const t = dict.assistant;
  const banner = dict.aiBanner;

  const [{ data: profile }, health] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, grade, target_university, target_department, is_exam_student, strong_subjects, weak_subjects, high_school_track",
      )
      .eq("id", user.id)
      .single(),
    ollamaHealth(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Sparkles className="text-primary" size={26} />
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </header>

      {!health.ok && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">{banner.notConnected}</div>
            <p className="mt-1 text-muted-foreground">
              {health.error ?? banner.notConnectedDesc}
            </p>
          </div>
        </div>
      )}

      <AsistanChat
        student={{
          name: profile?.display_name ?? null,
          grade: profile?.grade ?? null,
          track: profile?.high_school_track ?? null,
          targetUni: profile?.target_university ?? null,
          targetDept: profile?.target_department ?? null,
          strongSubjects: profile?.strong_subjects ?? [],
          weakSubjects: profile?.weak_subjects ?? [],
          isExamStudent: profile?.is_exam_student ?? false,
        }}
        aiReady={health.ok && health.hasChatModel}
        labels={t}
      />
    </div>
  );
}
