import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Link2,
  Mic,
  MessageSquare,
  Play,
  Clock,
  FolderOpen,
  Star,
  Plus,
  Search,
  ExternalLink,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateProgress, importRecommendation } from "./actions";
import { ResourceForm } from "./resource-form";
import { ResourcesList, type Resource } from "./resources-list";
import { kindMeta, type ResourceKind } from "@/lib/resources";
import { recommendationsFor, youtubeSearchUrl } from "@/data/recommendations";
import { aiHealth as ollamaHealth } from "@/lib/ai";

const statuses = [
  { value: "not_started", label: "Başlamadım" },
  { value: "in_progress", label: "Devam ediyorum" },
  { value: "done", label: "Bitirdim" },
];

const resourceTabs: { id: ResourceKind | "all" | "favorites"; label: string; emoji?: string }[] = [
  { id: "all", label: "Hepsi" },
  { id: "favorites", label: "★ Favoriler" },
  { id: "video", label: "Video", emoji: "🎬" },
  { id: "link", label: "Link", emoji: "🔗" },
  { id: "note", label: "Not", emoji: "📝" },
  { id: "test", label: "Test", emoji: "🎯" },
  { id: "book", label: "Kitap", emoji: "📚" },
  { id: "file", label: "Dosya", emoji: "📎" },
];

export default async function TopicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ kaynak?: string }>;
}) {
  const { topicId } = await params;
  const { kaynak } = await searchParams;
  const activeKind = (
    resourceTabs.find((t) => t.id === kaynak) ?? resourceTabs[0]
  ).id;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: topic } = await supabase
    .from("topics")
    .select("*, subjects(*)")
    .eq("id", topicId)
    .single();
  if (!topic) notFound();

  const [{ data: progress }, { data: resources }, health] = await Promise.all([
    supabase
      .from("topic_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("topic_id", topicId)
      .maybeSingle(),
    supabase
      .from("topic_resources")
      .select("*")
      .eq("user_id", user.id)
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false }),
    ollamaHealth(),
  ]);

  const currentStatus = progress?.status ?? "not_started";
  const currentConfidence = progress?.confidence ?? 0;

  const allResources: Resource[] = (resources ?? []) as Resource[];
  const counts: Record<string, number> = {
    all: allResources.length,
    favorites: allResources.filter((r) => r.is_favorite).length,
    video: allResources.filter((r) => r.kind === "video").length,
    link: allResources.filter((r) => r.kind === "link").length,
    note: allResources.filter((r) => r.kind === "note").length,
    test: allResources.filter((r) => r.kind === "test").length,
    book: allResources.filter((r) => r.kind === "book").length,
    file: allResources.filter((r) => r.kind === "file").length,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link
          href={`/konular?tab=${topic.exam_type ?? "AYT"}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Konular
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{topic.name}</h1>
          <span
            className="rounded-md px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${topic.subjects?.color}20`,
              color: topic.subjects?.color,
            }}
          >
            {topic.subjects?.name}
          </span>
          {topic.grade && (
            <span className="text-xs text-muted-foreground">
              {topic.grade}. sınıf
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* İlerleme */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">İlerleme</h2>

            <form action={updateProgress} className="mt-4 space-y-4">
              <input type="hidden" name="topic_id" value={topicId} />
              <input type="hidden" name="confidence" value={currentConfidence} />
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <label
                    key={s.value}
                    className="cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s.value}
                      defaultChecked={currentStatus === s.value}
                      className="hidden"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Durumu kaydet
              </button>
            </form>

            <div className="mt-6">
              <div className="mb-2 text-xs text-muted-foreground">
                Kendine güven: {currentConfidence}/5 (yıldıza tıkla, anında kaydedilir)
              </div>
              <ConfidencePicker
                topicId={topicId}
                status={currentStatus}
                initial={currentConfidence}
              />
            </div>
          </section>

          {/* Pomodoro hızlı başlat */}
          <Link
            href={`/pomodoro?topic=${topicId}`}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-primary" />
              <div>
                <div className="text-sm font-semibold">
                  Bu konuda Pomodoro başlat
                </div>
                <div className="text-xs text-muted-foreground">
                  25 dakikalık seans → streak'ine eklenir
                </div>
              </div>
            </div>
            <span className="text-sm text-primary">→</span>
          </Link>

          {/* AI ders */}
          <section className="rounded-2xl border border-border bg-gradient-to-br from-violet-500/5 via-card to-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles size={16} className="text-violet-500" />
              AI ile bu konuyu öğren
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Yerel Ollama modelin {topic.name.toLowerCase()} konusunu sana
              baştan anlatır, sen takıldıkça soru sorarsın.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link
                href={`/konular/${topicId}/ders`}
                className="flex items-center justify-center gap-2 rounded-md border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-500 transition hover:bg-violet-500/15"
              >
                <Play size={14} /> Dersi başlat
              </Link>
              <Link
                href={`/konular/${topicId}/ders?mode=free`}
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm transition hover:bg-muted"
              >
                <MessageSquare size={14} /> Sohbet et
              </Link>
              <Link
                href={`/konular/${topicId}/ders?mode=free&voice=1`}
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm transition hover:bg-muted"
              >
                <Mic size={14} /> Sesli konuş
              </Link>
            </div>

          </section>

          {/* Kaynaklarım */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <header className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <FolderOpen size={16} className="text-primary" />
                Kaynaklarım
              </h2>
              <ResourceForm topicId={topicId} />
            </header>

            <nav className="mb-4 flex flex-wrap gap-1.5 border-b border-border pb-3">
              {resourceTabs.map((t) => {
                const isActive = t.id === activeKind;
                const count = counts[t.id] ?? 0;
                return (
                  <Link
                    key={t.id}
                    href={`/konular/${topicId}?kaynak=${t.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.id === "favorites" ? (
                      <Star size={12} />
                    ) : t.emoji ? (
                      <span>{t.emoji}</span>
                    ) : null}
                    {t.label}
                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 text-[10px] ${
                          isActive
                            ? "bg-primary/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <ResourcesList
              resources={allResources}
              topicId={topicId}
              activeKind={activeKind}
            />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Önerilen kaynaklar - dinamik */}
          <RecommendationsCard
            topicId={topicId}
            subjectId={topic.subjects?.id ?? ""}
            topicName={topic.name}
            existingUrls={new Set(allResources.map((r) => r.url).filter(Boolean) as string[])}
          />

          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Öncelik</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Bu konu{" "}
              {topic.priority === "high"
                ? "yüksek öncelikli — sınavda yoğun çıkar."
                : topic.priority === "medium"
                  ? "orta öncelikli — temeli sağlam tutulmalı."
                  : "düşük öncelikli — ana konuların ardından bak."}
            </p>
          </section>

          {kindMeta && allResources.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Kaynak özeti</h3>
              <ul className="mt-3 space-y-1.5 text-xs">
                {(["video", "link", "note", "test", "book", "file"] as ResourceKind[]).map((k) =>
                  counts[k] > 0 ? (
                    <li key={k} className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {kindMeta[k].emoji} {kindMeta[k].label}
                      </span>
                      <span className="font-medium">{counts[k]}</span>
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function RecommendationsCard({
  topicId,
  subjectId,
  topicName,
  existingUrls,
}: {
  topicId: string;
  subjectId: string;
  topicName: string;
  existingUrls: Set<string>;
}) {
  const recs = recommendationsFor(topicId, subjectId);
  const ytSearch = youtubeSearchUrl(`${topicName} AYT konu anlatımı`);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Link2 size={14} className="text-primary" />
        Önerilen kaynaklar
      </h3>

      {/* YouTube'da konuyu ara - her zaman aktif */}
      <a
        href={ytSearch}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-500 transition hover:bg-red-500/10"
      >
        <Search size={14} />
        <span className="flex-1">YouTube'da bu konuyu ara</span>
        <ExternalLink size={11} />
      </a>

      {recs.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {recs.map((rec) => {
            const already = existingUrls.has(rec.url);
            return (
              <li
                key={rec.url}
                className="rounded-md border border-border bg-background p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs font-medium hover:underline"
                  >
                    {rec.title}
                  </a>
                  <form action={importRecommendation} className="shrink-0">
                    <input type="hidden" name="topic_id" value={topicId} />
                    <input type="hidden" name="kind" value={rec.kind} />
                    <input type="hidden" name="title" value={rec.title} />
                    <input type="hidden" name="url" value={rec.url} />
                    <input
                      type="hidden"
                      name="description"
                      value={rec.description ?? ""}
                    />
                    <button
                      type="submit"
                      disabled={already}
                      title={already ? "Zaten listende" : "Listeme ekle"}
                      className={`rounded-md p-1 transition ${
                        already
                          ? "text-emerald-500"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {already ? <Check size={13} /> : <Plus size={13} />}
                    </button>
                  </form>
                </div>
                {rec.description && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {rec.description}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Bu konu için kürate kaynak henüz eklenmedi. YouTube arama linkini
          kullanabilirsin.
        </p>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        + ikonuna tıkla, kaynak doğrudan listenle eşlensin.
      </p>
    </section>
  );
}

function ConfidencePicker({
  topicId,
  status,
  initial,
}: {
  topicId: string;
  status: string;
  initial: number;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <form key={n} action={updateProgress}>
          <input type="hidden" name="topic_id" value={topicId} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="confidence" value={n} />
          <button
            type="submit"
            aria-label={`Güven seviyesi ${n}`}
            className={`h-8 w-8 rounded-md border text-sm transition ${
              n <= initial
                ? "border-amber-500 bg-amber-500/10 text-amber-500"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            ★
          </button>
        </form>
      ))}
    </div>
  );
}
