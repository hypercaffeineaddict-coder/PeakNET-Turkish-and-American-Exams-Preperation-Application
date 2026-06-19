// AI çizim tahtası şeması. AI bu yapıda JSON üretir; kendi SVG çizicimiz
// (board-canvas.tsx) güvenli şekilde çizer. Serbest SVG yerine yapısal veri →
// hem güvenli hem tutarlı.

export type Pt = [number, number];

export type Shape =
  | { type: "function"; points: Pt[]; color?: string; label?: string }
  | { type: "polyline"; points: Pt[]; color?: string; label?: string; closed?: boolean; fill?: boolean }
  | { type: "segment"; from: Pt; to: Pt; color?: string; label?: string; dashed?: boolean }
  | { type: "circle"; center: Pt; r: number; color?: string; label?: string; fill?: boolean }
  | { type: "point"; at: Pt; color?: string; label?: string }
  | { type: "text"; at: Pt; text: string; color?: string };

export type Board = {
  title?: string;
  xRange: Pt;
  yRange: Pt;
  showAxes: boolean;
  showGrid: boolean;
  shapes: Shape[];
};

const fin = (n: unknown): number | null =>
  typeof n === "number" && Number.isFinite(n) ? n : null;

const pt = (v: unknown): Pt | null => {
  if (!Array.isArray(v) || v.length < 2) return null;
  const x = fin(v[0]);
  const y = fin(v[1]);
  return x === null || y === null ? null : [x, y];
};

const pts = (v: unknown, max = 600): Pt[] => {
  if (!Array.isArray(v)) return [];
  const out: Pt[] = [];
  for (const item of v) {
    const p = pt(item);
    if (p) out.push(p);
    if (out.length >= max) break;
  }
  return out;
};

const str = (v: unknown, max = 80): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

const range = (v: unknown, fb: Pt): Pt => {
  const p = pt(v);
  if (!p) return fb;
  const a = p[0];
  let b = p[1];
  if (a === b) b = a + 1;
  return a < b ? [a, b] : [b, a];
};

// Güvenli renk: yalnızca bilinen anahtar kelimeler / hex; yoksa undefined.
const COLOR_OK = /^#[0-9a-fA-F]{3,8}$|^[a-zA-Z]{3,20}$/;
const color = (v: unknown): string | undefined =>
  typeof v === "string" && COLOR_OK.test(v.trim()) ? v.trim() : undefined;

export function normalizeBoard(raw: unknown): Board | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const shapesRaw = Array.isArray(r.shapes) ? r.shapes : [];
  const shapes: Shape[] = [];

  for (const s of shapesRaw.slice(0, 60)) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const c = color(o.color);
    const label = str(o.label);
    switch (o.type) {
      case "function": {
        const p = pts(o.points);
        if (p.length >= 2) shapes.push({ type: "function", points: p, color: c, label });
        break;
      }
      case "polyline": {
        const p = pts(o.points);
        if (p.length >= 2)
          shapes.push({
            type: "polyline",
            points: p,
            color: c,
            label,
            closed: o.closed === true,
            fill: o.fill === true,
          });
        break;
      }
      case "segment": {
        const from = pt(o.from);
        const to = pt(o.to);
        if (from && to)
          shapes.push({ type: "segment", from, to, color: c, label, dashed: o.dashed === true });
        break;
      }
      case "circle": {
        const center = pt(o.center);
        const rr = fin(o.r);
        if (center && rr !== null && rr > 0)
          shapes.push({ type: "circle", center, r: rr, color: c, label, fill: o.fill === true });
        break;
      }
      case "point": {
        const at = pt(o.at);
        if (at) shapes.push({ type: "point", at, color: c, label });
        break;
      }
      case "text": {
        const at = pt(o.at);
        const text = str(o.text, 60);
        if (at && text) shapes.push({ type: "text", at, text, color: c });
        break;
      }
    }
  }

  if (shapes.length === 0) return null;

  return {
    title: str(r.title, 60),
    xRange: range(r.xRange, [-10, 10]),
    yRange: range(r.yRange, [-10, 10]),
    showAxes: r.showAxes !== false,
    showGrid: r.showGrid !== false,
    shapes,
  };
}
