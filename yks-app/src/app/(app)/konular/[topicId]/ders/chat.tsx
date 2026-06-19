"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  Loader2,
  Bot,
  User,
  GraduationCap,
  Check,
  X,
  FileText,
  Paperclip,
} from "lucide-react";
import { MicButton, SpeakerToggle, speak, stopSpeaking } from "@/components/voice-controls";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Topic = {
  id: string;
  name: string;
  subjectName: string;
  grade: number | null;
  examType: string;
};

type Student = {
  name?: string;
  grade?: number | null;
  isExamStudent?: boolean;
};

type Quiz = {
  questions: {
    stem: string;
    options: Record<string, string>;
    answer: string;
    explanation: string;
  }[];
};

type PdfResource = {
  id: string;
  title: string;
  fileSize: number;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function DersChat({
  mode,
  topic,
  student,
  aiReady,
  supportsAttachments,
  pdfs,
  autoTts = false,
}: {
  mode: "free" | "source";
  topic: Topic;
  student: Student;
  aiReady: boolean;
  supportsAttachments: boolean;
  pdfs: PdfResource[];
  autoTts?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [attachedPdfId, setAttachedPdfId] = useState<string | null>(
    mode === "source" && pdfs.length === 1 ? pdfs[0].id : null,
  );
  const [ttsOn, setTtsOn] = useState(autoTts);
  const lastSpokenIdxRef = useRef<number>(-1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, quiz]);

  // TTS açıkken: streaming biten son assistant mesajını oku
  useEffect(() => {
    if (!ttsOn || streaming) return;
    const lastIdx = messages.length - 1;
    if (lastIdx < 0) return;
    const last = messages[lastIdx];
    if (last.role !== "assistant" || !last.content) return;
    if (lastSpokenIdxRef.current === lastIdx) return;
    lastSpokenIdxRef.current = lastIdx;
    speak(last.content, { lang: "tr-TR" });
  }, [messages, streaming, ttsOn]);

  // TTS kapatınca okumayı durdur
  useEffect(() => {
    if (!ttsOn) stopSpeaking();
  }, [ttsOn]);

  // Component unmount'ta da kes
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // İlk açılışta AI'a "konuyu anlatmaya başla" der.
  // Source modda PDF seçilmediyse açılışı geciktir (kullanıcı seçsin)
  useEffect(() => {
    if (!aiReady || messages.length > 0) return;
    if (mode === "source" && pdfs.length > 0 && !attachedPdfId) return;
    const opener =
      mode === "source" && attachedPdfId
        ? `Merhaba, yüklediğim PDF'in içeriği üzerinden ${topic.name} konusunu anlatmaya başlayabilir misin?`
        : `Merhaba, ${topic.name} konusunu anlatmaya başlayabilir misin?`;
    void sendMessage(opener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiReady, attachedPdfId]);

  async function sendMessage(text: string, kind: "user" | "internal" = "user") {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const next = kind === "user" ? [...messages, userMsg] : messages;
    if (kind === "user") setMessages(next);
    setInput("");
    setStreaming(true);

    // İlk mesajda (henüz AI cevap yoksa) attachment'ı gönder
    const isFirstUserMessage = !next.some((m) => m.role === "assistant");
    const payload: {
      messages: ReturnType<typeof buildMessagesForServer>;
      attachmentResourceId?: string;
    } = {
      messages: buildMessagesForServer(mode, topic, student, next, {
        hasAttachment: !!attachedPdfId && isFirstUserMessage,
      }),
    };
    if (attachedPdfId && isFirstUserMessage) {
      payload.attachmentResourceId = attachedPdfId;
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `_Hata: ${errText || res.status}_` },
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

  async function startQuiz() {
    setQuizLoading(true);
    setQuizAnswers({});
    setQuizRevealed(false);
    setQuiz(null);

    const payload = {
      messages: buildMessagesForServer(mode, topic, student, messages, {
        wantQuiz: true,
      }),
    };

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok || !res.body) {
        alert("Quiz üretilemedi");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
      }
      const parsed = parseQuiz(acc);
      if (parsed) {
        setQuiz(parsed);
      } else {
        alert("Quiz formatı çözülemedi. AI çıktısı: " + acc.slice(0, 200));
      }
    } finally {
      setQuizLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card/50 px-4 py-2 text-xs text-muted-foreground">
        <span className="text-foreground">Mod:</span>{" "}
        {mode === "free" ? "Serbest (AI kendi bildiklerinden)" : "Kaynak destekli"} ·{" "}
        <span className="text-foreground">Konu:</span> {topic.name} ({topic.subjectName})
      </div>

      {/* PDF seçici (sadece source modda ve henüz mesaj atılmadıysa) */}
      {mode === "source" && messages.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          {!supportsAttachments ? (
            <p className="text-sm text-amber-500">
              Şu anki AI sağlayıcısı PDF gönderimini desteklemiyor. PDF&apos;li ders
              için Gemini gerekir (<code className="rounded bg-muted px-1">GEMINI_API_KEY</code>).
            </p>
          ) : pdfs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bu konuya henüz PDF yüklemedin. Önce{" "}
              <a
                href={`/konular/${topic.id}`}
                className="text-primary hover:underline"
              >
                konu sayfasına git
              </a>{" "}
              ve Kaynaklarım → 📎 Dosya ile PDF yükle. Veya alttaki sohbetten
              serbest mod gibi başlayabilirsin.
            </p>
          ) : (
            <>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Paperclip size={14} className="text-violet-500" />
                Hangi PDF üzerinden ders alalım?
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {pdfs.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-background p-3 transition has-[:checked]:border-violet-500 has-[:checked]:bg-violet-500/5"
                  >
                    <input
                      type="radio"
                      name="pdf-attachment"
                      value={p.id}
                      checked={attachedPdfId === p.id}
                      onChange={() => setAttachedPdfId(p.id)}
                      className="mt-0.5 accent-violet-500"
                    />
                    <div className="flex flex-1 items-start gap-2 min-w-0">
                      <FileText size={14} className="mt-0.5 shrink-0 text-violet-500" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatBytes(p.fileSize)}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Seçimini yaptığında AI PDF'i okuyup dersi onun üzerinden anlatır.
              </p>
            </>
          )}
        </div>
      )}

      {/* Attached PDF göstergesi */}
      {mode === "source" && messages.length > 0 && attachedPdfId && (
        <div className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/5 px-3 py-1.5 text-xs text-violet-500">
          <Paperclip size={12} />
          <span className="font-medium">
            {pdfs.find((p) => p.id === attachedPdfId)?.title ?? "PDF"}
          </span>
          <span className="text-muted-foreground">— derste referans olarak kullanılıyor</span>
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 min-h-[400px]">
        {messages.length === 0 && (
          <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-muted-foreground">
            {aiReady ? "AI bağlanıyor..." : "AI şu an kullanılamıyor."}
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} studentName={student.name} />
        ))}
        {streaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> öğretmen yazıyor...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quiz bölümü */}
      {quiz && (
        <QuizView
          quiz={quiz}
          answers={quizAnswers}
          revealed={quizRevealed}
          onAnswer={(i, val) =>
            setQuizAnswers((a) => ({ ...a, [i]: val }))
          }
          onReveal={() => setQuizRevealed(true)}
        />
      )}

      {/* Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder={aiReady ? "Soru sor, takıldığın yeri yaz..." : "AI bağlandığında aktifleşir"}
            disabled={!aiReady || streaming}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
          />
          <div className="flex flex-col gap-1">
            <MicButton
              lang="tr-TR"
              disabled={!aiReady || streaming}
              onTranscript={(text, isFinal) => {
                setInput(text);
                if (isFinal && text.trim()) void sendMessage(text);
              }}
            />
            <SpeakerToggle on={ttsOn} onChange={setTtsOn} />
          </div>
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={!aiReady || streaming || !input.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Send size={14} /> Gönder
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void startQuiz()}
            disabled={!aiReady || streaming || quizLoading || messages.length < 2}
            className="inline-flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-500 transition hover:bg-violet-500/15 disabled:opacity-50"
          >
            {quizLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Test çözelim (3 soru)
          </button>
          <button
            type="button"
            onClick={() => void sendMessage("Şu ana kadar anlattıklarını özetler misin?", "user")}
            disabled={!aiReady || streaming || messages.length < 2}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted disabled:opacity-50"
          >
            Özetle
          </button>
          <button
            type="button"
            onClick={() => void sendMessage("Bunu daha basit anlatır mısın?", "user")}
            disabled={!aiReady || streaming || messages.length < 2}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted disabled:opacity-50"
          >
            Daha basit
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, studentName }: { message: Message; studentName?: string }) {
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User size={16} />
        </div>
      )}
    </div>
  );
}

function QuizView({
  quiz,
  answers,
  revealed,
  onAnswer,
  onReveal,
}: {
  quiz: Quiz;
  answers: Record<number, string>;
  revealed: boolean;
  onAnswer: (i: number, val: string) => void;
  onReveal: () => void;
}) {
  const correctCount = revealed
    ? quiz.questions.filter((q, i) => answers[i] === q.answer).length
    : 0;
  return (
    <div className="space-y-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap size={16} className="text-violet-500" />
          Quiz
        </h3>
        {revealed && (
          <span className="text-sm font-medium">
            Skor: {correctCount}/{quiz.questions.length}
          </span>
        )}
      </div>

      {quiz.questions.map((q, i) => {
        const userAns = answers[i];
        return (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-sm font-medium">
              {i + 1}. {q.stem}
            </div>
            <div className="grid gap-1.5">
              {Object.entries(q.options).map(([letter, text]) => {
                const isCorrect = revealed && letter === q.answer;
                const isWrongPick =
                  revealed && userAns === letter && letter !== q.answer;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => !revealed && onAnswer(i, letter)}
                    disabled={revealed}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isCorrect
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : isWrongPick
                          ? "border-rose-500/40 bg-rose-500/10"
                          : userAns === letter
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:bg-muted"
                    } disabled:cursor-default`}
                  >
                    <span className="font-semibold">{letter})</span>
                    <span className="flex-1">{text}</span>
                    {isCorrect && <Check size={14} className="text-emerald-500" />}
                    {isWrongPick && <X size={14} className="text-rose-500" />}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Çözüm:</span>{" "}
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!revealed ? (
        <button
          type="button"
          onClick={onReveal}
          disabled={Object.keys(answers).length !== quiz.questions.length}
          className="w-full rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-50"
        >
          Cevapları göster
        </button>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          {correctCount === quiz.questions.length
            ? "Mükemmel! 🎉"
            : "Yanlışlardan ders çıkarmayı unutma."}
        </p>
      )}
    </div>
  );
}

// ---------- yardımcılar ----------

function buildMessagesForServer(
  mode: "free" | "source",
  topic: Topic,
  student: Student,
  history: Message[],
  opts?: { wantQuiz?: boolean; hasAttachment?: boolean },
): { role: "system" | "user" | "assistant"; content: string }[] {
  const sys = buildSystem(mode, topic, student, opts?.hasAttachment ?? false);
  const out: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: sys },
  ];
  for (const m of history) out.push({ role: m.role, content: m.content });
  if (opts?.wantQuiz) {
    out.push({
      role: "user",
      content: `Şimdi ${topic.name} konusundan 3 adet ÖSYM tarzı çoktan seçmeli soru üret. SADECE şu JSON'u dön, başka hiçbir şey yazma:

{"questions":[{"stem":"...","options":{"A":"...","B":"...","C":"...","D":"...","E":"..."},"answer":"C","explanation":"..."}]}`,
    });
  }
  return out;
}

function buildSystem(
  mode: "free" | "source",
  topic: Topic,
  student: Student,
  hasAttachment: boolean,
): string {
  const baseFacts = `Sen Türkiye lise müfredatına göre ${topic.examType} sınavına hazırlanan bir öğrenciye ${topic.name} (${topic.subjectName}${topic.grade ? `, ${topic.grade}. sınıf` : ""}) konusunu öğreten samimi ama disiplinli bir öğretmensin.

Öğrenci: ${student.name ?? "öğrenci"}${student.grade ? `, ${student.grade}. sınıf` : ""}${student.isExamStudent ? ", sınava hazırlanıyor" : ""}.

Kurallar:
- Sade, net Türkçe.
- Bir defada çok şey yığma; bir blok anlat, kısa örnek ver, "anladın mı?" diye sor.
- Matematik için LaTeX değil, düz semboller (x², √, ≤).
- Öğrenci takıldıkça basitleştir.
- Konuyu bitirdiğinde "Test çözelim mi?" diye sor.`;

  if (mode === "source") {
    if (hasAttachment) {
      return `${baseFacts}

Ders modu: KAYNAK DESTEKLİ. Mesajın başında öğrencinin kendi yüklediği bir PDF eklendi (ders notu/kitap parçası). Bu PDF'in içeriğini referans olarak kullan:
- Önce PDF'in içeriğini kısaca özetle (1-2 cümle): "Bu notlar [konu]'yu şu açıdan anlatıyor..."
- Sonra adım adım konuyu PDF'teki sıraya göre anlat.
- Bilgi PDF'de yoksa "PDF'de bu kısım yok ama..." diye netleştirip kendi bilgini ekle.
- PDF'teki spesifik örnekleri/sayıları kullan, alıntı yap.
- Konu bittiğinde "Test çözelim mi?" diye sor; testte PDF'teki örneklere benzer sorular üret.`;
    }
    return `${baseFacts}

Ders modu: KAYNAK DESTEKLİ ama henüz PDF eklenmedi. Önce öğrenciden konuya bir PDF yüklemesini ya da SERBEST moda geçmesini öner. Yine de istiyorsa konuyu kendi bilginle anlatmaya başlayabilirsin.`;
  }
  return `${baseFacts}

Ders modu: SERBEST. Kendi bilginle anlat. Yapı: (1) konu nedir, neden önemli (2) temel kavramlar tek tek örnekli (3) formüller/teknikler (4) tuzaklar/çıkmış kalıplar (5) "Test çözelim mi?".`;
}

function parseQuiz(text: string): Quiz | null {
  // JSON'u içeren kısmı yakala
  const match = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    if (!obj.questions || !Array.isArray(obj.questions)) return null;
    return obj as Quiz;
  } catch {
    return null;
  }
}
