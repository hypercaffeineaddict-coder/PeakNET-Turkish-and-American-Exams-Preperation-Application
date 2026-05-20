"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Loader2,
  Camera,
  Sparkles,
  X,
  BookOpen,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { saveSolutionAsMistake } from "./actions";

type Subject = {
  id: string;
  name: string;
  topics: { id: string; name: string; display_order: number }[];
};

export function SolveClient({
  subjects,
  aiReady,
}: {
  subjects: Subject[];
  aiReady: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [userNote, setUserNote] = useState("");
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMistake, setSavedMistake] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function chooseFile(f: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
    setSolution("");
    setError(null);
    setSavedMistake(false);
  }

  function reset() {
    chooseFile(null);
    setSolution("");
    setError(null);
    setSavedMistake(false);
  }

  async function solve() {
    if (!file) return;
    setSolving(true);
    setSolution("");
    setError(null);
    setSavedMistake(false);
    try {
      const fd = new FormData();
      fd.set("image", file);
      if (topicId) fd.set("topic_id", topicId);
      else if (subjectId) {
        const subj = subjects.find((s) => s.id === subjectId);
        if (subj) fd.set("subject_hint", subj.name);
      }
      if (userNote.trim()) fd.set("user_note", userNote.trim());

      const res = await fetch("/api/ai/solve", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        setError((await res.text()).slice(0, 300) || `HTTP ${res.status}`);
        return;
      }
      const text = await res.text();
      setSolution(text);
    } catch (err) {
      setError(String(err));
    } finally {
      setSolving(false);
    }
  }

  async function saveAsMistake() {
    if (!solution) return;
    setSaving(true);
    try {
      const fd = new FormData();
      if (topicId) fd.set("topic_id", topicId);
      // Soru metni: kullanıcı notu + "Görsel soru" işareti
      const qText = userNote
        ? `${userNote}\n\n[Görsel soru — ${file?.name ?? "yüklenen"}]`
        : `[Görsel soru — ${file?.name ?? "yüklenen"}]`;
      fd.set("question_text", qText);
      fd.set("reason", solution.slice(0, 2000));
      const result = await saveSolutionAsMistake(fd);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setSavedMistake(true);
        toast.success("Yanlış defterine eklendi");
      }
    } finally {
      setSaving(false);
    }
  }

  const topics = subjects.find((s) => s.id === subjectId)?.topics ?? [];

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!file ? (
        <div
          className="rounded-2xl border-2 border-dashed border-border bg-card p-8 transition hover:border-primary/40"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-primary/60");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("border-primary/60");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-primary/60");
            const f = e.dataTransfer.files[0];
            if (f && f.type.startsWith("image/")) chooseFile(f);
          }}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Camera size={26} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Soru fotoğrafı yükle</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sürükle bırak, dosya seç, veya telefondan çek.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={!aiReady}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                <Upload size={14} />
                Dosya seç
              </button>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                disabled={!aiReady}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm transition hover:bg-muted disabled:opacity-50"
              >
                <Camera size={14} />
                Kameradan çek
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              PNG / JPG / WebP · max 8 MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          {/* Preview */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Soru"
                  className="max-h-[480px] w-full object-contain bg-black/10"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs transition hover:bg-muted"
              >
                <X size={12} />
                Başka soru
              </button>
              <span className="text-xs text-muted-foreground">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="text-muted-foreground">Ders (opsiyonel)</span>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setTopicId("");
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">— Seçme</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-muted-foreground">Konu (opsiyonel)</span>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={!subjectId}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                >
                  <option value="">— Seçme</option>
                  {topics
                    .slice()
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-muted-foreground">
                Notun (opsiyonel) — nerede takıldın?
              </span>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                rows={3}
                placeholder="Örn. İkinci adımda neden π/4 kullanıyoruz anlayamadım..."
                className="mt-1 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>

            <button
              type="button"
              onClick={solve}
              disabled={!aiReady || solving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {solving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {solving ? "AI çözüyor..." : "Soruyu çöz"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {error}
        </div>
      )}

      {/* Solution */}
      {solution && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Sparkles size={16} className="text-primary" />
              Çözüm
            </h2>
            <div className="flex items-center gap-2">
              {savedMistake ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500">
                  <Check size={12} />
                  Yanlış defterine eklendi
                </span>
              ) : (
                <button
                  type="button"
                  onClick={saveAsMistake}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-xs font-medium text-amber-500 transition hover:bg-amber-500/10 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <BookOpen size={12} />
                  )}
                  Yanlış defterime ekle
                </button>
              )}
            </div>
          </header>
          <article className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {solution}
          </article>
        </section>
      )}
    </div>
  );
}
