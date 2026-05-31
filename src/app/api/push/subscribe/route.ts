import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Tarayıcı push aboneliğini kaydet (kullanıcıya bağlı).
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const endpoint: unknown = body?.endpoint;
  const p256dh: unknown = body?.keys?.p256dh;
  const auth: unknown = body?.keys?.auth;
  // Tip ve format kontrolleri
  if (
    typeof endpoint !== "string" ||
    typeof p256dh !== "string" ||
    typeof auth !== "string"
  ) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }
  if (endpoint.length > 600 || p256dh.length > 200 || auth.length > 200) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }
  // Endpoint sadece push servis sağlayıcı host'larından olmalı.
  let endpointHost = "";
  try {
    const u = new URL(endpoint);
    if (u.protocol !== "https:") throw new Error("not https");
    endpointHost = u.host;
  } catch {
    return NextResponse.json({ error: "invalid endpoint" }, { status: 400 });
  }
  const PUSH_HOSTS = /(\.googleapis\.com|\.mozilla\.com|\.windows\.com|\.apple\.com|\.live\.com|\.notify\.live\.net)$/i;
  if (!PUSH_HOSTS.test(endpointHost)) {
    return NextResponse.json({ error: "unknown push provider" }, { status: 400 });
  }
  // Base64url benzeri karakterler
  const B64 = /^[A-Za-z0-9_\-=]+$/;
  if (!B64.test(p256dh) || !B64.test(auth)) {
    return NextResponse.json({ error: "invalid key encoding" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent")?.slice(0, 300) ?? null;
  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint, p256dh, auth, user_agent: ua },
    { onConflict: "endpoint" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Aboneliği sil (bildirimleri kapat).
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const endpoint: unknown = body?.endpoint;
  if (typeof endpoint !== "string" || endpoint.length > 600) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
