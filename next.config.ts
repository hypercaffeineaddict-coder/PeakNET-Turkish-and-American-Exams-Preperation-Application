import type { NextConfig } from "next";

// Güvenlik başlıkları — clickjacking, MIME sniffing, referrer/feature leak,
// HSTS ve CSP. CSP'yi orta sıkı tuttuk (Spotify SDK, Supabase, Gemini API
// (sunucu tarafı), YouTube thumbnail'leri ve next/font'u bozmamak için).
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseHost = (() => {
  try {
    return SUPABASE_URL ? new URL(SUPABASE_URL).host : "*.supabase.co";
  } catch {
    return "*.supabase.co";
  }
})();

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
  "https://sdk.scdn.co",
  "https://open.spotifycdn.com",
].join(" ");

const csp = [
  // default-src kısıtlı; her tür için özel allow listesi.
  `default-src 'self'`,
  // Next.js client bundle inline init script + Spotify Web Playback SDK.
  `script-src ${scriptSrc}`,
  // Tailwind v4 inline style + React jsx-runtime için unsafe-inline gerekli.
  `style-src 'self' 'unsafe-inline'`,
  // Görseller: data URL (avatar/banner DB'de), blob (önizleme),
  // Supabase storage, YouTube/Google thumbnail, Spotify CDN.
  `img-src 'self' data: blob: https://${supabaseHost} https://i.ytimg.com https://img.youtube.com https://www.google.com https://i.scdn.co https://mosaic.scdn.co`,
  // Fontlar (Geist + Space Grotesk Google) ve data: (gömülü base64).
  `font-src 'self' data: https://fonts.gstatic.com`,
  // XHR/fetch: kendi origin, Supabase REST + realtime, Spotify Web API.
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.spotify.com https://accounts.spotify.com https://*.spotify.com`,
  // Service worker scriptleri
  `worker-src 'self' blob:`,
  // Tıklama hırsızlığı koruması
  `frame-ancestors 'none'`,
  // Form yalnız aynı kökene
  `form-action 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(self), microphone=(self), geolocation=(), interest-cohort=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "www.google.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
