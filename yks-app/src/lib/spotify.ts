// Spotify PKCE (client-side) — client secret GEREKMEZ, sadece public Client ID.
// Token'lar localStorage'da tutulur (kullanıcının kendi hesabı, kendi cihazı).

export const SPOTIFY_CLIENT_ID = (process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "").trim();
export const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
].join(" ");

const TOKEN_KEY = "spotify_token";
const VERIFIER_KEY = "spotify_verifier";
const STATE_KEY = "spotify_state";

type TokenData = { access_token: string; refresh_token?: string; expires_at: number };

function redirectUri(): string {
  return `${window.location.origin}/muzik`;
}

function base64url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomString(len: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

export async function beginSpotifyAuth() {
  if (!SPOTIFY_CLIENT_ID) {
    alert("Spotify Client ID tanımlı değil (NEXT_PUBLIC_SPOTIFY_CLIENT_ID).");
    return;
  }
  const verifier = randomString(64);
  localStorage.setItem(VERIFIER_KEY, verifier);
  const challenge = base64url(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
  );
  const state = randomString(16);
  localStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: SPOTIFY_SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

// Dönüşte state doğrula (CSRF). Tek kullanımlık — okunca silinir.
export function consumeState(returned: string | null): boolean {
  const saved = localStorage.getItem(STATE_KEY);
  localStorage.removeItem(STATE_KEY);
  return !!saved && saved === returned;
}

export async function exchangeCode(code: string): Promise<boolean> {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) return false;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  });
  if (!res.ok) return false;
  const d = await res.json();
  saveToken(d);
  localStorage.removeItem(VERIFIER_KEY);
  return true;
}

function saveToken(d: { access_token: string; refresh_token?: string; expires_in: number }) {
  const data: TokenData = {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expires_at: Date.now() + (d.expires_in - 60) * 1000,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
}

function readToken(): TokenData | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as TokenData) : null;
  } catch {
    return null;
  }
}

export function isConnected(): boolean {
  return !!readToken();
}

export function disconnectSpotify() {
  localStorage.removeItem(TOKEN_KEY);
}

async function refresh(token: TokenData): Promise<string | null> {
  if (!token.refresh_token) return null;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
    }),
  });
  if (!res.ok) return null;
  const d = await res.json();
  // refresh yanıtı refresh_token döndürmeyebilir → eskisini koru
  saveToken({ ...d, refresh_token: d.refresh_token ?? token.refresh_token });
  return d.access_token as string;
}

// Geçerli access token (gerekirse yeniler)
export async function getAccessToken(): Promise<string | null> {
  const t = readToken();
  if (!t) return null;
  if (Date.now() < t.expires_at) return t.access_token;
  return refresh(t);
}

// Spotify Web API yardımcı
export async function spotifyApi<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return null;
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export type SpotifyTrack = {
  id: string;
  uri: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
  external_urls: { spotify: string };
};
