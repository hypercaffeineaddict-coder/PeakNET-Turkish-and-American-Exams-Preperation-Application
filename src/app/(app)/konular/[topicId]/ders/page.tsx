import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth as ollamaHealth } from "@/lib/ai";
import { DersChat } from "./chat";

export default async function DersPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ mode?: string; voice?: string }>;
}) {
  const { topicId } = await params;
  const { mode, voice } = await searchParams;
  const lessonMode = mode === "source" ? "source" : mode === "free" ? "free" : null;
  const voiceMode = voice === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: topic }, { data: profile }, { data: pdfResources }, health] =
    await Promise.all([
      supabase
        .from("topics")
        .select("*, subjects(*)")
        .eq("id", topicId)
        .single(),
      supabase
        .from("profiles")
        .select("display_name, grade, is_exam_student")
        .eq("id", user.id)
        .single(),
      supabase
        .from("topic_resources")
        .select("id, title, mime_type, file_size, kind")
        .eq("user_id", user.id)
        .eq("topic_id", topicId)
        .in("kind", ["file"])
        .order("created_at", { ascending: false }),
      ollamaHealth(),
    ]);

  if (!topic) notFound();

  // PDF olanları filtrele
  const pdfs = (pdfResources ?? []).filter(
    (r) =>
      (r.mime_type ?? "").includes("pdf") ||
      r.title?.toLowerCase().endsWith(".pdf"),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href={`/konular/${topicId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> {topic.name}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          AI ile {topic.name} dersi
        </h1>
      </div>

      {!health.ok && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">Ollama bağlantısı yok</div>
            <p className="mt-1 text-muted-foreground">
              Yerel modeli kullanmak için terminalde{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">ollama serve</code>{" "}
              komutunu çalıştır ve model pull et:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                ollama pull qwen2.5:7b
              </code>
              . Sonra sayfayı yenile.
            </p>
            {health.error && (
              <p className="mt-1 text-xs text-muted-foreground/70">{health.error}</p>
            )}
          </div>
        </div>
      )}

      {health.ok && !health.hasChatModel && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">Model bulunamadı</div>
            <p className="mt-1 text-muted-foreground">
              Ollama çalışıyor ama beklenen chat modeli yüklü değil. Şunu çalıştır:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                ollama pull qwen2.5:7b
              </code>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Yüklü modeller: {health.models.join(", ") || "—"}
            </p>
          </div>
        </div>
      )}

      {!lessonMode ? (
        <ModePicker
          topicId={topicId}
          topicName={topic.name}
          hasPdfs={pdfs.length > 0}
        />
      ) : (
        <DersChat
          mode={lessonMode}
          topic={{
            id: topic.id,
            name: topic.name,
            subjectName: topic.subjects?.name ?? "",
            grade: topic.grade,
            examType: topic.exam_type ?? "AYT",
          }}
          student={{
            name: profile?.display_name ?? undefined,
            grade: profile?.grade ?? null,
            isExamStudent: profile?.is_exam_student ?? false,
          }}
          aiReady={health.ok && health.hasChatModel}
          supportsAttachments={
            health.ok && (health as { supportsAttachments?: boolean }).supportsAttachments === true
          }
          pdfs={pdfs.map((p) => ({
            id: p.id,
            title: p.title,
            fileSize: p.file_size ?? 0,
          }))}
          autoTts={voiceMode}
        />
      )}
    </div>
  );
}

function ModePicker({
  topicId,
  topicName,
  hasPdfs,
}: {
  topicId: string;
  topicName: string;
  hasPdfs: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Link
        href={`/konular/${topicId}/ders?mode=source`}
        className="group rounded-2xl border border-border bg-card p-6 transition hover:border-violet-500/40"
      >
        <div className="text-xs font-medium uppercase tracking-wider text-violet-500">
          Kaynak destekli
        </div>
        <h3 className="mt-2 text-lg font-semibold">
          Ders notları üzerinden öğret
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Yüklediğin (veya yüklenecek olan) ders notu/kitap üzerinden{" "}
          {topicName.toLowerCase()} anlatır. Sonra test çözdürür.
        </p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-500 transition group-hover:gap-2">
          Bu modu seç →
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          {hasPdfs
            ? "Bu konuya yüklediğin PDF'leri seçip AI'ya gönderebilirsin."
            : "Önce konuya bir PDF yükle (Kaynaklarım → Dosya), sonra bu modda yüklediğin PDF'i seçip ders alabilirsin."}
        </div>
      </Link>

      <Link
        href={`/konular/${topicId}/ders?mode=free`}
        className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40"
      >
        <div className="text-xs font-medium uppercase tracking-wider text-primary">
          Serbest
        </div>
        <h3 className="mt-2 text-lg font-semibold">
          Beyaz ekrandan, AI kendi bildiklerinden
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          AI {topicName.toLowerCase()} konusunu sıfırdan anlatır, sen takıldıkça
          soru sorarsın. Konuyu bitirince test çözdürür.
        </p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition group-hover:gap-2">
          Bu modu seç →
        </div>
      </Link>
    </div>
  );
}
