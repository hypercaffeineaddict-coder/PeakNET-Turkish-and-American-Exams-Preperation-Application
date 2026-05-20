import Link from "next/link";
import { redirect } from "next/navigation";
import { Languages, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { languages } from "@/data/languages";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Çok kolay",
  2: "Kolay",
  3: "Orta",
  4: "Zor",
  5: "Çok zor",
};

export default async function DillerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Languages className="text-primary" size={26} />
          Diller
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          YKS yolculuğunda bir yan beceri kazan — yapay zeka eşliğinde dil pratiği.
          Her dilin temel kalıplarıyla başla, sonra serbest sohbet et.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {languages.map((lang) => (
          <Link
            key={lang.id}
            href={`/diller/${lang.id}`}
            className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-5xl leading-none">{lang.flag}</div>
              <div className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {"●".repeat(lang.difficulty)}
                {"○".repeat(5 - lang.difficulty)}{" "}
                {DIFFICULTY_LABEL[lang.difficulty]}
              </div>
            </div>
            <h2 className="mt-4 text-xl font-semibold">
              {lang.name}{" "}
              <span className="text-base text-muted-foreground">
                · {lang.nativeName}
              </span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang.description}
            </p>
            <p className="mt-3 font-medium text-primary">
              {lang.hello} <span className="text-muted-foreground">— Merhaba</span>
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition group-hover:gap-2">
              Başla
              <ChevronRight size={14} />
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Daha sonra: kelime kartları, telaffuz, yazma alıştırmaları ve günlük seri
        eklenecek.
      </p>
    </div>
  );
}
