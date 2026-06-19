"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();

export function GoogleButton({
  label = "Google ile devam et",
  errorNotEnabled = "Google ile giriş şu an aktif değil. E-posta ile giriş yapabilirsin.",
  errorPrefix = "Google girişi başlatılamadı: ",
}: {
  label?: string;
  errorNotEnabled?: string;
  errorPrefix?: string;
}) {
  const [busy, setBusy] = useState(false);
  // null = bilinmiyor, true = göster, false = provider etkin değil → gizle
  const [enabled, setEnabled] = useState<boolean | null>(null);

  // Provider Supabase'de etkin mi? Etkin değilse butonu hiç gösterme.
  useEffect(() => {
    if (!SUPABASE_URL) {
      setEnabled(false);
      return;
    }
    const url = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
      `${window.location.origin}/auth/callback`,
    )}`;
    fetch(url, { redirect: "manual" })
      .then(async (r) => {
        if (r.type === "opaqueredirect" || r.status === 0 || (r.status >= 300 && r.status < 400)) {
          setEnabled(true); // Google'a yönlendiriyor → etkin
          return;
        }
        const t = await r.text().catch(() => "");
        setEnabled(!/not enabled|unsupported provider/i.test(t));
      })
      .catch(() => setEnabled(true)); // ağ belirsizse göster (çalışan kurulumu gizleme)
  }, []);

  async function signIn() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setBusy(false);
        const notEnabled = /not enabled|unsupported provider/i.test(error.message);
        toast.error(notEnabled ? errorNotEnabled : `${errorPrefix}${error.message}`);
      }
      // başarılıysa Google'a yönleniyoruz; busy kalsın
    } catch {
      setBusy(false);
    }
  }

  // Provider etkin değilse butonu gösterme (bozuk buton kalmasın)
  if (enabled === false) return null;

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={busy || enabled === null}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium shadow-soft transition hover:border-primary/40 hover:bg-muted disabled:opacity-60"
    >
      {busy ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
      )}
      {label}
    </button>
  );
}
