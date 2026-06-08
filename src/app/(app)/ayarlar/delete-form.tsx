"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteAccount } from "./actions";
import type { getDict } from "@/lib/i18n";

type Labels = ReturnType<typeof getDict>["deleteForm"];

export function DeleteAccountForm({
  email,
  initialError,
  labels,
}: {
  email: string;
  initialError?: string;
  labels: Labels;
}) {
  const Icon = AlertTriangle;
  const [confirmInput, setConfirmInput] = useState("");
  const matches = confirmInput === email;

  return (
    <form
      action={deleteAccount}
      className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-3"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-rose-500">
        <Icon size={16} />
        {labels.title}
      </h2>
      <p className="text-xs text-muted-foreground">{labels.warning}</p>
      <p className="text-xs">
        {labels.confirmPrompt}{" "}
        <span className="font-mono text-foreground">{email}</span>
      </p>
      <input
        name="confirm"
        value={confirmInput}
        onChange={(e) => setConfirmInput(e.target.value)}
        placeholder={labels.placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-rose-500"
      />
      {initialError && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
          {initialError}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!matches}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-500/20 disabled:opacity-40"
        >
          <Trash2 size={14} />
          {labels.submit}
        </button>
      </div>
    </form>
  );
}
