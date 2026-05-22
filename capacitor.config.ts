import type { CapacitorConfig } from "@capacitor/cli";

// PeakNET Android kabugu — "remote URL" modu.
// Uygulama canli Vercel sitesini yukler; SSR/auth/AI sunucuda calisir,
// service worker webview icinde offline cache saglar.
const config: CapacitorConfig = {
  appId: "com.peaknet.app",
  appName: "PeakNET",
  webDir: "capacitor-www",
  server: {
    url: "https://yks-app-seven.vercel.app",
    androidScheme: "https",
    cleartext: false,
    // Webview icinde gezilebilecek alan adlari
    allowNavigation: [
      "yks-app-seven.vercel.app",
      "*.supabase.co",
    ],
  },
  android: {
    backgroundColor: "#0a0a0b",
  },
};

export default config;
