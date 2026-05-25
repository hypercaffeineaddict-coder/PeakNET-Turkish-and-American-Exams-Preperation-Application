import webpush from "web-push";

// Web Push yapılandırması. VAPID anahtarları env'de yoksa sistem "kapalı"
// kalır (hata vermez) — kullanıcı anahtarları ekleyince otomatik aktifleşir.
const PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:peaknet@example.com";

let configured = false;

export function isPushConfigured(): boolean {
  if (configured) return true;
  if (!PUBLIC || !PRIVATE) return false;
  try {
    webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);
    configured = true;
    return true;
  } catch {
    return false;
  }
}

export type PushSub = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type SendResult = { ok: boolean; gone: boolean };

// Tek bir aboneliğe bildirim gönder. gone=true ise abonelik ölü (silinmeli).
export async function sendPush(
  sub: PushSub,
  payload: Record<string, unknown>,
): Promise<SendResult> {
  if (!isPushConfigured()) return { ok: false, gone: false };
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    return { ok: true, gone: false };
  } catch (err) {
    const code = (err as { statusCode?: number })?.statusCode;
    return { ok: false, gone: code === 404 || code === 410 };
  }
}
