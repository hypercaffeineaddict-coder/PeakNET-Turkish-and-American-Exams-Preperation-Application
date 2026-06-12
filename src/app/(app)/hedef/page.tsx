import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { PuanTuru } from "@/data/yks-scoring";
import { HedefClient, type ExamLite } from "./client";

export const metadata = { title: "Hedef · PeakNET" };

type Totals = Record<string, { net?: number }>;
const sumNet = (t: Totals | null) =>
  Object.values(t ?? {}).reduce((a, s) => a + (s?.net ?? 0), 0);

const defaultType = (track: string | null | undefined): PuanTuru => {
  if (track === "MF") return "SAY";
  if (track === "TM") return "EA";
  if (track === "Sozel") return "SOZ";
  return "TYT";
};

export default async function HedefPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: exams }] = await Promise.all([
    supabase
      .from("profiles")
      .select("high_school_track, target_department, target_university")
      .eq("id", user.id)
      .single(),
    supabase
      .from("exams")
      .select("name, exam_date, exam_type, totals")
      .eq("user_id", user.id)
      .order("exam_date", { ascending: true }),
  ]);

  const items: ExamLite[] = (exams ?? []).map((e) => ({
    name: e.name as string,
    date: e.exam_date as string,
    type: (e.exam_type as "TYT" | "AYT" | "YDT") ?? "AYT",
    net: Math.round(sumNet(e.totals as Totals | null) * 100) / 100,
  }));

  const track =
    (profile as { high_school_track?: string | null } | null)?.high_school_track ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Target className="text-primary" size={26} />
          Hedef & İlerleme
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hedef sıralamanı koy; denemelerinden gelen tahmini sıralamayla hedefe ne
          kadar yaklaştığını gör.
        </p>
      </header>

      <HedefClient
        exams={items}
        defaultType={defaultType(track)}
        targetDepartment={
          (profile as { target_department?: string | null } | null)?.target_department ?? null
        }
        targetUniversity={
          (profile as { target_university?: string | null } | null)?.target_university ?? null
        }
      
        dict={dict.hedef}
      />
    </div>
  );
}
