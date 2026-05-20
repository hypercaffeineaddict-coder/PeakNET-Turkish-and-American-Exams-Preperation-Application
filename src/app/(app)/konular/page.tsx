import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ListChecks,
  Construction,
  Search,
  Circle,
  CircleDot,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const examTabs = [
  { id: "AYT", label: "AYT", desc: "Alan Yeterlilik" },
  { id: "TYT", label: "TYT", desc: "Temel Yeterlilik" },
  { id: "MSU", label: "MSÜ", desc: "Milli Savunma" },
  { id: "KPSS", label: "KPSS", desc: "Kamu Personel" },
] as const;
type ExamTab = (typeof examTabs)[number]["id"];

const filters = [
  { id: "all", label: "Tümü" },
  { id: "not_started", label: "Başlamadım" },
  { id: "in_progress", label: "Devam" },
  { id: "done", label: "Bitti" },
  { id: "high", label: "Öncelikli" },
] as const;
type FilterId = (typeof filters)[number]["id"];

const priorityDot: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};
const priorityLabel: Record<string, string> = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

type TopicRow = {
  id: string;
  name: string;
  grade: number | null;
  priority: string;
  display_order: number;
};
type SubjectRow = {
  id: string;
  name: string;
  color: string | null;
  question_count: number | null;
  display_order: number;
  topics: TopicRow[];
};

export default async function KonularPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; filter?: string }>;
}) {
  const { tab, q, filter } = await searchParams;
  const activeTab: ExamTab =
    (examTabs.find((t) => t.id === tab)?.id ?? "AYT") as ExamTab;
  const activeFilter: FilterId =
    (filters.find((f) => f.id === filter)?.id ?? "all") as FilterId;
  const query = (q ?? "").trim().toLocaleLowerCase("tr-TR");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subjectsRaw } = await supabase
    .from("subjects")
    .select("*, topics(*)")
    .eq("exam_type", activeTab)
    .order("display_order");

  const { data: progressRows } = await supabase
    .from("topic_progress")
    .select("topic_id, status, confidence")
    .eq("user_id", user.id);

  const progressMap = new Map(
    (progressRows ?? []).map((p) => [p.topic_id, p]),
  );

  const subjects: SubjectRow[] = (subjectsRaw ?? []) as SubjectRow[];

  // Filtre + arama uygula
  const filteredSubjects = subjects.map((s) => {
    const topics = (s.topics ?? [])
      .slice()
      .sort((a, b) => {
        const ga = a.grade ?? 0;
        const gb = b.grade ?? 0;
        if (ga !== gb) return ga - gb;
        return a.display_order - b.display_order;
      })
      .filter((t) => {
        const p = progressMap.get(t.id);
        const status = p?.status ?? "not_started";
        if (activeFilter === "high" && t.priority !== "high") return false;
        if (
          (activeFilter === "not_started" ||
            activeFilter === "in_progress" ||
            activeFilter === "done") &&
          status !== activeFilter
        )
          return false;
        if (query && !t.name.toLocaleLowerCase("tr-TR").includes(query))
          return false;
        return true;
      });
    return { ...s, topics };
  });

  // Toplam ilerleme
  const totalTopics = subjects.reduce(
    (acc, s) => acc + (s.topics?.length ?? 0),
    0,
  );
  const doneTopics = (progressRows ?? []).filter((p) => p.status === "done")
    .length;

  // URL helper
  const buildUrl = (overrides: Partial<{ tab: string; q: string; filter: string }>) => {
    const params = new URLSearchParams();
    const next = { tab: activeTab, q: query, filter: activeFilter, ...overrides };
    if (next.tab) params.set("tab", next.tab);
    if (next.q) params.set("q", String(next.q));
    if (next.filter && next.filter !== "all") params.set("filter", String(next.filter));
    const qs = params.toString();
    return qs ? `/konular?${qs}` : "/konular";
  };

  const otherSekmePlaceholder =
    activeTab !== "AYT" && filteredSubjects.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <ListChecks className="text-primary" size={26} />
            Konular
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sınav türünü seç, konuyu işaretle, çalışmaya başla.
          </p>
        </div>
        {totalTopics > 0 && (
          <div className="text-right">
            <div className="text-2xl font-semibold leading-none">
              {doneTopics}
              <span className="text-lg text-muted-foreground">
                /{totalTopics}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">tamamlanan konu</div>
          </div>
        )}
      </header>

      {/* Sekmeler */}
      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        {examTabs.map((t) => {
          const isActive = t.id === activeTab;
          return (
            <Link
              key={t.id}
              href={buildUrl({ tab: t.id, filter: "all", q: "" })}
              className={`relative -mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {t.desc}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Arama + Filtre */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          action="/konular"
          method="get"
          className="relative flex-1 min-w-[200px]"
        >
          <input type="hidden" name="tab" value={activeTab} />
          {activeFilter !== "all" && (
            <input type="hidden" name="filter" value={activeFilter} />
          )}
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Konu ara (örn. türev, polinom, hareket...)"
            className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
          />
        </form>

        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => {
            const isActive = f.id === activeFilter;
            return (
              <Link
                key={f.id}
                href={buildUrl({ filter: f.id })}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {otherSekmePlaceholder ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Construction
            size={36}
            className="mx-auto text-muted-foreground"
          />
          <h2 className="mt-4 text-lg font-semibold">
            {activeTab} müfredatı yakında
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            İlk sürümde MF AYT odaklıyız. {activeTab} müfredatını ekleyene kadar
            AYT sekmesinden devam edebilirsin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubjects.map((subject, idx) => {
            const allTopics = subject.topics;
            const subjectDone = allTopics.filter(
              (t) => progressMap.get(t.id)?.status === "done",
            ).length;
            const subjectInProgress = allTopics.filter(
              (t) => progressMap.get(t.id)?.status === "in_progress",
            ).length;
            const progressPct =
              allTopics.length === 0
                ? 0
                : Math.round((subjectDone / allTopics.length) * 100);

            // Sınıfa göre grupla
            const byGrade = new Map<number, TopicRow[]>();
            for (const t of allTopics) {
              const g = t.grade ?? 0;
              if (!byGrade.has(g)) byGrade.set(g, []);
              byGrade.get(g)!.push(t);
            }
            const gradeKeys = Array.from(byGrade.keys()).sort((a, b) => a - b);

            // İlk ders varsayılan açık, diğerleri kapalı
            const defaultOpen = idx === 0 || query.length > 0 || activeFilter !== "all";

            return (
              <details
                key={subject.id}
                open={defaultOpen}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition"
              >
                <summary
                  className="flex cursor-pointer items-center gap-4 px-5 py-4 marker:hidden hover:bg-muted/30 [&::-webkit-details-marker]:hidden"
                >
                  <ChevronRight
                    size={18}
                    className="text-muted-foreground transition group-open:rotate-90"
                  />
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color ?? "#888" }}
                  />
                  <div className="flex min-w-0 flex-1 items-baseline gap-3">
                    <h2 className="text-base font-semibold">{subject.name}</h2>
                    <span className="text-xs text-muted-foreground">
                      {subject.question_count} soru · {allTopics.length} konu
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progressPct}%`,
                            backgroundColor: subject.color ?? undefined,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                        {progressPct}%
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {subjectDone}/{allTopics.length}
                      {subjectInProgress > 0 && (
                        <span className="ml-1 text-primary">
                          (+{subjectInProgress})
                        </span>
                      )}
                    </span>
                  </div>
                </summary>

                {allTopics.length === 0 ? (
                  <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
                    Bu filtreye uyan konu yok.
                  </div>
                ) : (
                  <div className="border-t border-border">
                    {gradeKeys.map((grade, gi) => {
                      const topicsInGrade = byGrade.get(grade)!;
                      return (
                        <div
                          key={grade}
                          className={gi > 0 ? "border-t border-border/60" : ""}
                        >
                          <div className="bg-muted/20 px-5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            {grade > 0 ? `${grade}. sınıf` : "Genel"}
                          </div>
                          <ul>
                            {topicsInGrade.map((topic) => (
                              <TopicListItem
                                key={topic.id}
                                topic={topic}
                                progress={progressMap.get(topic.id)}
                              />
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TopicListItem({
  topic,
  progress,
}: {
  topic: TopicRow;
  progress?: { status?: string; confidence?: number };
}) {
  const status = progress?.status ?? "not_started";
  const confidence = progress?.confidence ?? 0;

  const StatusIcon =
    status === "done"
      ? CheckCircle2
      : status === "in_progress"
        ? CircleDot
        : Circle;
  const statusColor =
    status === "done"
      ? "text-emerald-500"
      : status === "in_progress"
        ? "text-primary"
        : "text-muted-foreground/50";

  return (
    <li>
      <Link
        href={`/konular/${topic.id}`}
        className="group flex items-center gap-3 px-5 py-2.5 transition hover:bg-muted/40"
      >
        <StatusIcon size={16} className={`shrink-0 ${statusColor}`} />
        <span
          className={`flex-1 truncate text-sm ${
            status === "done" ? "text-muted-foreground line-through" : ""
          }`}
        >
          {topic.name}
        </span>

        {confidence > 0 && (
          <span className="hidden sm:inline text-xs text-amber-500">
            {"★".repeat(confidence)}
            <span className="text-muted-foreground/40">
              {"★".repeat(5 - confidence)}
            </span>
          </span>
        )}

        <span
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
          title={`Öncelik: ${priorityLabel[topic.priority]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[topic.priority]}`} />
          <span className="hidden sm:inline">
            {priorityLabel[topic.priority]}
          </span>
        </span>

        <ChevronRight
          size={14}
          className="text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-muted-foreground"
        />
      </Link>
    </li>
  );
}
