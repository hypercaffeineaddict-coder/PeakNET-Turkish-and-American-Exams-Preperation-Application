import type { Board, Pt } from "@/lib/board";

const VBW = 640;
const VBH = 440;
const PAD = { l: 40, r: 18, t: 30, b: 28 };
const innerW = VBW - PAD.l - PAD.r;
const innerH = VBH - PAD.t - PAD.b;

function niceStep(min: number, max: number) {
  const raw = (max - min) / 10 || 1;
  const pow = Math.pow(10, Math.floor(Math.log10(Math.abs(raw)) || 0));
  const n = raw / pow;
  const m = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return m * pow;
}

const fmt = (n: number) =>
  Number.isInteger(n) ? String(n) : Number(n.toFixed(2)).toString();

export function BoardCanvas({ board }: { board: Board }) {
  const [xmin, xmax] = board.xRange;
  const [ymin, ymax] = board.yRange;
  const sx = (x: number) => PAD.l + ((x - xmin) / (xmax - xmin)) * innerW;
  const sy = (y: number) => PAD.t + (1 - (y - ymin) / (ymax - ymin)) * innerH;
  const path = (pts: Pt[]) => pts.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ");

  const xStep = niceStep(xmin, xmax);
  const yStep = niceStep(ymin, ymax);
  const xTicks: number[] = [];
  for (let x = Math.ceil(xmin / xStep) * xStep; x <= xmax + 1e-9; x += xStep)
    xTicks.push(Math.round(x / xStep) * xStep);
  const yTicks: number[] = [];
  for (let y = Math.ceil(ymin / yStep) * yStep; y <= ymax + 1e-9; y += yStep)
    yTicks.push(Math.round(y / yStep) * yStep);

  const x0 = xmin <= 0 && xmax >= 0 ? sx(0) : PAD.l;
  const y0 = ymin <= 0 && ymax >= 0 ? sy(0) : VBH - PAD.b;
  const xScale = innerW / (xmax - xmin);
  const yScale = innerH / (ymax - ymin);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <svg viewBox={`0 0 ${VBW} ${VBH}`} className="block w-full" style={{ aspectRatio: `${VBW}/${VBH}` }}>
        {/* Grid */}
        {board.showGrid && (
          <g stroke="var(--border)" strokeWidth="1">
            {xTicks.map((x, i) => (
              <line key={`gx${i}`} x1={sx(x)} y1={PAD.t} x2={sx(x)} y2={VBH - PAD.b} opacity="0.5" />
            ))}
            {yTicks.map((y, i) => (
              <line key={`gy${i}`} x1={PAD.l} y1={sy(y)} x2={VBW - PAD.r} y2={sy(y)} opacity="0.5" />
            ))}
          </g>
        )}

        {/* Eksenler */}
        {board.showAxes && (
          <g stroke="var(--muted-foreground)" strokeWidth="1.5" fill="var(--muted-foreground)">
            <line x1={PAD.l} y1={y0} x2={VBW - PAD.r} y2={y0} />
            <line x1={x0} y1={PAD.t} x2={x0} y2={VBH - PAD.b} />
            <polygon points={`${VBW - PAD.r},${y0} ${VBW - PAD.r - 7},${y0 - 4} ${VBW - PAD.r - 7},${y0 + 4}`} />
            <polygon points={`${x0},${PAD.t} ${x0 - 4},${PAD.t + 7} ${x0 + 4},${PAD.t + 7}`} />
          </g>
        )}

        {/* Tick etiketleri */}
        <g fill="var(--muted-foreground)" fontSize="10" fontFamily="var(--font-mono), monospace">
          {xTicks.filter((x) => Math.abs(x) > 1e-9).map((x, i) => (
            <text key={`tx${i}`} x={sx(x)} y={y0 + 13} textAnchor="middle">{fmt(x)}</text>
          ))}
          {yTicks.filter((y) => Math.abs(y) > 1e-9).map((y, i) => (
            <text key={`ty${i}`} x={x0 - 5} y={sy(y) + 3.5} textAnchor="end">{fmt(y)}</text>
          ))}
        </g>

        {/* Şekiller */}
        {board.shapes.map((s, i) => {
          const key = `s${i}`;
          if (s.type === "function") {
            return (
              <g key={key}>
                <polyline points={path(s.points)} fill="none" stroke={s.color ?? "var(--primary)"} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {s.label && labelAt(sx(s.points[s.points.length - 1][0]), sy(s.points[s.points.length - 1][1]), s.label, s.color ?? "var(--primary)")}
              </g>
            );
          }
          if (s.type === "polyline") {
            const pointsStr = path(s.closed && s.points.length > 2 ? [...s.points, s.points[0]] : s.points);
            return (
              <g key={key}>
                <polyline points={pointsStr} fill={s.fill ? `${s.color ?? "var(--primary)"}` : "none"} fillOpacity={s.fill ? 0.12 : 0} stroke={s.color ?? "var(--primary)"} strokeWidth="2.5" strokeLinejoin="round" />
                {s.label && labelAt(sx(s.points[0][0]), sy(s.points[0][1]) - 6, s.label, s.color ?? "var(--primary)")}
              </g>
            );
          }
          if (s.type === "segment") {
            const mx = (sx(s.from[0]) + sx(s.to[0])) / 2;
            const my = (sy(s.from[1]) + sy(s.to[1])) / 2;
            return (
              <g key={key}>
                <line x1={sx(s.from[0])} y1={sy(s.from[1])} x2={sx(s.to[0])} y2={sy(s.to[1])} stroke={s.color ?? "var(--foreground)"} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={s.dashed ? "6 5" : undefined} />
                {s.label && labelAt(mx, my - 5, s.label, s.color ?? "var(--foreground)")}
              </g>
            );
          }
          if (s.type === "circle") {
            return (
              <g key={key}>
                <ellipse cx={sx(s.center[0])} cy={sy(s.center[1])} rx={s.r * xScale} ry={s.r * yScale} fill={s.fill ? `${s.color ?? "var(--primary)"}` : "none"} fillOpacity={s.fill ? 0.1 : 0} stroke={s.color ?? "var(--primary)"} strokeWidth="2.5" />
                {s.label && labelAt(sx(s.center[0]), sy(s.center[1]) - 5, s.label, s.color ?? "var(--primary)")}
              </g>
            );
          }
          if (s.type === "point") {
            return (
              <g key={key}>
                <circle cx={sx(s.at[0])} cy={sy(s.at[1])} r="4" fill={s.color ?? "var(--accent)"} stroke="var(--background)" strokeWidth="1.5" />
                {s.label && labelAt(sx(s.at[0]) + 7, sy(s.at[1]) - 6, s.label, s.color ?? "var(--foreground)")}
              </g>
            );
          }
          // text
          return labelAt(sx(s.at[0]), sy(s.at[1]), s.text, s.color ?? "var(--foreground)", key);
        })}

        {board.title && (
          <text x={VBW / 2} y={16} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--foreground)" fontFamily="var(--font-display), sans-serif">
            {board.title}
          </text>
        )}
      </svg>
    </div>
  );
}

function labelAt(x: number, y: number, text: string, color: string, key?: string) {
  return (
    <text key={key} x={x} y={y} fontSize="11" fontWeight="600" fill={color} fontFamily="var(--font-mono), monospace" paintOrder="stroke" stroke="var(--background)" strokeWidth="3" strokeLinejoin="round">
      {text}
    </text>
  );
}
