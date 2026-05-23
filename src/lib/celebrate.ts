// Kutlama animasyonu (canvas-confetti). Client bileşenlerinden çağrılır.
// Dinamik import: paket yalnızca gerektiğinde yüklenir.

const COLORS = ["#6366f1", "#fb923c", "#10b981", "#a855f7", "#38bdf8"];

export async function celebrate(kind: "success" | "big" = "success") {
  if (typeof window === "undefined") return;
  // Hareketi azalt tercihi varsa atla
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const confetti = (await import("canvas-confetti")).default;
    if (kind === "big") {
      const end = Date.now() + 900;
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: COLORS });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: COLORS });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    } else {
      confetti({
        particleCount: 130,
        spread: 78,
        startVelocity: 42,
        origin: { y: 0.6 },
        colors: COLORS,
      });
    }
  } catch {
    // sessiz geç
  }
}
