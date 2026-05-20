"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { addResource, uploadFileResource } from "./actions";
import { kindMeta, type ResourceKind } from "@/lib/resources";

const kinds: ResourceKind[] = ["video", "link", "note", "test", "book", "file"];

export function ResourceForm({ topicId }: { topicId: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ResourceKind>("link");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
      >
        <Plus size={14} />
        Kaynak ekle
      </button>
    );
  }

  const needsUrl = kind === "video" || kind === "link" || kind === "book";
  const needsContent = kind === "note" || kind === "test";
  const needsFile = kind === "file";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Yeni kaynak ekle</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {kinds.map((k) => {
          const meta = kindMeta[k];
          const isActive = kind === k;
          return (
            <button
              type="button"
              key={k}
              onClick={() => {
                setKind(k);
                setError(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                isActive
                  ? `border-transparent ${meta.bg} ${meta.color}`
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{meta.emoji}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      <form
        ref={formRef}
        action={(fd) =>
          startTransition(async () => {
            setError(null);
            if (needsFile) {
              const res = await uploadFileResource(fd);
              if (res?.error) {
                setError(res.error);
                toast.error(res.error);
                return;
              }
            } else {
              await addResource(fd);
            }
            toast.success("Kaynak eklendi");
            setOpen(false);
            setKind("link");
            formRef.current?.reset();
          })
        }
        className="space-y-3"
      >
        <input type="hidden" name="topic_id" value={topicId} />
        {!needsFile && <input type="hidden" name="kind" value={kind} />}

        <input
          name="title"
          required
          placeholder={
            kind === "video"
              ? "Örn. Tonguç - Polinomlar konu anlatımı"
              : kind === "book"
                ? "Örn. Karekök Matematik AYT"
                : kind === "test"
                  ? "Örn. Polinom çarpanlara ayırma çalışma"
                  : kind === "note"
                    ? "Not başlığı"
                    : kind === "file"
                      ? "Dosya başlığı (örn. Polinom konu özeti)"
                      : "Bağlantı başlığı"
          }
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />

        {needsUrl && (
          <input
            name="url"
            type="url"
            required={needsUrl}
            placeholder={
              kind === "video"
                ? "https://youtube.com/watch?v=..."
                : "https://..."
            }
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        )}

        {needsContent && (
          <textarea
            name="content"
            required={needsContent}
            rows={5}
            placeholder={
              kind === "test"
                ? "Test sorusu veya çalışma metni..."
                : "Not içeriği..."
            }
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        )}

        {needsFile && (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground">
            <Upload size={16} />
            <span>
              <span className="text-foreground font-medium">Dosya seç</span> veya
              buraya sürükle (PDF, DOCX, PNG, JPG · max 50 MB)
            </span>
            <input
              type="file"
              name="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,application/pdf,image/png,image/jpeg,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
            />
          </label>
        )}

        <input
          name="description"
          placeholder="Kısa açıklama (opsiyonel)"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />

        {error && (
          <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm transition hover:bg-muted"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Ekle
          </button>
        </div>
      </form>
    </div>
  );
}
