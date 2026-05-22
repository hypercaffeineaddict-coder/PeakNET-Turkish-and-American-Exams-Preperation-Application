"use client";

import { useEffect } from "react";

// Service worker'ı yalnızca production'da kaydeder (dev'de stale cache olmasın).
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Güncelleme varsa yeni SW'yi devreye al
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            if (!sw) return;
            sw.addEventListener("statechange", () => {
              if (sw.state === "installed" && navigator.serviceWorker.controller) {
                sw.postMessage("SKIP_WAITING");
              }
            });
          });
        })
        .catch(() => {
          // sessizce yut — SW kritik değil
        });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
