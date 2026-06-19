"use client";

type SubjectTimeData = {
  name: string;
  seconds: number;
  color: string;
};

export function SubjectTimePie({
  data,
  total,
}: {
  data: SubjectTimeData[];
  total: number;
}) {
  if (!data || data.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">Veri yok.</p>;
  }

  const W = 300;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2;
  const r = 80;

  let startAngle = -Math.PI / 2;
  const slices = data.map((item) => {
    const sliceAngle = (item.seconds / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const path = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    const labelAngle = startAngle + sliceAngle / 2;
    const labelR = r * 0.65;
    const labelX = cx + labelR * Math.cos(labelAngle);
    const labelY = cy + labelR * Math.sin(labelAngle);

    const pct = Math.round((item.seconds / total) * 100);

    const slice = {
      path,
      labelX,
      labelY,
      pct,
      color: item.color,
      name: item.name,
    };

    startAngle = endAngle;
    return slice;
  });

  return (
    <div className="mt-6 space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-64 w-64">
        {slices.map((slice, i) => (
          <g key={i}>
            <path fill={slice.color} d={slice.path} opacity={0.8} />
            {slice.pct > 5 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-xs font-semibold"
              >
                {slice.pct}%
              </text>
            )}
          </g>
        ))}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((item) => {
          const hours = Math.floor(item.seconds / 3600);
          const mins = Math.floor((item.seconds % 3600) / 60);
          const pct = Math.round((item.seconds / total) * 100);
          return (
            <li key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium">
                {hours}s {mins}d ({pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
