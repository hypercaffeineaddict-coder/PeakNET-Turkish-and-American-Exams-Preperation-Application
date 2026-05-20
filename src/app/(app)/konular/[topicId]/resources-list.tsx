import Link from "next/link";
import Image from "next/image";
import { Star, ExternalLink, Trash2, Play, FileText } from "lucide-react";
import { deleteResource, toggleFavoriteResource } from "./actions";
import {
  kindMeta,
  type ResourceKind,
  extractYouTubeId,
  youtubeThumb,
  faviconFor,
  getDomain,
  formatBytes,
} from "@/lib/resources";

export type Resource = {
  id: string;
  topic_id: string;
  kind: ResourceKind;
  title: string;
  url: string | null;
  description: string | null;
  content: string | null;
  storage_path: string | null;
  mime_type: string | null;
  file_size: number | null;
  is_favorite: boolean;
  created_at: string;
};

export function ResourcesList({
  resources,
  topicId,
  activeKind,
}: {
  resources: Resource[];
  topicId: string;
  activeKind: ResourceKind | "all" | "favorites";
}) {
  let filtered = resources;
  if (activeKind === "favorites") {
    filtered = filtered.filter((r) => r.is_favorite);
  } else if (activeKind !== "all") {
    filtered = filtered.filter((r) => r.kind === activeKind);
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
        {activeKind === "favorites"
          ? "Favori kaynağın yok. ★ ikonuna tıklayarak ekleyebilirsin."
          : "Henüz kaynak yok. 'Kaynak ekle' ile başla."}
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {filtered.map((r) => (
        <ResourceCard key={r.id} resource={r} topicId={topicId} />
      ))}
    </ul>
  );
}

function ResourceCard({
  resource: r,
  topicId,
}: {
  resource: Resource;
  topicId: string;
}) {
  const meta = kindMeta[r.kind];
  const youtubeId = r.kind === "video" ? extractYouTubeId(r.url) : null;
  const domain = getDomain(r.url);
  const favicon = faviconFor(r.url);
  const viewerHref = `/konular/${topicId}/kaynak/${r.id}`;

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40">
      {youtubeId && (
        <Link
          href={viewerHref}
          className="relative block aspect-video w-full overflow-hidden bg-muted"
        >
          <Image
            src={youtubeThumb(youtubeId)}
            alt={r.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
            <div className="rounded-full bg-red-600 p-3">
              <Play size={20} className="fill-white text-white" />
            </div>
          </div>
        </Link>
      )}

      {r.kind === "file" && (
        <Link
          href={viewerHref}
          className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-500/10 to-slate-500/5"
        >
          <FileText size={48} className="text-slate-400" />
        </Link>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${meta.bg} ${meta.color}`}
          >
            <span>{meta.emoji}</span>
            {meta.label}
          </span>
          <div className="flex items-center gap-1">
            <form action={toggleFavoriteResource}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="topic_id" value={topicId} />
              <input type="hidden" name="current" value={String(r.is_favorite)} />
              <button
                type="submit"
                className="rounded-md p-1 text-muted-foreground transition hover:text-amber-500"
                aria-label="Favori"
              >
                <Star
                  size={14}
                  className={
                    r.is_favorite ? "fill-amber-500 text-amber-500" : ""
                  }
                />
              </button>
            </form>
            <form action={deleteResource}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="topic_id" value={topicId} />
              <button
                type="submit"
                className="rounded-md p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
                aria-label="Sil"
              >
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        </div>

        <h4 className="text-sm font-semibold leading-snug">
          <Link href={viewerHref} className="hover:underline">
            {r.title}
          </Link>
        </h4>

        {r.description && (
          <p className="text-xs text-muted-foreground">{r.description}</p>
        )}

        {r.content && (
          <p className="line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">
            {r.content}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
          {r.kind === "file" && r.file_size != null ? (
            <span>{formatBytes(r.file_size)}</span>
          ) : r.url && !youtubeId ? (
            <span className="flex items-center gap-1.5">
              {favicon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={favicon} alt="" className="h-3.5 w-3.5 rounded-sm" />
              )}
              {domain}
            </span>
          ) : (
            <span />
          )}
          <Link
            href={viewerHref}
            className="inline-flex items-center gap-1 text-primary transition hover:gap-1.5"
          >
            Aç
            <ExternalLink size={10} />
          </Link>
        </div>
      </div>
    </li>
  );
}
