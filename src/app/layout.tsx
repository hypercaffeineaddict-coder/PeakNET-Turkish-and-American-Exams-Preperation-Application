import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SwRegister } from "@/components/sw-register";
import { OnlineStatus } from "@/components/online-status";
import "./globals.css";

export const metadata: Metadata = {
  title: "PeakNET — YKS çalışma platformu",
  description:
    "YKS için akıllı çalışma platformu: konu takibi, AI öğretmen, Pomodoro, deneme analizi, yanlış defteri.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PeakNET",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <OnlineStatus />
          <SwRegister />
          <Toaster
            position="top-center"
            theme="system"
            richColors
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
