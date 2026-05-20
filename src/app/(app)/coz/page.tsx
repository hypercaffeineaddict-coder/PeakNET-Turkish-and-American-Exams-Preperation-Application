import { redirect } from "next/navigation";
import { Camera, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth } from "@/lib/ai";
import { SolveClient } from "./client";

export default async function CozPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subjects }, health] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, name, topics(id, name, display_order)")
      .eq("exam_type", "AYT")
      .order("display_order"),
    aiHealth(),
  ]);

  const supportsImages = health.ok && health.supportsAttachments;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Camera className="text-primary" size={26} />
          Soru çözücü
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bir soruyu fotoğraflayıp yükle. AI soruyu okur, adım adım çözer, doğru
          cevabı verir. Beğenirsen tek tıkla yanlış defterine ekleyebilirsin.
        </p>
      </header>

      {!supportsImages && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">
              Görsel desteği yok
            </div>
            <p className="mt-1 text-muted-foreground">
              Bu özellik Gemini gibi multimodal bir AI gerektiriyor.{" "}
              <code className="rounded bg-muted px-1">GEMINI_API_KEY</code>{" "}
              ekle.
            </p>
          </div>
        </div>
      )}

      <SolveClient
        subjects={(subjects ?? []) as never}
        aiReady={supportsImages}
      />
    </div>
  );
}
