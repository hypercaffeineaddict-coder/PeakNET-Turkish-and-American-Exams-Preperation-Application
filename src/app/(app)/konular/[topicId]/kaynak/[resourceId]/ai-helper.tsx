"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  ChevronUp,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export function AIHelperDrawer({
  resourceTitle,
  topicName,
  subjectName,
  resourceKind,
  url,
  aiReady,
}: {
  resourceTitle: string;
  topicName: string;
  subjectName: string;
  resourceKind: string;
  url: string | null;
  aiReady: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, open]);

  // Esc ile kapat
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: buildSystem({ resourceTitle, topicName, subjectName, resourceKind, url }) },
            ...next.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      if (!res.ok || !res.body) {
        const t = await res.text();
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `_Hata: ${t || res.status}_` },
        ]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `_Bağlantı hatası: ${String(err)}_` },
      ]);
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-violet-600"
        >
          <Sparkles size={16} />
          AI yardımcı
          <ChevronUp size={14} />
        </button>
      )}

      {/* Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-[min(80vh,720px)] max-w-3xl flex-col rounded-t-2xl border border-border bg-card shadow-2xl">
            <header className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">AI Yardımcı</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {resourceTitle.length > 50
                      ? resourceTitle.slice(0, 50) + "…"
                      : resourceTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                    <Bot size={24} className="text-violet-500" />
                  </div>
                  <p className="max-w-md text-sm text-muted-foreground">
                    <strong className="text-foreground">{topicName}</strong>{" "}
                    konusunda bu kaynak üzerinden yardım edebilirim. Takıldığın
                    yeri, anlamadığın kavramı veya bir soru çözümünü sorabilirsin.
                  </p>
                  <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
                    {QUICK_PROMPTS(topicName).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => send(p)}
                        disabled={!aiReady}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-left text-xs transition hover:bg-muted disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => <Bubble key={i} message={m} />)
              )}
              {streaming &&
                messages[messages.length - 1]?.role === "user" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    yazıyor...
                  </div>
                )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder={
                    aiReady ? "Soru sor..." : "AI bağlantısı yok"
                  }
                  disabled={!aiReady || streaming}
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => void send(input)}
                  disabled={!aiReady || streaming || !input.trim()}
                  className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
          <Bot size={14} />
        </div>
      )}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 text-foreground"
        }`}
      >
        {message.content || <span className="text-muted-foreground">...</span>}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User size={14} />
        </div>
      )}
    </div>
  );
}

function QUICK_PROMPTS(topicName: string) {
  return [
    `${topicName} konusunun özetini çıkar`,
    "Sıkça yapılan hataları söyle",
    "Bir örnek soru çöz",
    "Hangi formülleri ezberlemeliyim?",
  ];
}

function buildSystem(ctx: {
  resourceTitle: string;
  topicName: string;
  subjectName: string;
  resourceKind: string;
  url: string | null;
}): string {
  const kindLabel: Record<string, string> = {
    video: "video",
    link: "web sayfası",
    note: "not",
    test: "test",
    book: "kitap",
    file: "dosya/PDF",
  };
  const k = kindLabel[ctx.resourceKind] ?? "kaynak";
  return `Sen bir YKS öğrencisine yardımcı olan kıdemli bir öğretmensin.

Öğrenci şu anda şu kaynağı inceliyor:
- Kaynak türü: ${k}
- Başlık: ${ctx.resourceTitle}
- Konu: ${ctx.topicName} (${ctx.subjectName})
${ctx.url ? `- Adres: ${ctx.url}` : ""}

Önemli not: Sen videoyu canlı izleyemezsin veya dosyayı doğrudan okuyamazsın. Ama bu konuyu ÖSYM müfredatına göre çok iyi biliyorsun. Öğrencinin sorusunu, ${ctx.topicName} konusu üzerinden cevapla.

Kurallar:
- Sade, net Türkçe.
- Cevapları kısa tut, gereksiz uzatma.
- LaTeX değil, düz semboller (x², √, ≤).
- Bilmediğin bir şey varsa "bu kaynağın içeriğini göremiyorum ama konu hakkında..." diye netleştir.
- Adım adım örnek ver, formül kullanırken nasıl uygulandığını göster.`;
}
