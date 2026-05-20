"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, KeyRound } from "lucide-react";
import { changePassword } from "./actions";

export function PasswordForm() {
  const Icon = KeyRound;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null);
          setChanged(false);
          const res = await changePassword(fd);
          if (res?.error) setError(res.error);
          else {
            setChanged(true);
            (document.getElementById("new-password-input") as HTMLInputElement | null)?.form?.reset();
          }
        })
      }
      className="rounded-2xl border border-border bg-card p-6 space-y-4"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Icon size={16} className="text-primary" />
        Şifre değiştir
      </h2>
      <label className="block text-sm">
        <span className="text-muted-foreground">Yeni şifre (en az 6 karakter)</span>
        <input
          id="new-password-input"
          name="new_password"
          type="password"
          minLength={6}
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
        />
      </label>
      {error && (
        <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        {changed && !pending && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-500">
            <Check size={14} /> Şifre güncellendi
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-5 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Şifreyi değiştir
        </button>
      </div>
    </form>
  );
}
