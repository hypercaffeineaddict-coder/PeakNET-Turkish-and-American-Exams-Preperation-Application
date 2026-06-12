"use client";

import { useTransition, useState } from "react";
import { updateApiKeys } from "./actions";
import { Key } from "lucide-react";

export function ByokForm({
  initialKeys,
}: {
  initialKeys: { gemini?: string; openai?: string; anthropic?: string; ollamaUrl?: string };
}) {
  const [isPending, startTransition] = useTransition();
  const [gemini, setGemini] = useState(initialKeys?.gemini || "");
  const [openai, setOpenai] = useState(initialKeys?.openai || "");
  const [anthropic, setAnthropic] = useState(initialKeys?.anthropic || "");
  const [ollamaUrl, setOllamaUrl] = useState(initialKeys?.ollamaUrl || "");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    startTransition(async () => {
      const res = await updateApiKeys({ gemini, openai, anthropic, ollamaUrl });
      if (res?.error) {
        setStatus("error");
        setErrorMsg(res.error);
      } else {
        setStatus("success");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Key size={18} className="text-primary" />
            AI API Keys (BYOK)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your own API keys. If set, they will be used instead of the platform defaults.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Gemini API Key
          </label>
          <input
            type="password"
            value={gemini}
            onChange={(e) => setGemini(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={openai}
            onChange={(e) => setOpenai(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Anthropic API Key
          </label>
          <input
            type="password"
            value={anthropic}
            onChange={(e) => setAnthropic(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Ollama Base URL
          </label>
          <input
            type="url"
            value={ollamaUrl}
            onChange={(e) => setOllamaUrl(e.target.value)}
            placeholder="http://localhost:11434"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-rose-500">{errorMsg}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-emerald-500">API keys updated successfully.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save API Keys"}
        </button>
      </form>
    </section>
  );
}
