"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { languageById, type LanguageId } from "@/data/languages";
import { MicButton, SpeakerToggle, speak, stopSpeaking } from "@/components/voice-controls";

type Message = { role: "user" | "assistant"; content: string };

export function LanguageChat({
  languageId,
  languageName,
  aiReady,
}: {
  languageId: LanguageId;
  languageName: string;
  aiReady: boolean;
}) {
  const lang = languageById(languageId)!;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [ttsOn, setTtsOn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSpokenIdxRef = useRef<number>(-1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // TTS — son AI mesajını dile özgü sesle oku
  useEffect(() => {
    if (!ttsOn || streaming) return;
    const lastIdx = messages.length - 1;
    if (lastIdx < 0) return;
    const last = messages[lastIdx];
    if (last.role !== "assistant" || !last.content) return;
    if (lastSpokenIdxRef.current === lastIdx) return;
    lastSpokenIdxRef.current = lastIdx;
    // Hedef dilin BCP47 koduyla oku (Japonca/Çince vs. native ses)
    speak(last.content, { lang: lang.bcp47 });
  }, [messages, streaming, ttsOn, lang.bcp47]);

  useEffect(() => {
    if (!ttsOn) stopSpeaking();
  }, [ttsOn]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

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
            { role: "system", content: lang.aiSystemHint },
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

  const QUICK_PROMPTS = [
    `${languageName} alfabesini/yazı sistemini tanıt`,
    `Selamlaşma diyaloğu yazalım`,
    `Bana 5 yeni kelime öğret`,
    `Bir cümleyi düzelt: kullanıcı kendi cümlesini yazsın`,
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles size={16} className="text-violet-500" />
        AI ile pratik
      </h2>

      <div className="mt-4 min-h-[280px] space-y-4 rounded-xl bg-background/40 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-md text-sm text-muted-foreground">
              {lang.flag} {languageName} pratiğine başlamaya hazır mısın?
            </p>
            <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  disabled={!aiReady}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs transition hover:bg-muted disabled:opacity-50"
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
              <Loader2 size={14} className="animate-spin" /> yazıyor...
            </div>
          )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-end gap-2">
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
            aiReady
              ? `${languageName} pratiği yap... (Türkçe veya o dilde yaz)`
              : "AI bağlantısı yok"
          }
          disabled={!aiReady || streaming}
          rows={2}
          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
        />
        <div className="flex flex-col gap-1">
          <MicButton
            lang={lang.bcp47}
            disabled={!aiReady || streaming}
            title={`${languageName} telaffuz pratiği yap`}
            onTranscript={(text, isFinal) => {
              setInput(text);
              if (isFinal && text.trim()) void send(text);
            }}
          />
          <SpeakerToggle
            on={ttsOn}
            onChange={setTtsOn}
            title={`AI'nın ${languageName} cevaplarını sesli oku`}
          />
        </div>
        <button
          type="button"
          onClick={() => void send(input)}
          disabled={!aiReady || streaming || !input.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Send size={14} /> Gönder
        </button>
      </div>
    </section>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
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
        {message.content || <span className="text-muted-foreground">...</span>}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
