"use client";

import { useTransition, useState } from "react";
import { updateApiKeys } from "./actions";
import { Key, ExternalLink } from "lucide-react";

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
            Yapay Zeka API Anahtarları
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kendi API anahtarlarınızı girerek sınırsız AI deneyimi yaşayın. Sistem anahtarları yerine bunlar kullanılır.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            Gemini API Anahtarı
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink size={10} /> Ücretsiz al
            </a>
          </label>
          <input
            type="password"
            value={gemini}
            onChange={(e) => setGemini(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            OpenAI API Anahtarı
          </label>
          <input
            type="password"
            value={openai}
            onChange={(e) => setOpenai(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Anthropic API Anahtarı
          </label>
          <input
            type="password"
            value={anthropic}
            onChange={(e) => setAnthropic(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Ollama URL
          </label>
          <input
            type="url"
            value={ollamaUrl}
            onChange={(e) => setOllamaUrl(e.target.value)}
            placeholder="http://localhost:11434"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {status === "error" && (
          <p className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-500">{errorMsg}</p>
        )}
        {status === "success" && (
          <p className="rounded-xl bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-500">
            API anahtarları başarıyla güncellendi.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Anahtarları Kaydet"}
        </button>
      </form>
    </section>
  );
}
