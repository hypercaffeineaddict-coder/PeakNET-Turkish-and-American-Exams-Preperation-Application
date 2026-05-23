"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed";

// PWA "uygulamayı yükle" istemi — beforeinstallprompt'ı yakalar, şık bir
// banner gösterir. Reddedilirse bir daha gösterilmez (localStorage).
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {}
    // Zaten standalone (yüklü) çalışıyorsa gösterme
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setShow(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show || !evt) return null;

  async function install() {
    if (!evt) return;
    try {
      await evt.prompt();
      await evt.userChoice;
    } catch {}
    setShow(false);
    setEvt(null);
  }

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[55] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl shadow-primary/10 backdrop-blur lg:left-auto lg:right-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Download size={18} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">PeakNET&apos;i yükle</div>
        <div className="text-xs text-muted-foreground">
          Ana ekrana ekle — daha hızlı aç, çevrimdışı çalış.
        </div>
      </div>
      <button
        type="button"
        onClick={install}
        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
      >
        Yükle
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Kapat"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X size={16} />
      </button>
    </div>
  );
}
