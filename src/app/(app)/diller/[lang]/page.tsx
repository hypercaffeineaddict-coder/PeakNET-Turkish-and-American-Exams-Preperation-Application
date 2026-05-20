import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, AlertTriangle, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { languageById } from "@/data/languages";
import { aiHealth } from "@/lib/ai";
import { LanguageChat } from "./chat";

export default async function LanguagePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const language = languageById(lang);
  if (!language) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const health = await aiHealth();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/diller"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} /> Diller
        </Link>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-5xl leading-none">{language.flag}</span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {language.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language.nativeName} · {language.hello}
            </p>
          </div>
        </div>
      </div>

      {!health.ok && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">AI bağlantısı yok</div>
            <p className="mt-1 text-muted-foreground">
              {health.error ?? "AI sağlayıcısı yapılandırılmamış."}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {/* Alfabe / yazı sistemi */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen size={16} className="text-primary" />
              Yazı sistemi
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {language.alphabetIntro}
            </p>
          </section>

          {/* Temel kalıplar */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">İlk 7 temel kalıp</h2>
            <ul className="mt-3 divide-y divide-border">
              {language.basics.map((b, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-baseline gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-[8rem] font-medium text-foreground">
                    {b.item}
                  </span>
                  {b.reading && (
                    <span className="text-xs italic text-muted-foreground">
                      [{b.reading}]
                    </span>
                  )}
                  <span className="ml-auto text-muted-foreground">
                    {b.translation}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* AI ile pratik */}
          <LanguageChat
            languageId={language.id}
            languageName={language.name}
            aiReady={health.ok && health.hasChatModel}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl border border-border bg-card p-5 text-sm">
            <h3 className="text-sm font-semibold">İpuçları</h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>• Önce temel kalıpları ezberle (yazılı + okunuş)</li>
              <li>• AI ile günde 5 dakika pratik et</li>
              <li>• Anladığını bir cümleyle anlatmaya çalış</li>
              <li>• Yanlışlarını AI ile düzelt, ezberleme — anla</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 text-sm">
            <h3 className="text-sm font-semibold">Sıradaki</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Kelime kartları, telaffuz oyunu, günlük seri ve seviyeli ünite
              ilerlemesi yakında.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
