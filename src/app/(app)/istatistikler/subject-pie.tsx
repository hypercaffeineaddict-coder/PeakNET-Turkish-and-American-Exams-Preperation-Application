type Item = {
  id: string;
  name: string;
  color: string | null;
  seconds: number;
};

export function SubjectTimePie({
  data,
  total,
}: {
  data: Item[];
  total: number;
}) {
  const SIZE = 180;
  const R = 80;
  const STROKE = 26;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  const filtered = data.filter((d) => d.seconds > 0);
  let offset = 0;
  const arcs = filtered.map((d) => {
    const pct = d.seconds / total;
    const dash = pct * CIRCUMFERENCE;
    const arc = {
      ...d,
      pct,
      dashArray: `${dash} ${CIRCUMFERENCE}`,
      dashOffset: -offset,
      minutes: Math.round(d.seconds / 60),
    };
    offset += dash;
    return arc;
  });

  return (
    <div className="mt-4 flex flex-wrap items-center gap-6">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-44 w-44 shrink-0">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth={STROKE}
        />
        {arcs.map((a) => (
          <circle
            key={a.id}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={a.color ?? "#888"}
            strokeWidth={STROKE}
            strokeDasharray={a.dashArray}
            strokeDashoffset={a.dashOffset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        ))}
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 4}
          textAnchor="middle"
          className="fill-foreground"
          fontSize="22"
          fontWeight="600"
        >
          {Math.round(total / 60)}
        </text>
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 14}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
        >
          dakika
        </text>
      </svg>

      <ul className="flex-1 space-y-2 min-w-[200px]">
        {data.map((d) => {
          const pct =
            total > 0 ? Math.round((d.seconds / total) * 100) : 0;
          const minutes = Math.round(d.seconds / 60);
          return (
            <li key={d.id} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color ?? "#888" }}
              />
              <span className="flex-1 text-sm">{d.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {minutes} dk
              </span>
              <span className="w-9 text-right text-xs tabular-nums">
                %{pct}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
