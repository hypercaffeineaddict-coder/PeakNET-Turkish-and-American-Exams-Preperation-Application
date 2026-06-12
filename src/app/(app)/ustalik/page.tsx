import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  GraduationCap,
  ChevronRight,
  Sparkles,
  Construction,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { subjectVisible } from "@/data/exam-subjects";
import {
  computeMastery,
  MASTERY_LABELS,
  MASTERY_COLORS,
  type MasteryLevel,
  type MasteryInfo,
} from "@/lib/mastery";

export const metadata = { title: "Ustalık · PeakNET" };

const examTabs = [
  { id: "AYT", label: "AYT", desc: "Alan Yeterlilik", extra: false },
  { id: "TYT", label: "TYT", desc: "Temel Yeterlilik", extra: false },
  { id: "YDT", label: "YDT", desc: "Yabancı Dil", extra: false },
  { id: "AP", label: "AP", desc: "Advanced Placement", extra: true },
] as const;
type ExamTab = (typeof examTabs)[number]["id"];

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
  tracks: string[] | null;
  topics: TopicRow[];
};

type TopicWithMastery = TopicRow & { mastery: MasteryInfo; subjectName: string };

export default async function UstalikPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const { tab } = await searchParams;
  const activeTab: ExamTab = (examTabs.find((t) => t.id === tab)?.id ??
    "AYT") as ExamTab;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subjectsRaw }, { data: progressRows }, { data: mistakeRows }, { data: sessionRows }, { data: profile }, { data: qlogRows }] =
    await Promise.all([
      supabase
        .from("subjects")
        .select("*, topics(*)")
        .eq("exam_type", activeTab)
        .order("display_order"),
      supabase
        .from("topic_progress")
        .select("topic_id, status, confidence")
        .eq("user_id", user.id),
      supabase
        .from("mistakes")
        .select("topic_id, repetitions")
        .eq("user_id", user.id)
        .not("topic_id", "is", null),
      supabase
        .from("study_sessions")
        .select("topic_id, duration_seconds")
        .eq("user_id", user.id)
        .not("topic_id", "is", null),
      supabase
        .from("profiles")
        .select("high_school_track, extra_exams")
        .eq("id", user.id)
        .single(),
      supabase
        .from("question_logs")
        .select("topic_id, correct, wrong")
        .eq("user_id", user.id)
        .not("topic_id", "is", null),
    ]);

  // Konu bazlı çözülen soru (ustalığa katkı): topic_id -> {solved, correct}
  const qByTopic = new Map<string, { solved: number; correct: number }>();
  for (const q of (qlogRows ?? []) as { topic_id: string | null; correct: number; wrong: number }[]) {
    if (!q.topic_id) continue;
    const cur = qByTopic.get(q.topic_id) ?? { solved: 0, correct: 0 };
    cur.solved += (q.correct ?? 0) + (q.wrong ?? 0);
    cur.correct += q.correct ?? 0;
    qByTopic.set(q.topic_id, cur);
  }

  const progressMap = new Map(
    (progressRows ?? []).map((p) => [p.topic_id, p]),
  );

  // Konu başına açık yanlış sayısı (henüz pekişmemiş: repetitions < 2)
  const mistakeMap = new Map<string, number>();
  for (const m of mistakeRows ?? []) {
    if (!m.topic_id) continue;
    if ((m.repetitions ?? 0) >= 2) continue;
    mistakeMap.set(m.topic_id, (mistakeMap.get(m.topic_id) ?? 0) + 1);
  }

  // Konu başına çalışma dakikası
  const studyMap = new Map<string, number>();
  for (const sRow of sessionRows ?? []) {
    if (!sRow.topic_id) continue;
    studyMap.set(
      sRow.topic_id,
      (studyMap.get(sRow.topic_id) ?? 0) + (sRow.duration_seconds ?? 0) / 60,
    );
  }

  // Görünürlük: çekirdek sınavlar (TYT/AYT/YDT) lise bölümüne göre; ekstra
  // sınavlar (AP) yalnız kullanıcı AYARLAR'dan açtıysa (opt-in).
  const track = profile?.high_school_track ?? null;
  const extraExams: string[] = profile?.extra_exams ?? [];
  const visibleTabs = examTabs.filter(
    (t) => !t.extra || extraExams.includes(t.id),
  );
  const allSubjects: SubjectRow[] = (subjectsRaw ?? []) as SubjectRow[];
  const subjects: SubjectRow[] = allSubjects.filter((s) =>
    subjectVisible(activeTab, s.tracks, track, extraExams),
  );

  const masteryFor = (t: TopicRow): MasteryInfo => {
    const p = progressMap.get(t.id);
    const q = qByTopic.get(t.id);
    return computeMastery({
      status: p?.status,
      confidence: p?.confidence,
      studyMinutes: studyMap.get(t.id),
      openMistakes: mistakeMap.get(t.id),
      questionsSolved: q?.solved,
      questionAccuracy: q && q.solved > 0 ? (q.correct / q.solved) * 100 : undefined,
    });
  };

  // Tüm konular (mastery ile)
  const allTopics: TopicWithMastery[] = [];
  for (const s of subjects) {
    for (const t of s.topics ?? []) {
      allTopics.push({ ...t, mastery: masteryFor(t), subjectName: s.name });
    }
  }

  const totalTopics = allTopics.length;
  const levelCounts: Record<MasteryLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  let scoreSum = 0;
  for (const t of allTopics) {
    levelCounts[t.mastery.level]++;
    scoreSum += t.mastery.score;
  }
  const avgScore = totalTopics ? Math.round(scoreSum / totalTopics) : 0;
  const masteredCount = levelCounts[4];

  // Adaptif öneri: yüksek öncelik + düşük ustalık (seviye <= 2), en düşük skordan
  const recommendations = allTopics
    .filter((t) => t.mastery.level <= 2)
    .sort((a, b) => {
      const pr = (p: string) => (p === "high" ? 0 : p === "medium" ? 1 : 2);
      if (pr(a.priority) !== pr(b.priority)) return pr(a.priority) - pr(b.priority);
      return a.mastery.score - b.mastery.score;
    })
    .slice(0, 6);

  const buildUrl = (t: string) => `/ustalik?tab=${t}`;
  // Ana liste boş: ya müfredat hiç yok ("yakında"), ya da bu sınav öğrencinin
  // bölümü dışı (örn. SAY öğrencisinde YDT) → ayrı, daha doğru mesaj.
  const emptyTab = subjects.length === 0;
  const notInTrack = emptyTab && allSubjects.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <GraduationCap className="text-primary" size={26} />
          Ustalık
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Her konuda hangi seviyedesin? Ustalığını yükselt, zayıf konulara
          odaklan.
        </p>
      </header>

      {/* Sekmeler */}
      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        {visibleTabs.map((t) => {
          const isActive = t.id === activeTab;
          return (
            <Link
              key={t.id}
              href={buildUrl(t.id)}
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

      {emptyTab ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Construction size={36} className="mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">
            {notInTrack
              ? `${activeTab} senin alanında değil`
              : `${activeTab} müfredatı yakında`}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {notInTrack
              ? "Bu sınav türü lise bölümüne göre başka bir alana ait. Kendi alanının sekmelerinden devam edebilirsin."
              : "Bu sınav türü için müfredat henüz eklenmedi. TYT ve AYT sekmelerinden devam edebilirsin."}
          </p>
        </div>
      ) : (
        <>
          {/* Genel özet */}
          <section className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6">
              <MasteryRing pct={avgScore} />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Genel ustalık
                </div>
                <div className="font-display text-3xl font-bold tabular-nums">{avgScore}%</div>
                <div className="text-xs text-muted-foreground">
                  {masteredCount}/{totalTopics} konu usta
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Seviye dağılımı
              </div>
              <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted">
                {([4, 3, 2, 1, 0] as MasteryLevel[]).map((lvl) =>
                  levelCounts[lvl] > 0 ? (
                    <div
                      key={lvl}
                      style={{
                        width: `${(levelCounts[lvl] / totalTopics) * 100}%`,
                        backgroundColor: MASTERY_COLORS[lvl],
                      }}
                      title={`${MASTERY_LABELS[lvl]}: ${levelCounts[lvl]}`}
                    />
                  ) : null,
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                {([4, 3, 2, 1, 0] as MasteryLevel[]).map((lvl) => (
                  <span key={lvl} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: MASTERY_COLORS[lvl] }}
                    />
                    <span className="text-muted-foreground">
                      {MASTERY_LABELS[lvl]}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {levelCounts[lvl]}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Adaptif öneri */}
          {recommendations.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles size={16} className="text-amber-500" />
                Şimdi buna odaklan
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Öncelikli ve ustalığı düşük konular — en çok kazanç burada.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((t) => (
                  <Link
                    key={t.id}
                    href={`/konular/${t.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary/50"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: t.mastery.color }}
                    >
                      {t.mastery.score}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {t.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {t.subjectName} · {priorityLabel[t.priority]} öncelik
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Ders bazlı liste */}
          <div className="space-y-3">
            {subjects.map((subject, idx) => {
              const topics = (subject.topics ?? [])
                .map((t) => ({ ...t, mastery: masteryFor(t) }))
                .sort((a, b) => {
                  const ga = a.grade ?? 0;
                  const gb = b.grade ?? 0;
                  if (ga !== gb) return ga - gb;
                  return a.display_order - b.display_order;
                });
              if (topics.length === 0) return null;

              const subjAvg = Math.round(
                topics.reduce((s, t) => s + t.mastery.score, 0) / topics.length,
              );
              const subjMastered = topics.filter((t) => t.mastery.level === 4).length;

              return (
                <details
                  key={subject.id}
                  open={idx === 0}
                  className="group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <summary className="flex cursor-pointer items-center gap-4 px-5 py-4 marker:hidden hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
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
                        {subjMastered}/{topics.length} usta
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-muted sm:block">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${subjAvg}%`,
                            backgroundColor: subject.color ?? undefined,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                        {subjAvg}%
                      </span>
                    </div>
                  </summary>

                  <ul className="border-t border-border">
                    {topics.map((topic) => (
                      <li key={topic.id}>
                        <Link
                          href={`/konular/${topic.id}`}
                          className="group flex items-center gap-3 px-5 py-2.5 transition hover:bg-muted/40"
                        >
                          <span
                            className="w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-medium text-white"
                            style={{ backgroundColor: topic.mastery.color }}
                          >
                            {topic.mastery.label}
                          </span>
                          <span className="flex-1 truncate text-sm">
                            {topic.name}
                          </span>
                          <div className="hidden w-28 items-center gap-2 sm:flex">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${topic.mastery.score}%`,
                                  backgroundColor: topic.mastery.color,
                                }}
                              />
                            </div>
                            <span className="w-7 text-right text-[11px] tabular-nums text-muted-foreground">
                              {topic.mastery.score}
                            </span>
                          </div>
                          <ChevronRight
                            size={14}
                            className="shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function MasteryRing({ pct }: { pct: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const color =
    pct >= 80 ? "#10b981" : pct >= 50 ? "#8b5cf6" : pct >= 20 ? "#0ea5e9" : "#f59e0b";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth="7"
      />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 36 36)"
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        className="fill-foreground text-[15px] font-semibold"
      >
        {pct}
      </text>
    </svg>
  );
}
