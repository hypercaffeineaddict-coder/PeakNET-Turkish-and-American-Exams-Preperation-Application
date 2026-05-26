import { redirect } from "next/navigation";
import { NotebookPen, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth } from "@/lib/ai";
import { NotlarClient } from "./client";

export const metadata = { title: "Notlar · PeakNET" };

export default async function NotlarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const health = await aiHealth();
  const aiReady = health.ok && health.hasChatModel;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="no-print">
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <NotebookPen className="text-primary" size={26} />
          AI Notlar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Konuyu söyle; AI başlıklı, maddeli, sınav odaklı bir çalışma notu
          hazırlasın. PDF olarak indirip kaydet.
        </p>
      </header>

      {!aiReady && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm no-print">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">AI bağlantısı yok</div>
            <p className="mt-1 text-muted-foreground">
              {health.error ?? "AI yapılandırması eksik. GEMINI_API_KEY'i kontrol et."}
            </p>
          </div>
        </div>
      )}

      <NotlarClient aiReady={aiReady} />
    </div>
  );
}
