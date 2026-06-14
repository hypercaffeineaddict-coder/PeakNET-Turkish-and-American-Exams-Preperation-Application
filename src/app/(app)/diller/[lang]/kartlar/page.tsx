import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FlashcardDeck } from "./client";
import { GenerateCardsModal } from "./generate-modal";
import { BrainCircuit } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch cards due today or earlier for this language
  const today = new Date().toISOString().split("T")[0];
  const { data: cards } = await supabase
    .from("flashcards")
    .select("id, front, back")
    .eq("user_id", user.id)
    .eq("subject_name", lang)
    .lte("next_review_at", today)
    .order("next_review_at", { ascending: true })
    .limit(20);

  return (
    <div className="flex flex-col gap-8 pb-12 pt-6 sm:pt-10">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BrainCircuit size={32} />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Günlük Kelime Tekrarı
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aralıklı tekrar (SM-2) algoritması ile kelimeleri kalıcı olarak hafızanıza kazıyın.
          </p>
          <div className="mt-6 flex justify-center">
            <GenerateCardsModal lang={lang} />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex justify-center px-4">
        <FlashcardDeck cards={cards || []} lang={lang} />
      </main>
    </div>
  );
}
