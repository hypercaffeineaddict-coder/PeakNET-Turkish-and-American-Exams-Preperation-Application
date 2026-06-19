import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BuiltinTestClient, type BuiltinQuestion } from "./client";

export const metadata = { title: "Hazır Test · PeakNET" };

export default async function HazirTestPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: topic } = await supabase
    .from("topics")
    .select("name, subjects(name)")
    .eq("id", topicId)
    .single();
  if (!topic) notFound();

  const { data: builtin } = await supabase
    .from("builtin_questions")
    .select("questions, topic_name, subject_name")
    .eq("topic_id", topicId)
    .maybeSingle();

  const questions = (builtin?.questions ?? []) as BuiltinQuestion[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/konular/${topicId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> {topic.name}
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Target className="text-primary" size={26} />
          Hazır Test
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {topic.name} · PeakNET hazır soruları (AI üretimi özgün sorular).
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Target size={36} className="mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Bu konu için hazır test yok</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Konu sayfasından <strong>AI ile test üret</strong> diyerek kendine
            özel test oluşturabilirsin.
          </p>
          <Link
            href={`/konular/${topicId}`}
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Konuya dön
          </Link>
        </div>
      ) : (
        <BuiltinTestClient questions={questions} />
      )}
    </div>
  );
}
