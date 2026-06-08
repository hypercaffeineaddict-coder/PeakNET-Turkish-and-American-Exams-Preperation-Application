import Link from "next/link";
import { loginAction } from "./actions";
import { GoogleButton } from "@/components/google-button";
import { AuthShell } from "@/components/auth-shell";
import { getDict } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/i18n-server";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await getLocaleFromCookies();
  const t = getDict(locale).auth;

  return (
    <AuthShell title={t.login.title} subtitle={t.login.subtitle} labels={t}>
      <GoogleButton
        label={t.login.googleButton}
        errorNotEnabled={t.googleErrors.notEnabled}
        errorPrefix={t.googleErrors.prefix}
      />

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t.orWithEmail}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={loginAction} className="flex flex-col gap-4">
        <label className="text-sm">
          <span className="font-medium text-muted-foreground">{t.emailLabel}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-muted-foreground">{t.passwordLabel}</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </label>

        {error && (
          <p className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.99]"
        >
          {t.login.submit}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t.login.noAccount}{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          {t.login.signUp}
        </Link>
      </p>
    </AuthShell>
  );
}
