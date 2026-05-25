import { redirect } from "next/navigation";
import { Sparkles, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth } from "@/lib/ai";
import { Coach } from "./coach";

export const metadata = { title: "Haftalık Koç · PeakNET" };

export default async function RaporPage() {
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
          <Sparkles className="text-primary" size={26} />
          Haftalık Koç
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verilerine bakıp bu haftayı değerlendiren, önümüzdeki haftaya yön veren
          kişisel AI koçun.
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

      <Coach aiReady={aiReady} />
    </div>
  );
}
