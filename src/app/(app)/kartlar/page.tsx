import { redirect } from "next/navigation";
import { Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { subjectForTrack } from "@/data/exam-subjects";
import { aiHealth } from "@/lib/ai";
import { KartlarClient } from "./client";

export const metadata = { title: "Tekrar Kartları · PeakNET" };

type SubjectRow = {
  id: string;
  name: string;
  exam_type: string;
  tracks: string[] | null;
  topics: { id: string; name: string; display_order: number }[];
};

export default async function KartlarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: cards }, { data: subjectsRaw }, { data: profile }, health] =
    await Promise.all([
      supabase
        .from("flashcards")
        .select("id, front, back, topic_name, subject_name, next_review_at, repetitions")
        .eq("user_id", user.id)
        .order("next_review_at", { ascending: true }),
      supabase
        .from("subjects")
        .select("*, topics(id, name, display_order)")
        .in("exam_type", ["TYT", "AYT"])
        .order("display_order"),
      supabase.from("profiles").select("high_school_track").eq("id", user.id).single(),
      aiHealth(),
    ]);

  const track = profile?.high_school_track ?? null;
  const subjects = ((subjectsRaw ?? []) as SubjectRow[]).filter(
    (s) => subjectForTrack(s.tracks, track),
  );

  const allCards = cards ?? [];
  const due = allCards.filter((c) => (c.next_review_at ?? today) <= today);

  // Desteler: konuya göre grupla
  const deckMap = new Map<
    string,
    { topicName: string; subjectName: string; total: number; due: number }
  >();
  for (const c of allCards) {
    const key = `${c.subject_name}|${c.topic_name}`;
    const d = deckMap.get(key) ?? {
      topicName: c.topic_name ?? "—",
      subjectName: c.subject_name ?? "",
      total: 0,
      due: 0,
    };
    d.total++;
    if ((c.next_review_at ?? today) <= today) d.due++;
    deckMap.set(key, d);
  }
  const decks = Array.from(deckMap.values()).sort((a, b) => b.due - a.due);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Layers className="text-primary" size={26} />
          Tekrar Kartları
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aralıklı tekrar (SM-2) ile kalıcı öğren. AI bir konudan kart üretir, sen
          her gün vadesi gelenleri tekrarlarsın.
        </p>
      </header>

      <KartlarClient
        due={due}
        totalCards={allCards.length}
        decks={decks}
        subjects={subjects.map((s) => ({
          id: s.id,
          name: s.name,
          topics: (s.topics ?? [])
            .slice()
            .sort((a, b) => a.display_order - b.display_order)
            .map((t) => ({ id: t.id, name: t.name })),
        }))}
        aiReady={health.ok && health.hasChatModel}
      />
    </div>
  );
}
