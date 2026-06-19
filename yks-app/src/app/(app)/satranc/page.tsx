import { Crown } from "lucide-react";
import { ChessClient } from "./chess-client";

export const metadata = { title: "Satranç · PeakNET" };

export default function SatrancPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Crown className="text-primary" size={26} />
          Satranç
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mola ver, zihnini aç. Yapay zekaya karşı oyna — gücü ELO kaydırıcısıyla
          ayarlanabilir. Beynini taktik ve planlamada çalıştırır.
        </p>
      </header>

      <ChessClient />
    </div>
  );
}
