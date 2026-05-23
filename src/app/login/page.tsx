import Link from "next/link";
import { loginAction } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleButton } from "@/components/google-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Giriş Yap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          YKS çalışma panona devam et.
        </p>

        <div className="mt-6">
          <GoogleButton label="Google ile giriş yap" />
        </div>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> veya{" "}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form action={loginAction} className="flex flex-col gap-3">
          <label className="text-sm">
            <span className="text-muted-foreground">E-posta</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Şifre</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>

          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90"
          >
            Giriş yap
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Hesabın yok mu?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
