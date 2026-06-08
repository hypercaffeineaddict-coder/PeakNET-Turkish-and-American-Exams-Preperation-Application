import { redirect } from "next/navigation";
import { Sparkles, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiHealth } from "@/lib/ai";
import { Coach } from "./coach";
import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return { title: getDict(locale).weeklyCoach.pageTitle };
}

export default async function RaporPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const locale = await getLocaleFromCookies();
  const dict = getDict(locale);
  const t = dict.weeklyCoach;
  const banner = dict.aiBanner;

  const health = await aiHealth();
  const aiReady = health.ok && health.hasChatModel;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Sparkles className="text-primary" size={26} />
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </header>

      {!aiReady && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <div className="font-medium text-amber-500">{banner.notConnected}</div>
            <p className="mt-1 text-muted-foreground">
              {health.error ?? banner.notConnectedDesc}
            </p>
          </div>
        </div>
      )}

      <Coach aiReady={aiReady} labels={t} />
    </div>
  );
}
