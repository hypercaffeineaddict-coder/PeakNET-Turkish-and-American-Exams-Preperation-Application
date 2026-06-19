import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { isPushConfigured, sendPush, type PushSub } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zaman saldırılarına karşı sabit-süreli karşılaştırma.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Günlük cron: streak'i CANLI ama bugün çalışmamış (dün çalışmış) kullanıcılara
// "serin tehlikede" hatırlatması gönderir. Vercel Cron tetikler.
// Korumalar: CRON_SECRET + service role + VAPID anahtarları yoksa no-op.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (!safeEqual(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !isPushConfigured()) {
    return NextResponse.json(
      { error: "push not configured (service role / VAPID missing)" },
      { status: 503 },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // "Dün" (UTC) — streak canlı ama bugün çalışılmamış demek.
  const now = new Date();
  const y = new Date(now);
  y.setUTCDate(y.getUTCDate() - 1);
  const yStr = y.toISOString().slice(0, 10);

  const { data: atRisk, error: streakErr } = await admin
    .from("streaks")
    .select("user_id, current_streak, last_study_date")
    .gt("current_streak", 0)
    .eq("last_study_date", yStr);
  if (streakErr) {
    return NextResponse.json({ error: streakErr.message }, { status: 500 });
  }

  const userIds = (atRisk ?? []).map((s) => s.user_id);
  if (userIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, candidates: 0 });
  }
  const streakByUser = new Map(
    (atRisk ?? []).map((s) => [s.user_id, s.current_streak as number]),
  );

  const { data: subs, error: subErr } = await admin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);
  if (subErr) {
    return NextResponse.json({ error: subErr.message }, { status: 500 });
  }

  let sent = 0;
  const deadIds: string[] = [];
  for (const s of subs ?? []) {
    const streak = streakByUser.get(s.user_id) ?? 0;
    const sub: PushSub = {
      endpoint: s.endpoint as string,
      keys: { p256dh: s.p256dh as string, auth: s.auth as string },
    };
    const payload = {
      title: `${streak} günlük serin tehlikede`,
      body: "Bugün henüz çalışmadın. Kısa bir Pomodoro serini kurtarır.",
      url: "/pomodoro",
      tag: "streak-reminder",
    };
    const res = await sendPush(sub, payload);
    if (res.ok) sent++;
    else if (res.gone) deadIds.push(s.id as string);
  }

  // Ölü abonelikleri temizle.
  if (deadIds.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", deadIds);
  }

  return NextResponse.json({
    ok: true,
    candidates: userIds.length,
    subscriptions: subs?.length ?? 0,
    sent,
    pruned: deadIds.length,
  });
}
