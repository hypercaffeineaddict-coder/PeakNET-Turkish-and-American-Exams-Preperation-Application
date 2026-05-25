import Link from "next/link";
import { loginAction } from "./actions";
import { GoogleButton } from "@/components/google-button";
import { AuthShell } from "@/components/auth-shell";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell title="Tekrar hoş geldin" subtitle="YKS çalışma panona devam et.">
      <GoogleButton label="Google ile giriş yap" />

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        veya e-posta ile
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={loginAction} className="flex flex-col gap-4">
        <label className="text-sm">
          <span className="font-medium text-muted-foreground">E-posta</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-muted-foreground">Şifre</span>
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
          Giriş yap
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Kayıt ol
        </Link>
      </p>
    </AuthShell>
  );
}
