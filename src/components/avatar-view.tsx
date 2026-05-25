"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

// Yuvarlak avatar; fotoğraf varsa tıklayınca tam ekran büyütür (lightbox).
export function AvatarView({
  src,
  name,
  size = 32,
  className = "",
  ring = false,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const initial = (name ?? "?").slice(0, 1).toLocaleUpperCase("tr-TR");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => src && setOpen(true)}
        disabled={!src}
        aria-label={src ? "Fotoğrafı büyüt" : undefined}
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground ${
          src ? "cursor-zoom-in transition hover:opacity-90" : ""
        } ${ring ? "ring-2 ring-primary/30" : ""} ${className}`}
        style={{ height: size, width: size }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name ?? "Profil"} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && src && (
        <div
          className="animate-fade-in fixed inset-0 z-[80] flex items-center justify-center bg-foreground/70 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Kapat"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/80 text-foreground shadow-soft backdrop-blur transition hover:bg-card"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={name ?? "Profil"}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-pop"
          />
          {name && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-card/80 px-4 py-1.5 text-sm font-medium backdrop-blur">
              {name}
            </span>
          )}
        </div>
      )}
    </>
  );
}
