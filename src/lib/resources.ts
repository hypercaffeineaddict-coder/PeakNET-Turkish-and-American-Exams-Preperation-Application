export type ResourceKind = "video" | "link" | "note" | "test" | "book" | "file";

export const kindMeta: Record<
  ResourceKind,
  { label: string; emoji: string; color: string; bg: string }
> = {
  video: { label: "Video", emoji: "🎬", color: "text-red-500", bg: "bg-red-500/10" },
  link: { label: "Link", emoji: "🔗", color: "text-blue-500", bg: "bg-blue-500/10" },
  note: { label: "Not", emoji: "📝", color: "text-amber-500", bg: "bg-amber-500/10" },
  test: { label: "Test", emoji: "🎯", color: "text-violet-500", bg: "bg-violet-500/10" },
  book: { label: "Kitap", emoji: "📚", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  file: { label: "Dosya", emoji: "📎", color: "text-slate-300", bg: "bg-slate-500/10" },
};

export function extractYouTubeId(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
    }
  } catch {
    // ignore
  }
  return null;
}

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeEmbed(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

export function getDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function faviconFor(url: string | null): string | null {
  const domain = getDomain(url);
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

export function isPdfUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
