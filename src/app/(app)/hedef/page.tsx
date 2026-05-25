import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HedefClient, type Point } from "./client";

export const metadata = { title: "Hedef · PeakNET" };

type Totals = Record<string, { net?: number }>;
const sumNet = (t: Totals | null) =>
  Object.values(t ?? {}).reduce((a, s) => a + (s?.net ?? 0), 0);

export default async function HedefPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: exams }] = await Promise.all([
    supabase
      .from("profiles")
      .select("target_department, target_university")
      .eq("id", user.id)
      .single(),
    supabase
      .from("exams")
      .select("name, exam_date, exam_type, totals")
      .eq("user_id", user.id)
      .order("exam_date", { ascending: true }),
  ]);

  // Tür bazlı net serisi
  const byType: Record<string, Point[]> = { TYT: [], AYT: [], YDT: [] };
  for (const e of exams ?? []) {
    const t = (e.exam_type as string) ?? "AYT";
    if (!byType[t]) byType[t] = [];
    byType[t].push({
      name: e.name as string,
      date: e.exam_date as string,
      net: Math.round(sumNet(e.totals as Totals | null) * 100) / 100,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Target className="text-primary" size={26} />
          Hedef & İlerleme
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bir net hedefi koy; denemelerinle hedefe ne kadar yaklaştığını gör.
        </p>
      </header>

      <HedefClient
        byType={byType}
        targetDepartment={profile?.target_department ?? null}
        targetUniversity={profile?.target_university ?? null}
      />
    </div>
  );
}
