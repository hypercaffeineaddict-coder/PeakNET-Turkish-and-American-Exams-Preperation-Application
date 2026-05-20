import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  HardDrive,
  Star,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  kindMeta,
  type ResourceKind,
  extractYouTubeId,
  youtubeEmbed,
  isPdfUrl,
  getDomain,
  faviconFor,
  formatBytes,
} from "@/lib/resources";
import { toggleFavoriteResource, deleteResource } from "../../actions";
import { TestRunner } from "./test-runner";
import { AIHelperDrawer } from "./ai-helper";
import { aiHealth } from "@/lib/ai";

export default async function ResourceViewerPage({
  params,
}: {
  params: Promise<{ topicId: string; resourceId: string }>;
}) {
  const { topicId, resourceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: resource }, health] = await Promise.all([
    supabase
      .from("topic_resources")
      .select("*, topics(name, subjects(name, color))")
      .eq("id", resourceId)
      .eq("user_id", user.id)
      .single(),
    aiHealth(),
  ]);

  if (!resource) notFound();

  const meta = kindMeta[resource.kind as ResourceKind];

  // PDF, dosyalar için signed URL üret
  let signedUrl: string | null = null;
  let signedUrlError: string | null = null;
  if (resource.storage_path) {
    const { data, error } = await supabase.storage
      .from("resources")
      .createSignedUrl(resource.storage_path, 60 * 60); // 1 saat
    if (error) signedUrlError = error.message;
    else signedUrl = data?.signedUrl ?? null;
  }

  const youtubeId = resource.kind === "video" ? extractYouTubeId(resource.url) : null;
  const isPdf =
    (resource.mime_type ?? "").includes("pdf") ||
    (resource.kind === "file" &&
      resource.storage_path?.toLowerCase().endsWith(".pdf")) ||
    (resource.url ? isPdfUrl(resource.url) : false);
  const isImage =
    (resource.mime_type ?? "").startsWith("image/") ||
    /\.(png|jpe?g|webp|gif)$/i.test(resource.storage_path ?? "");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/konular/${topicId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={14} /> {resource.topics?.name}
          </Link>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {resource.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${meta.bg} ${meta.color}`}
            >
              {meta.emoji} {meta.label}
            </span>
          </div>
          {resource.description && (
            <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <form action={toggleFavoriteResource}>
            <input type="hidden" name="id" value={resource.id} />
            <input type="hidden" name="topic_id" value={topicId} />
            <input
              type="hidden"
              name="current"
              value={String(resource.is_favorite)}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm transition hover:bg-muted"
            >
              <Star
                size={14}
                className={
                  resource.is_favorite ? "fill-amber-500 text-amber-500" : ""
                }
              />
              {resource.is_favorite ? "Favoride" : "Favorile"}
            </button>
          </form>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Yeni sekmede aç"
            >
              <ExternalLink size={14} />
              Dış sitede aç
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {/* Viewer */}
          {youtubeId && (
            <div className="overflow-hidden rounded-2xl border border-border bg-black">
              <div className="relative aspect-video">
                <iframe
                  src={youtubeEmbed(youtubeId)}
                  title={resource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          )}

          {!youtubeId && isImage && signedUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signedUrl}
              alt={resource.title}
              className="w-full rounded-2xl border border-border"
            />
          )}

          {!youtubeId && isPdf && (signedUrl || resource.url) && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <iframe
                src={(signedUrl || resource.url) ?? "about:blank"}
                title={resource.title}
                className="h-[80vh] w-full"
              />
            </div>
          )}

          {!youtubeId &&
            !isPdf &&
            !isImage &&
            resource.kind === "link" &&
            resource.url && (
              <ExternalLinkEmbed url={resource.url} title={resource.title} />
            )}

          {resource.kind === "note" && resource.content && (
            <article className="rounded-2xl border border-border bg-card p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {resource.content}
              </pre>
            </article>
          )}

          {resource.kind === "test" &&
            (() => {
              const meta = resource.metadata as
                | { questions?: Array<{
                    stem: string;
                    options: Record<string, string>;
                    answer: string;
                    explanation: string;
                  }> }
                | null;
              const qs = meta?.questions ?? [];
              if (qs.length > 0) {
                return (
                  <TestRunner
                    resourceId={resource.id}
                    topicId={topicId}
                    questions={qs}
                  />
                );
              }
              return (
                <article className="rounded-2xl border border-border bg-card p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {resource.content ?? "İnteraktif soru bulunamadı."}
                  </pre>
                </article>
              );
            })()}

          {resource.kind === "book" && (
            <article className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              📚 Kitap kaydı. {resource.url ? "Aşağıdaki linkten kitabın sayfasına gidebilirsin." : "Bu kayıt için harici link verilmedi."}
            </article>
          )}

          {signedUrlError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
              <AlertTriangle size={16} className="mt-0.5 text-rose-500" />
              <div>
                <div className="font-medium text-rose-500">Dosya okunamadı</div>
                <p className="mt-1 text-muted-foreground">{signedUrlError}</p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl border border-border bg-card p-5 text-sm">
            <h3 className="text-sm font-semibold">Detaylar</h3>
            <dl className="mt-3 space-y-2 text-xs">
              <Row icon={<Calendar size={12} />} label="Eklendi">
                {new Date(resource.created_at).toLocaleString("tr-TR")}
              </Row>
              {resource.url && (
                <Row icon={null} label="Bağlantı">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                  >
                    {getDomain(resource.url) ?? resource.url}
                    <ExternalLink size={10} />
                  </a>
                </Row>
              )}
              {resource.file_size != null && (
                <Row icon={<HardDrive size={12} />} label="Boyut">
                  {formatBytes(resource.file_size)}
                </Row>
              )}
              {resource.mime_type && (
                <Row icon={null} label="Tür">
                  {resource.mime_type}
                </Row>
              )}
            </dl>
          </section>

          <form action={deleteResource}>
            <input type="hidden" name="id" value={resource.id} />
            <input type="hidden" name="topic_id" value={topicId} />
            <button
              type="submit"
              className="w-full rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-sm text-rose-500 transition hover:bg-rose-500/10"
            >
              Kaynağı sil
            </button>
          </form>
        </aside>
      </div>

      <AIHelperDrawer
        resourceTitle={resource.title}
        topicName={resource.topics?.name ?? ""}
        subjectName={resource.topics?.subjects?.name ?? ""}
        resourceKind={resource.kind}
        url={resource.url}
        aiReady={health.ok && health.hasChatModel}
      />
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="flex items-center gap-1 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-foreground">{children}</dd>
    </div>
  );
}

function ExternalLinkEmbed({ url, title }: { url: string; title: string }) {
  const domain = getDomain(url);
  const favicon = faviconFor(url);
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        {favicon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={favicon}
            alt=""
            className="h-12 w-12 shrink-0 rounded-md border border-border bg-background p-2"
          />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{title}</h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{domain}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Dış siteler güvenlik nedeniyle uygulama içinde gömülemeyebilir.
            Aşağıdaki butonla yeni sekmede aç.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <ExternalLink size={14} />
            Yeni sekmede aç
          </a>
        </div>
      </div>

      {/* Yine de iframe denemesi */}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          Yine de uygulama içinde göstermeyi dene
        </summary>
        <div className="mt-3 overflow-hidden rounded-md border border-border">
          <iframe
            src={url}
            title={title}
            className="h-[70vh] w-full bg-white"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Site X-Frame-Options kullanıyorsa iframe boş kalabilir.
        </p>
      </details>
    </div>
  );
}
