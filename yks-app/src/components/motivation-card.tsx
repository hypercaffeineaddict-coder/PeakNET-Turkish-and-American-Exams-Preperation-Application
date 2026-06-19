import { Quote } from "lucide-react";
import { quoteOfTheDay } from "@/data/quotes";
import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";

export async function MotivationCard({ className = "" }: { className?: string }) {
  const q = quoteOfTheDay();
  const locale = await getLocaleFromCookies();
  const t = getDict(locale).dashWidgets.motivation;
  return (
    <div
      className={`rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
        <Quote size={14} />
        {t.title}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">
        &ldquo;{q.text}&rdquo;
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        — <span className="font-medium text-foreground">{q.author}</span>
        {q.detail && <span className="text-muted-foreground"> · {q.detail}</span>}
      </p>
    </div>
  );
}
