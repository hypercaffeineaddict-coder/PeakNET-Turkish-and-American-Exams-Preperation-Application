"use client";

import { Globe2 } from "lucide-react";
import { LOCALE_COOKIE, LOCALES, localeNames, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-2 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-muted">
      <Globe2 size={14} className="text-foreground" />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(event) => {
          const next = event.target.value;
          document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
          window.location.reload();
        }}
        className="bg-transparent text-foreground outline-none"
        aria-label="Language"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
