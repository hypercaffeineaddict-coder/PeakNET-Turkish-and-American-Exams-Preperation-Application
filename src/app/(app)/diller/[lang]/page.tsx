import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, AlertTriangle, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { languageById, languageResources } from "@/data/languages";
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

          {/* Tematik kelime paketleri */}
          {language.units?.map((u, ui) => (
            <details
              key={ui}
              className="group overflow-hidden rounded-2xl border border-border bg-card"
              open={ui === 0}
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen size={14} className="text-primary" />
                  {u.title}
                </span>
                <span className="text-xs text-muted-foreground transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <ul className="divide-y divide-border border-t border-border">
                {u.phrases.map((p, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-baseline gap-3 px-6 py-2.5 text-sm"
                  >
                    <span className="min-w-[6rem] font-medium text-foreground">
                      {p.item}
                    </span>
                    {p.reading && (
                      <span className="text-xs italic text-muted-foreground">
                        [{p.reading}]
                      </span>
                    )}
                    <span className="ml-auto text-muted-foreground">
                      {p.translation}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ))}

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
            <h3 className="text-sm font-semibold">Pratik akış</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li>1. Yazı sistemi notunu oku, sesli okumayı dene.</li>
              <li>2. 7 temel kalıbı + üniteleri (sayılar, günlük ifadeler) ezberle.</li>
              <li>3. AI ile sohbet et: yazdığını gör, hatanı düzelt.</li>
              <li>4. Yardımcı kaynaklarla kelimeni genişlet (aşağıda).</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 text-sm">
            <h3 className="text-sm font-semibold">Yardımcı kaynaklar</h3>
            <ul className="mt-3 space-y-2.5">
              {languageResources(language).map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs font-medium text-primary hover:underline"
                  >
                    {r.title} ↗
                  </a>
                  {r.note && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {r.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] text-muted-foreground">
              Wikipedia ve Wiktionary CC BY-SA lisansıyla ücretsizdir.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
