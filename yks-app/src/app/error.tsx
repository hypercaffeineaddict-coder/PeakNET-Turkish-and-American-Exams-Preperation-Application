"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uygulama hatası:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
          <AlertTriangle size={22} className="text-rose-500" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Bir şey ters gitti</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Beklenmedik bir hata oluştu. Tekrar deneyebilir veya ana sayfaya dönebilirsin.
        </p>
        {error.message && (
          <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-left text-xs font-mono text-muted-foreground break-words">
            {error.message}
          </p>
        )}
        {error.digest && (
          <p className="mt-2 text-[10px] text-muted-foreground/60">
            Referans: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <RefreshCw size={14} /> Tekrar dene
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm transition hover:bg-muted"
          >
            <Home size={14} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
