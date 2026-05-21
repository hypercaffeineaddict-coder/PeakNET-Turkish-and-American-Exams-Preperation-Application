import { redirect } from "next/navigation";
import { ScanLine, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth } from "@/lib/ai";
import { TaramaClient } from "./client";

export default async function TaramaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subjects }, health] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, name, exam_type, color, question_count")
      .order("exam_type")
      .order("display_order"),
    aiHealth(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <ScanLine className="text-primary" size={26} />
          Tarama Testi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bir dersin tüm konularına yayılmış tanı testi. Hangi konularda zayıf
          olduğunu gör, yanlışların otomatik yanlış defterine düşsün.
        </p>
      </header>

      {!health.hasChatModel && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">AI bağlantısı yok</div>
            <p className="mt-1 text-muted-foreground">
              Tarama testi AI ile üretiliyor. {health.error ?? "Yapılandırma eksik."}
            </p>
          </div>
        </div>
      )}

      <TaramaClient
        subjects={(subjects ?? []) as never}
        aiReady={health.ok && health.hasChatModel}
      />
    </div>
  );
}
