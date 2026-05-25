"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const W = 1080;
const H = 1350;

function fmtHours(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h}s ${m}dk`;
  return `${m}dk`;
}

export function PaylasClient({
  name,
  weekMinutes,
  streak,
  longest,
  level,
  net,
  daysToExam,
}: {
  name: string;
  weekMinutes: number;
  streak: number;
  longest: number;
  level: number;
  net: number | null;
  daysToExam: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Arka plan
    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(0, 0, W, H);
    const g1 = ctx.createRadialGradient(180, 160, 0, 180, 160, 700);
    g1.addColorStop(0, "rgba(99,102,241,0.35)");
    g1.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W - 120, H - 200, 0, W - 120, H - 200, 700);
    g2.addColorStop(0, "rgba(249,115,22,0.30)");
    g2.addColorStop(1, "rgba(249,115,22,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    ctx.textAlign = "center";

    // Logo
    ctx.textAlign = "left";
    ctx.font = "700 46px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Peak", 80, 110);
    const pw = ctx.measureText("Peak").width;
    ctx.fillStyle = "#818cf8";
    ctx.fillText("NET", 80 + pw, 110);

    // Üst etiket
    ctx.textAlign = "right";
    ctx.font = "600 26px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("BU HAFTA", W - 80, 105);

    // İsim
    ctx.textAlign = "left";
    ctx.font = "600 34px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#e4e4e7";
    ctx.fillText(name, 80, 200);

    // Büyük hero: haftalık çalışma
    ctx.textAlign = "center";
    ctx.font = "800 150px ui-sans-serif, system-ui, sans-serif";
    const grad = ctx.createLinearGradient(0, 280, W, 460);
    grad.addColorStop(0, "#a5b4fc");
    grad.addColorStop(1, "#fb923c");
    ctx.fillStyle = grad;
    ctx.fillText(fmtHours(weekMinutes), cx, 420);
    ctx.font = "500 34px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("bu hafta çalışma", cx, 480);

    // Stat tiles
    const tiles: { label: string; value: string }[] = [
      { label: "🔥 Streak", value: `${streak} gün` },
      { label: "Seviye", value: `Sv.${level}` },
      { label: "Son net", value: net != null ? net.toFixed(1) : "—" },
    ];
    const tileW = 290;
    const gap = 30;
    const totalW = tiles.length * tileW + (tiles.length - 1) * gap;
    let tx = (W - totalW) / 2;
    const ty = 560;
    const th = 200;
    for (const t of tiles) {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      roundRect(ctx, tx, ty, tileW, th, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 2;
      roundRect(ctx, tx, ty, tileW, th, 28);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.font = "800 64px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(t.value, tx + tileW / 2, ty + 110);
      ctx.font = "500 28px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText(t.label, tx + tileW / 2, ty + 158);
      tx += tileW + gap;
    }

    // Geri sayım bandı
    const by = 830;
    const bw = W - 160;
    ctx.fillStyle = "rgba(249,115,22,0.12)";
    roundRect(ctx, 80, by, bw, 130, 28);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.font = "800 60px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#fb923c";
    ctx.fillText(`YKS'ye ${daysToExam} gün`, cx, by + 85);

    // Motivasyon
    ctx.font = "500 32px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#d4d4d8";
    ctx.fillText(
      longest > streak ? `En uzun serin: ${longest} gün` : "Her gün bir adım. 💪",
      cx,
      1070,
    );

    // Footer
    ctx.font = "600 30px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("PeakNET · YKS çalışma platformu", cx, H - 70);
  }, [name, weekMinutes, streak, longest, level, net, daysToExam]);

  async function getBlob(): Promise<Blob | null> {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  }

  async function download() {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "peaknet-ilerleme.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Kart indirildi.");
  }

  async function share() {
    setBusy(true);
    try {
      const blob = await getBlob();
      if (!blob) return;
      const file = new File([blob], "peaknet-ilerleme.png", { type: "image/png" });
      const navAny = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
        share?: (d: unknown) => Promise<void>;
      };
      if (navAny.share && navAny.canShare?.({ files: [file] })) {
        await navAny.share({
          files: [file],
          title: "PeakNET ilerlemem",
          text: "Bu hafta YKS çalışmam 🔥 #PeakNET",
        });
      } else {
        await download();
        toast.message("Cihazın doğrudan paylaşımı desteklemiyor — kart indirildi.");
      }
    } catch {
      // kullanıcı iptal etmiş olabilir
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="mx-auto block h-auto w-full max-w-[360px] rounded-xl"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={share}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
          Paylaş
        </button>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
        >
          <Download size={15} /> İndir
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Kartı Instagram/WhatsApp story&apos;ine koyabilirsin. Veriler bu haftanın
        özetinden gelir.
      </p>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
