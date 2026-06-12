import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Globe,
  ChevronRight,
  Circle,
  CircleDot,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Yurtdışı Sınavları · PeakNET" };

type TopicRow = {
  id: string;
  name: string;
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

// Henüz müfredatı eklenmemiş sınav aileleri (bilgilendirme + ilgi ölçmek için).
const COMING_SOON = [
  { id: "SAT", name: "SAT", desc: "Reading & Writing + Math · 400–1600" },
  { id: "ACT", name: "ACT", desc: "English, Math, Reading, Science · 1–36" },
  { id: "TOEFL", name: "TOEFL", desc: "Reading, Listening, Speaking, Writing · 0–120" },
];

export default async function YurtdisiPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subjectsRaw } = await supabase
    .from("subjects")
    .select(
      "id, name, color, question_count, display_order, topics(id, name, priority, display_order)",
    )
    .eq("exam_type", "AP")
    .order("display_order");

  const { data: progressRows } = await supabase
    .from("topic_progress")
    .select("topic_id, status")
    .eq("user_id", user.id);

  const apSubjects = (subjectsRaw ?? []) as SubjectRow[];
  const statusMap = new Map(
    (progressRows ?? []).map((p) => [p.topic_id, p.status as string]),
  );
  const totalTopics = apSubjects.reduce((a, s) => a + (s.topics?.length ?? 0), 0);
  const doneTopics = apSubjects.reduce(
    (a, s) => a + (s.topics ?? []).filter((t) => statusMap.get(t.id) === "done").length,
    0,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Globe className="text-primary" size={26} />
            Yurtdışı Sınavları
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Uluslararası üniversite başvuruları için sınavlar. YKS akışından
            tamamen ayrı — burada çalış, ilerlemeni işaretle.
          </p>
        </div>
        {totalTopics > 0 && (
          <div className="text-right">
            <div className="font-display text-2xl font-bold leading-none tabular-nums">
              {doneTopics}
              <span className="text-lg text-muted-foreground">/{totalTopics}</span>
            </div>
            <div className="text-xs text-muted-foreground">tamamlanan ünite</div>
          </div>
        )}
      </header>

      {/* AP — aktif */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-sm font-bold text-primary">
              AP
            </span>
            Advanced Placement
          </h2>
          <span className="text-xs text-muted-foreground">
            ABD üniversite düzeyi · 1–5 puan
          </span>
        </div>

        {apSubjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Globe size={32} className="mx-auto text-muted-foreground" />
            <h3 className="mt-3 font-semibold">AP müfredatı henüz yüklenmedi</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Dersler veritabanına eklendiğinde burada görünür. (Kurulum:
              Supabase&apos;de <code className="rounded bg-muted px-1">0019_ap_courses.sql</code>{" "}
              migration&apos;ını çalıştır.)
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {apSubjects.map((s) => {
              const topics = (s.topics ?? [])
                .slice()
                .sort((a, b) => a.display_order - b.display_order);
              const done = topics.filter((t) => statusMap.get(t.id) === "done").length;
              const pct = topics.length ? Math.round((done / topics.length) * 100) : 0;
              return (
                <details
                  key={s.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <summary className="flex cursor-pointer items-center gap-3 px-4 py-3.5 marker:hidden hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-muted-foreground transition group-open:rotate-90"
                    />
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color ?? "#888" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {s.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {topics.length} ünite
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: s.color ?? undefined }}
                        />
                      </span>
                      <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                        {done}/{topics.length}
                      </span>
                    </span>
                  </summary>
                  <ul className="border-t border-border">
                    {topics.map((t) => {
                      const status = statusMap.get(t.id) ?? "not_started";
                      const Icon =
                        status === "done"
                          ? CheckCircle2
                          : status === "in_progress"
                            ? CircleDot
                            : Circle;
                      const color =
                        status === "done"
                          ? "text-emerald-500"
                          : status === "in_progress"
                            ? "text-primary"
                            : "text-muted-foreground/50";
                      return (
                        <li key={t.id}>
                          <Link
                            href={`/konular/${t.id}`}
                            className="group/i flex items-center gap-3 px-4 py-2.5 transition hover:bg-muted/40"
                          >
                            <Icon size={15} className={`shrink-0 ${color}`} />
                            <span
                              className={`flex-1 truncate text-sm ${
                                status === "done"
                                  ? "text-muted-foreground line-through"
                                  : ""
                              }`}
                            >
                              {t.name}
                            </span>
                            <ChevronRight
                              size={14}
                              className="text-muted-foreground/40 transition group-hover/i:translate-x-0.5 group-hover/i:text-muted-foreground"
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })}
          </div>
        )}
      </section>

      {/* Yakında */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Yakında
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {COMING_SOON.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border border-dashed border-border bg-card/60 p-4 opacity-80"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">{e.name}</span>
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Lock size={10} /> Yakında
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
