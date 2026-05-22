"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

// Çevrimdışı olunca alt köşede bilgi şeridi, çevrimiçi olunca kısa onay.
export function OnlineStatus() {
  const [online, setOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);

    const goOffline = () => setOnline(false);
    const goOnline = () => {
      setOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 2500);
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (online && !justReconnected) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium text-white transition ${
        online ? "bg-emerald-600" : "bg-zinc-800"
      }`}
      role="status"
    >
      {online ? (
        <>
          <Wifi size={14} /> Yeniden çevrimiçisin
        </>
      ) : (
        <>
          <WifiOff size={14} /> Çevrimdışısın — kayıtlı içerik çalışır, AI ve canlı
          veriler için bağlantı gerekir
        </>
      )}
    </div>
  );
}
