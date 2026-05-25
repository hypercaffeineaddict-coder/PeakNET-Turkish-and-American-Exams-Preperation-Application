import { redirect } from "next/navigation";
import { PencilRuler, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth } from "@/lib/ai";
import { TahtaClient } from "./client";

export const metadata = { title: "Çizim Tahtası · PeakNET" };

export default async function TahtaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const health = await aiHealth();
  const aiReady = health.ok && health.hasChatModel;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <PencilRuler className="text-primary" size={26} />
          Çizim Tahtası
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fonksiyon grafiği, geometri şekli veya koordinat düzlemi iste; AI senin
          için çizsin.
        </p>
      </header>

      {!aiReady && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">AI bağlantısı yok</div>
            <p className="mt-1 text-muted-foreground">
              {health.error ?? "AI yapılandırması eksik. GEMINI_API_KEY'i kontrol et."}
            </p>
          </div>
        </div>
      )}

      <TahtaClient aiReady={aiReady} />
    </div>
  );
}
