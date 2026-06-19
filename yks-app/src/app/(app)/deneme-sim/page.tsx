import { redirect } from "next/navigation";
import { Timer, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth } from "@/lib/ai";
import { DenemeSimClient } from "./client";

export const metadata = { title: "Deneme Simülasyonu · PeakNET" };

export default async function DenemeSimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const health = await aiHealth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Timer className="text-primary" size={26} />
          Deneme Simülasyonu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Süreli, çok dersli mini deneme. AI üretir, geri sayımla çözersin, net ve
          sonucun otomatik denemelerine kaydedilir.
        </p>
      </header>

      {!health.hasChatModel && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">AI bağlantısı yok</div>
            <p className="mt-1 text-muted-foreground">
              Deneme AI ile üretiliyor. {health.error ?? "Yapılandırma eksik."}
            </p>
          </div>
        </div>
      )}

      <DenemeSimClient aiReady={health.ok && health.hasChatModel} />
    </div>
  );
}
