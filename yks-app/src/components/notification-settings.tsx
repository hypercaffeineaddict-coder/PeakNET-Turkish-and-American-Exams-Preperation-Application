"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { getDict } from "@/lib/i18n";

type Labels = ReturnType<typeof getDict>["notifications"];

const VAPID = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "").trim();

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function NotificationSettings({ labels }: { labels: Labels }) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);
    if (!ok) {
      setReady(true);
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      if (!VAPID) {
        toast.error(labels.errorVapid);
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error(labels.errorDenied);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error((await res.text()).slice(0, 120));
      setEnabled(true);
      toast.success(labels.successEnable);
    } catch (e) {
      toast.error(labels.errorEnablePrefix + String(e).slice(0, 120));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEnabled(false);
      toast.success(labels.successDisable);
    } catch (e) {
      toast.error(labels.errorDisablePrefix + String(e).slice(0, 120));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <header className="flex items-center gap-2 text-sm font-semibold">
        <Bell size={16} className="text-primary" />
        {labels.title}
      </header>
      <p className="mt-1.5 text-sm text-muted-foreground">{labels.subtitle}</p>

      <div className="mt-4">
        {!ready ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> {labels.checking}
          </div>
        ) : !supported ? (
          <p className="rounded-xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
            {labels.unsupported}
          </p>
        ) : !VAPID ? (
          <p className="rounded-xl bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-600 dark:text-amber-400">
            {labels.vapidMissing}
          </p>
        ) : enabled ? (
          <button
            type="button"
            onClick={disable}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <BellOff size={15} />}
            {labels.disable}
          </button>
        ) : (
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
            {labels.enable}
          </button>
        )}
      </div>
    </section>
  );
}
