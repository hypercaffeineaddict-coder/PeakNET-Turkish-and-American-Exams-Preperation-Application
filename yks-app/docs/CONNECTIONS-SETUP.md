# Connections setup — Google · Spotify · Web Push

PeakNET's external integrations all degrade gracefully when not configured (the buttons hide themselves or show a clear "not configured" hint), so the app keeps working even without these. Use this checklist to turn each on.

---

## 1. Google sign-in (OAuth via Supabase)

**No app env vars needed** — Google credentials live in Supabase, not in this repo.

1. **Google Cloud Console** → "APIs & Services" → "Credentials" → **Create OAuth 2.0 Client ID** (type: Web application).
2. **Authorized redirect URIs** — add **only** the Supabase callback URL (Supabase forwards to your app afterwards):
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```
   (Your local app and prod domain do **not** go here. Don't add `localhost:3000/auth/callback`.)
3. Copy the Client ID and Client Secret.
4. **Supabase Dashboard** → Authentication → Providers → **Google** → toggle on → paste Client ID + Secret → Save.
5. **Supabase Dashboard** → Authentication → URL Configuration:
   - `Site URL`: your production domain, e.g. `https://yks-app-seven.vercel.app`
   - `Redirect URLs`: add your prod domain and `http://localhost:3000` (so dev login works too)

**How the app detects this is on:** `GoogleButton` probes the Supabase `authorize?provider=google` endpoint on mount. If Supabase responds with a redirect, the button shows. If it responds with "not enabled," the button hides itself silently — no broken UX.

**Common failures:**
- `redirect_uri_mismatch` → the redirect URI in Google Cloud doesn't exactly match `https://<project>.supabase.co/auth/v1/callback` (trailing slash, http vs https, wrong subdomain).
- Button stays hidden in prod → provider not actually toggled on in Supabase, or `NEXT_PUBLIC_SUPABASE_URL` env missing in Vercel.
- "Refused to connect" in popup → `Site URL` in Supabase Auth → URL Configuration doesn't include the domain you're logging in from.

---

## 2. Spotify focus player (`/muzik`)

Needs **one public env var** (Client ID — no secret, PKCE flow):
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=...
```

1. **Spotify Developer Dashboard** → "Create app".
2. **Redirect URI** — add **both**:
   ```
   http://localhost:3000/muzik
   https://<your-prod-domain>/muzik
   ```
3. **Web API** + **Web Playback SDK** — enable both (Settings → APIs used).
4. Copy the **Client ID** (NOT secret — PKCE doesn't need it). Paste into:
   - Local: `.env.local` → `NEXT_PUBLIC_SPOTIFY_CLIENT_ID=...`
   - Vercel: Project Settings → Environment Variables.
5. Redeploy.

**Development-mode user limit:** Spotify apps start in "Development mode" capped at **25 explicitly invited users** (Spotify Dashboard → Users and Access → Add user by email). Beyond that, request **"Extended Quota Mode"** in the Spotify dashboard — Spotify reviews it (~1–2 weeks).

**How the app handles unconfigured state:** the `/muzik` page checks `process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID` server-side and shows a friendly amber "Spotify yapılandırılmadı" card instead of a broken button.

**Premium vs free:** Web Playback SDK requires Premium. Free users still get 30-second preview playback. The app auto-falls back when `account_error` fires from the SDK.

**Common failures:**
- "Invalid redirect URI" → not added in Spotify dashboard (must match exactly, including protocol).
- 403 on `/me/player/play` → user is not Premium (expected; preview mode kicks in).
- 401 on every call → token expired and refresh failed. Click "Bağlantıyı kes" and re-connect.

---

## 3. Web Push reminders (daily streak nudge)

Needs **5 env vars** to fully activate:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
SUPABASE_SERVICE_ROLE_KEY=...   # Supabase → Settings → API (keep secret)
CRON_SECRET=...                  # any random ~32-char string
```

1. **Generate VAPID keys** (one-time):
   ```bash
   npx web-push generate-vapid-keys
   ```
   Save the public key as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (public, ships to browser) and private key as `VAPID_PRIVATE_KEY` (server only).
2. **VAPID_SUBJECT** — a `mailto:` URL the browser shows during push debugging. Doesn't need to be reachable.
3. **SUPABASE_SERVICE_ROLE_KEY** — Supabase Dashboard → Settings → API → "service_role" key. Used **only** by `/api/push/send-reminders` to bypass RLS when reading who hasn't studied today. **Never expose this to the browser.**
4. **CRON_SECRET** — generate any strong random string. The cron route uses it via timing-safe equals.
5. **Vercel cron** — already wired in `vercel.json`:
   ```json
   { "crons": [{ "path": "/api/push/send-reminders", "schedule": "0 18 * * *" }] }
   ```
   Runs daily at 18:00 UTC. Vercel automatically calls the path; protect it by setting `CRON_SECRET` in Vercel and verifying the `Authorization: Bearer <secret>` header.

**Migration:** Run `supabase/migrations/0014_push_subscriptions.sql` (already bundled in `RUN_pending_0014_0018.sql`).

**How the app handles missing env:** every push code path checks `VAPID_PUBLIC_KEY` first; if missing, the Settings UI shows "Bildirim altyapısı kurulu; sunucuda VAPID anahtarı tanımlanınca aktifleşir." Nothing crashes.

**Common failures:**
- "Notification permission denied" → browser-level user action; nothing the server can fix.
- iOS Safari → push only works after the user has installed the PWA to home screen (a system constraint, not a bug).
- Cron returns 401 → `CRON_SECRET` header missing/mismatched. In Vercel, the cron job sends `Authorization: Bearer <CRON_SECRET>` automatically when the env is set.

---

## Quick verify checklist

After deploying with all three configured:

- [ ] Open `/login` in an incognito tab → "Google ile giriş yap" button is visible.
- [ ] Sign in with Google → lands on `/dashboard` (first time → `/onboarding`).
- [ ] Visit `/muzik` → the green "Spotify ile bağlan" button is visible (no amber warning card).
- [ ] Open `/ayarlar` → "Bildirimleri aç" button is visible (no amber warning card).
- [ ] Click "Bildirimleri aç" → browser permission prompt → success toast → entry appears in `push_subscriptions` Supabase table.
- [ ] On the next day at 18:00 UTC, if you haven't studied today, your device receives the daily nudge.

---

## What this app does NOT do

- **No third-party analytics / tracking SDKs** — by design.
- **No payment integration** — PeakNET is free.
- **No social login other than Google + email/password** — Apple/Microsoft can be added via Supabase but are not wired in the UI.
