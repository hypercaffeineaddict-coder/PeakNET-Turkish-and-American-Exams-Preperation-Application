"use client";

import { useEffect, useState } from "react";
import { CloudDownload, Trash2, WifiOff, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Offline'da kullanilabilir olmasi istenen ana sayfalar (dinamik [id] sayfalari haric)
const ROUTES = [
  "/dashboard",
  "/panel",
  "/konular",
  "/ustalik",
  "/pomodoro",
  "/denemeler",
  "/yanlislar",
  "/coz",
  "/tarama",
  "/araclar",
  "/istatistikler",
  "/basarimlar",
  "/asistan",
  "/diller",
  "/ayarlar",
];

const PAGE_CACHE = "peaknet-v1-pages";

export function OfflineSettings() {
  const [swReady, setSwReady] = useState<boolean | null>(null);
  const [cachedCount, setCachedCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  async function refreshStatus() {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      setSwReady(false);
      return;
    }
    setSwReady(!!navigator.serviceWorker.controller);
    if (typeof caches !== "undefined") {
      try {
        const c = await caches.open(PAGE_CACHE);
        const keys = await c.keys();
        // Yalnizca sayfa (HTML) girislerini say — RSC'leri haric tut
        const pages = keys.filter((r) => !r.url.includes("_rsc"));
        setCachedCount(pages.length);
      } catch {
        setCachedCount(null);
      }
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  async function prepareOffline() {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      toast.error(
        "Çevrimdışı önbellek için uygulamayı bir kez normal açman gerekir (service worker aktif değil).",
      );
      return;
    }
    setBusy(true);
    setProgress(0);
    let ok = 0;
    for (const route of ROUTES) {
      try {
        const res = await fetch(route, { credentials: "include", cache: "reload" });
        if (res.ok) ok++;
      } catch {
        // offline veya hata — atla
      }
      setProgress((p) => p + 1);
    }
    setBusy(false);
    await refreshStatus();
    toast.success(`${ok}/${ROUTES.length} sayfa çevrimdışı için indirildi.`);
  }

  async function clearCache() {
    if (typeof caches === "undefined") return;
    try {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.includes("-pages")).map((k) => caches.delete(k)),
      );
      await refreshStatus();
      toast.success("Çevrimdışı sayfa önbelleği temizlendi.");
    } catch {
      toast.error("Önbellek temizlenemedi.");
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <WifiOff size={18} className="text-primary" />
        <h2 className="text-lg font-semibold">Çevrimdışı kullanım</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Ana sayfaları önceden indir; internet olmadan da açılsınlar. AI ve canlı
        veriler için bağlantı gerekir.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5">
          {swReady ? (
            <CheckCircle2 size={15} className="text-emerald-500" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          )}
          <span className="text-muted-foreground">
            {swReady === null
              ? "Durum kontrol ediliyor…"
              : swReady
                ? "Çevrimdışı destek aktif"
                : "Çevrimdışı destek henüz hazır değil (sayfayı yenile)"}
          </span>
        </span>
        {cachedCount != null && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {cachedCount} sayfa hazır
          </span>
        )}
      </div>

      {busy && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(progress / ROUTES.length) * 100}%` }}
            />
          </div>
          <div className="mt-1.5 text-xs text-muted-foreground">
            İndiriliyor… {progress}/{ROUTES.length}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={prepareOffline}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CloudDownload size={15} />
          )}
          {busy ? "İndiriliyor…" : "Offline'a hazırla"}
        </button>
        <button
          type="button"
          onClick={clearCache}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <Trash2 size={15} />
          Önbelleği temizle
        </button>
      </div>
    </section>
  );
}
