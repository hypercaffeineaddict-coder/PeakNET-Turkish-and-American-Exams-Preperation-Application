import Link from "next/link";
import { redirect } from "next/navigation";
import { Wand2, ScanLine, Layers, Timer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { subjectForTrack } from "@/data/exam-subjects";
import { aiHealth } from "@/lib/ai";
import { SoruUretClient } from "./client";

export const metadata = { title: "Soru Üret · PeakNET" };

type SubjectRow = {
  id: string;
  name: string;
  exam_type: string;
  tracks: string[] | null;
  topics: { id: string; name: string; display_order: number }[];
};

export default async function SoruUretPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subjectsRaw }, { data: profile }, health] = await Promise.all([
    supabase
      .from("subjects")
      .select("*, topics(id, name, display_order)")
      .in("exam_type", ["TYT", "AYT"])
      .order("display_order"),
    supabase.from("profiles").select("high_school_track").eq("id", user.id).single(),
    aiHealth(),
  ]);

  const track = profile?.high_school_track ?? null;
  const subjects = ((subjectsRaw ?? []) as SubjectRow[])
    .filter((s) => subjectForTrack(s.tracks, track))
    .map((s) => ({
      id: s.id,
      name: s.name,
      topics: (s.topics ?? [])
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .map((t) => ({ id: t.id, name: t.name })),
    }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Wand2 className="text-primary" size={26} />
          Soru Üret
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ders ve konu seç, AI sana o konudan ÖSYM tarzı test üretsin. Daha geniş
          üretim için aşağıdaki araçları kullan.
        </p>
      </header>

      <SoruUretClient
        subjects={subjects}
        aiReady={health.ok && health.hasChatModel}
      />

      {/* Diğer üretim araçları */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Diğer üretim araçları
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <ToolCard
            href="/tarama"
            icon={ScanLine}
            title="Tarama testi"
            desc="Bir dersin tüm konularına yayılmış tanı testi."
          />
          <ToolCard
            href="/kartlar"
            icon={Layers}
            title="Tekrar kartları"
            desc="Konudan AI flashcard üret, aralıklı tekrar et."
          />
          <ToolCard
            href="/deneme-sim"
            icon={Timer}
            title="Deneme simülasyonu"
            desc="Süreli, çok dersli mini deneme + net sonucu."
          />
        </div>
      </section>
    </div>
  );
}

function ToolCard({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
    >
      <Icon size={18} className="text-primary" />
      <div className="mt-2 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </Link>
  );
}
