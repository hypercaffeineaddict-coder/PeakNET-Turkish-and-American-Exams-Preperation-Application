import type { Board, Pt } from "@/lib/board";

// Kare canvas → eşit aralıklarda çember/üçgen vs. doğru oranda çıkar.
const VB = 600;
const PAD = { l: 42, r: 16, t: 30, b: 32 };
const INNER_W = VB - PAD.l - PAD.r;
const INNER_H = VB - PAD.t - PAD.b;
const CLIP_ID = "pn-board-clip";

function niceStep(min: number, max: number) {
  const raw = (max - min) / 10 || 1;
  const pow = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
  const n = raw / pow;
  const m = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return m * pow;
}

const fmt = (n: number) =>
  Number.isInteger(n) ? String(n) : Number(n.toFixed(2)).toString();

// Asimptot/sıçrama tespiti: |dy| dikey aralığın yarısından büyükse parçayı kes.
function splitJumps(pts: Pt[], yJumpThreshold: number): Pt[][] {
  const segs: Pt[][] = [];
  let cur: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (cur.length > 0) {
      const dy = Math.abs(p[1] - cur[cur.length - 1][1]);
      if (dy > yJumpThreshold) {
        if (cur.length > 1) segs.push(cur);
        cur = [p];
        continue;
      }
    }
    cur.push(p);
  }
  if (cur.length > 1) segs.push(cur);
  return segs;
}

export function BoardCanvas({ board }: { board: Board }) {
  const [xmin, xmax] = board.xRange;
  const [ymin, ymax] = board.yRange;
  const sx = (x: number) => PAD.l + ((x - xmin) / (xmax - xmin)) * INNER_W;
  const sy = (y: number) => PAD.t + (1 - (y - ymin) / (ymax - ymin)) * INNER_H;
  const toStr = (pts: Pt[]) =>
    pts.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ");

  const xStep = niceStep(xmin, xmax);
  const yStep = niceStep(ymin, ymax);
  const xTicks: number[] = [];
  for (let x = Math.ceil(xmin / xStep) * xStep; x <= xmax + 1e-9; x += xStep)
    xTicks.push(Math.round((x / xStep) * 1e9) / 1e9 * xStep);
  const yTicks: number[] = [];
  for (let y = Math.ceil(ymin / yStep) * yStep; y <= ymax + 1e-9; y += yStep)
    yTicks.push(Math.round((y / yStep) * 1e9) / 1e9 * yStep);

  const x0 = xmin <= 0 && xmax >= 0 ? sx(0) : PAD.l;
  const y0 = ymin <= 0 && ymax >= 0 ? sy(0) : VB - PAD.b;
  const xScale = INNER_W / (xmax - xmin);
  const yScale = INNER_H / (ymax - ymin);
  const jumpThresh = (ymax - ymin) * 0.4;

  const tickLabelY = VB - PAD.b + 14; // eksende değil, hep grafiğin altında
  const tickLabelX = PAD.l - 6;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <svg viewBox={`0 0 ${VB} ${VB}`} className="block w-full" style={{ aspectRatio: "1 / 1" }}>
        <defs>
          <clipPath id={CLIP_ID}>
            <rect x={PAD.l} y={PAD.t} width={INNER_W} height={INNER_H} />
          </clipPath>
        </defs>

        {/* Grid */}
        {board.showGrid && (
          <g stroke="var(--border)" strokeWidth="1" opacity="0.5">
            {xTicks.map((x, i) => (
              <line key={`gx${i}`} x1={sx(x)} y1={PAD.t} x2={sx(x)} y2={VB - PAD.b} />
            ))}
            {yTicks.map((y, i) => (
              <line key={`gy${i}`} x1={PAD.l} y1={sy(y)} x2={VB - PAD.r} y2={sy(y)} />
            ))}
          </g>
        )}

        {/* Eksenler */}
        {board.showAxes && (
          <g stroke="var(--muted-foreground)" strokeWidth="1.5" fill="var(--muted-foreground)">
            <line x1={PAD.l} y1={y0} x2={VB - PAD.r} y2={y0} />
            <line x1={x0} y1={PAD.t} x2={x0} y2={VB - PAD.b} />
            <polygon points={`${VB - PAD.r},${y0} ${VB - PAD.r - 7},${y0 - 4} ${VB - PAD.r - 7},${y0 + 4}`} />
            <polygon points={`${x0},${PAD.t} ${x0 - 4},${PAD.t + 7} ${x0 + 4},${PAD.t + 7}`} />
          </g>
        )}

        {/* Tick etiketleri — daima grafiğin alt/sol kenarında */}
        <g fill="var(--muted-foreground)" fontSize="10" fontFamily="var(--font-mono), monospace">
          {xTicks.filter((x) => Math.abs(x) > 1e-9).map((x, i) => (
            <text key={`tx${i}`} x={sx(x)} y={tickLabelY} textAnchor="middle">{fmt(x)}</text>
          ))}
          {yTicks.filter((y) => Math.abs(y) > 1e-9).map((y, i) => (
            <text key={`ty${i}`} x={tickLabelX} y={sy(y) + 3.5} textAnchor="end">{fmt(y)}</text>
          ))}
          {xmin <= 0 && xmax >= 0 && ymin <= 0 && ymax >= 0 && (
            <text x={x0 - 6} y={y0 + 13} textAnchor="end">0</text>
          )}
        </g>

        {/* Şekiller — chart alanına clip'lenir */}
        <g clipPath={`url(#${CLIP_ID})`}>
          {board.shapes.map((s, i) => {
            const key = `s${i}`;
            if (s.type === "function") {
              const segs = splitJumps(s.points, jumpThresh);
              return (
                <g key={key} fill="none" stroke={s.color ?? "var(--primary)"} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
                  {segs.map((seg, j) => (
                    <polyline key={j} points={toStr(seg)} />
                  ))}
                </g>
              );
            }
            if (s.type === "polyline") {
              const points = s.closed && s.points.length > 2 ? [...s.points, s.points[0]] : s.points;
              return (
                <polyline
                  key={key}
                  points={toStr(points)}
                  fill={s.fill ? (s.color ?? "var(--primary)") : "none"}
                  fillOpacity={s.fill ? 0.14 : 0}
                  stroke={s.color ?? "var(--primary)"}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              );
            }
            if (s.type === "segment") {
              return (
                <line
                  key={key}
                  x1={sx(s.from[0])}
                  y1={sy(s.from[1])}
                  x2={sx(s.to[0])}
                  y2={sy(s.to[1])}
                  stroke={s.color ?? "var(--foreground)"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={s.dashed ? "6 5" : undefined}
                />
              );
            }
            if (s.type === "circle") {
              return (
                <ellipse
                  key={key}
                  cx={sx(s.center[0])}
                  cy={sy(s.center[1])}
                  rx={s.r * xScale}
                  ry={s.r * yScale}
                  fill={s.fill ? (s.color ?? "var(--primary)") : "none"}
                  fillOpacity={s.fill ? 0.12 : 0}
                  stroke={s.color ?? "var(--primary)"}
                  strokeWidth="2.5"
                />
              );
            }
            if (s.type === "point") {
              return (
                <circle
                  key={key}
                  cx={sx(s.at[0])}
                  cy={sy(s.at[1])}
                  r="4"
                  fill={s.color ?? "var(--accent)"}
                  stroke="var(--background)"
                  strokeWidth="1.5"
                />
              );
            }
            return null;
          })}
        </g>

        {/* Etiketler — clip dışı, dış halkalı stroke ile okunur */}
        <g fontFamily="var(--font-mono), monospace" fontSize="11" fontWeight={600}>
          {board.shapes.map((s, i) => {
            const key = `lb${i}`;
            const c = (s as { color?: string }).color;
            const colorVar = c ?? (s.type === "point" ? "var(--accent)" : "var(--foreground)");
            if (s.type === "point" && s.label) {
              return labelAt(sx(s.at[0]) + 8, sy(s.at[1]) - 6, s.label, colorVar, key);
            }
            if (s.type === "text") {
              return labelAt(sx(s.at[0]), sy(s.at[1]), s.text, c ?? "var(--foreground)", key);
            }
            if (s.type === "function" && s.label) {
              const last = s.points[s.points.length - 1];
              const px = Math.min(VB - PAD.r - 30, sx(last[0]) + 6);
              const py = Math.max(PAD.t + 12, sy(last[1]) - 6);
              return labelAt(px, py, s.label, c ?? "var(--primary)", key);
            }
            if (s.type === "polyline" && s.label) {
              const p0 = s.points[0];
              return labelAt(sx(p0[0]), sy(p0[1]) - 8, s.label, c ?? "var(--primary)", key);
            }
            if (s.type === "segment" && s.label) {
              const mx = (sx(s.from[0]) + sx(s.to[0])) / 2;
              const my = (sy(s.from[1]) + sy(s.to[1])) / 2;
              return labelAt(mx, my - 6, s.label, c ?? "var(--foreground)", key);
            }
            if (s.type === "circle" && s.label) {
              return labelAt(sx(s.center[0]), sy(s.center[1]) - 6, s.label, c ?? "var(--primary)", key);
            }
            return null;
          })}
        </g>

        {board.title && (
          <text
            x={VB / 2}
            y={18}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="var(--foreground)"
            fontFamily="var(--font-display), sans-serif"
          >
            {board.title}
          </text>
        )}
      </svg>
    </div>
  );
}

function labelAt(x: number, y: number, text: string, color: string, key?: string) {
  return (
    <text
      key={key}
      x={x}
      y={y}
      fill={color}
      paintOrder="stroke"
      stroke="var(--background)"
      strokeWidth="3"
      strokeLinejoin="round"
    >
      {text}
    </text>
  );
}
