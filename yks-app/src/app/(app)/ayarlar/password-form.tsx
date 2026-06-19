"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, KeyRound } from "lucide-react";
import { changePassword } from "./actions";
import type { getDict } from "@/lib/i18n";

type Labels = ReturnType<typeof getDict>["passwordForm"];

export function PasswordForm({ labels }: { labels: Labels }) {
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
        {labels.title}
      </h2>
      <label className="block text-sm">
        <span className="text-muted-foreground">{labels.hint}</span>
        <input
          id="new-password-input"
          name="new_password"
          type="password"
          minLength={6}
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
        />
      </label>
      {error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        {changed && !pending && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-500">
            <Check size={14} /> {labels.changed}
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {labels.submit}
        </button>
      </div>
    </form>
  );
}
