import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import { redirect } from "next/navigation";
import { ScanLine, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { subjectForTrack } from "@/data/exam-subjects";
import { aiHealth } from "@/lib/ai";
import { TaramaClient } from "./client";

export default async function TaramaPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subjectsRaw }, { data: profile }, health] = await Promise.all([
    supabase
      .from("subjects")
      .select("*")
      .in("exam_type", ["TYT", "AYT", "YDT"]) // çekirdek YKS; ekstra (AP) tarama dışı
      .order("exam_type")
      .order("display_order"),
    supabase
      .from("profiles")
      .select("high_school_track")
      .eq("id", user.id)
      .single(),
    aiHealth(),
  ]);

  // TYT herkese; AYT derslerini lise bölümüne (track) göre filtrele
  const track = profile?.high_school_track ?? null;
  const subjects = ((subjectsRaw ?? []) as Array<{
    exam_type: string;
    tracks: string[] | null;
  }>).filter(
    (s) => subjectForTrack(s.tracks, track),
  );

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
