"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

type Student = {
  name: string | null;
  grade: number | null;
  track: string | null;
  targetUni: string | null;
  targetDept: string | null;
  strongSubjects: string[];
  weakSubjects: string[];
  isExamStudent: boolean;
};

const QUICK_PROMPTS = [
  "Bu hafta için bana çalışma planı çıkar",
  "Hangi konuya öncelik vermeliyim?",
  "Sınav stresimi nasıl yönetebilirim?",
  "Bugün için motivasyon ver",
];

export function AsistanChat({
  student,
  aiReady,
}: {
  student: Student;
  aiReady: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

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
            { role: "system", content: buildSystem(student) },
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
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 min-h-[400px]">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bot size={24} className="text-primary" />
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Merhaba {student.name ?? ""}! Ben senin AI asistanınım. Plan, konu
              tavsiyesi, motivasyon, ne istersen sor.
            </p>
            <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  disabled={!aiReady}
                  className="rounded-md border border-border bg-background px-3 py-2 text-left text-xs transition hover:bg-muted disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <Bubble key={i} message={m} studentName={student.name} />
          ))
        )}
        {streaming &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> asistan yazıyor...
            </div>
          )}
        <div ref={bottomRef} />
      </div>

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
            aiReady ? "Mesaj yaz..." : "Ollama bağlandığında aktifleşir"
          }
          disabled={!aiReady || streaming}
          rows={2}
          className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => void send(input)}
          disabled={!aiReady || streaming || !input.trim()}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Send size={14} /> Gönder
        </button>
      </div>
    </div>
  );
}

function Bubble({
  message,
  studentName,
}: {
  message: Message;
  studentName: string | null;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot size={16} />
        </div>
      )}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 text-foreground"
        }`}
      >
        {message.content || (
          <span className="text-muted-foreground">...</span>
        )}
      </div>
      {isUser && (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          title={studentName ?? undefined}
        >
          <User size={16} />
        </div>
      )}
    </div>
  );
}

function buildSystem(s: Student): string {
  const parts: string[] = [
    "Sen Türk lise öğrencisine YKS (TYT/AYT) yolculuğunda eşlik eden bilgili, sıcak ve disiplinli bir mentörsün.",
    "Öğrenci profili:",
    `- Ad: ${s.name ?? "—"}`,
    `- Sınıf: ${s.grade ?? "—"}${s.isExamStudent ? " (sınava hazırlanıyor)" : ""}`,
    `- Lise bölümü: ${s.track ?? "—"}`,
    `- Hedef: ${s.targetDept ?? "—"}${s.targetUni ? ` · ${s.targetUni}` : ""}`,
    `- Güçlü dersler: ${s.strongSubjects.join(", ") || "—"}`,
    `- Geliştirmesi gereken dersler: ${s.weakSubjects.join(", ") || "—"}`,
    "",
    "Kurallar:",
    "- Sade ve net Türkçe konuş.",
    "- Liste yerine doğal akıcı paragraflar tercih et, ama gerektiğinde madde madde de yaz.",
    "- Cevapları kısa tut, gereksiz tekrar yapma.",
    "- LaTeX değil düz semboller kullan (x², √, ≤).",
    "- Öğrenciyi dinle, sorularını teşvik et, kendine güvenmesini sağla.",
    "- Sınava yönelik somut, uygulanabilir tavsiyeler ver.",
  ];
  return parts.join("\n");
}
