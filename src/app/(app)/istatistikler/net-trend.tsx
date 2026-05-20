type Totals = Record<string, { net?: number }>;
type Exam = {
  name: string;
  exam_date: string;
  exam_type: string;
  totals: unknown;
};

export function NetTrendChart({ exams }: { exams: Exam[] }) {
  const points = exams.map((e) => {
    const totals = (e.totals ?? {}) as Totals;
    const total = Object.values(totals).reduce(
      (acc, t) => acc + (t?.net ?? 0),
      0,
    );
    return {
      date: new Date(e.exam_date),
      total,
      name: e.name,
      type: e.exam_type,
    };
  });
  if (points.length === 0) return null;

  const maxNet = Math.max(60, ...points.map((p) => p.total));
  const W = 480;
  const H = 220;
  const pad = 28;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;

  const xStep = points.length > 1 ? innerW / (points.length - 1) : 0;
  const yScale = (v: number) => H - pad - (v / maxNet) * innerH;
  const xScale = (i: number) =>
    points.length > 1 ? pad + i * xStep : W / 2;

  const polyline = points.map((p, i) => `${xScale(i)},${yScale(p.total)}`).join(" ");

  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full min-w-[400px]">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line
              x1={pad}
              x2={W - pad}
              y1={pad + p * innerH}
              y2={pad + p * innerH}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
            <text
              x={4}
              y={pad + p * innerH + 3}
              fontSize="9"
              className="fill-muted-foreground"
            >
              {Math.round((1 - p) * maxNet)}
            </text>
          </g>
        ))}
        {/* Polyline */}
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={polyline}
          className="text-emerald-500"
        />
        {/* Area under */}
        <polygon
          points={`${pad},${H - pad} ${polyline} ${W - pad},${H - pad}`}
          fill="currentColor"
          fillOpacity="0.08"
          className="text-emerald-500"
        />
        {/* Dots + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={xScale(i)}
              cy={yScale(p.total)}
              r={4}
              className="fill-emerald-500"
            />
            <text
              x={xScale(i)}
              y={yScale(p.total) - 9}
              textAnchor="middle"
              fontSize="10"
              className="fill-foreground"
            >
              {p.total.toFixed(1)}
            </text>
            <text
              x={xScale(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="9"
              className="fill-muted-foreground"
            >
              {p.date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
