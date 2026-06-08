import { localDate } from "@/lib/dates";

// Server component — interactive değil
export function Heatmap({
  dailyMinutes,
}: {
  dailyMinutes: Record<string, number>;
}) {
  // Son 365 gün, haftanın günü 0=Pazar
  const days: { date: Date; key: string; minutes: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDate(d);
    days.push({ date: d, key, minutes: dailyMinutes[key] ?? 0 });
  }

  // Sütunlara (haftalara) böl
  const weeks: { date: Date; key: string; minutes: number }[][] = [];
  let currentWeek: typeof days = [];
  // Sütun 0'ın tepesinde haftanın ilk gününden önce boş günler olacak
  const firstDay = days[0].date.getDay(); // 0=Sun
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: new Date(0), key: "", minutes: -1 });
  }
  for (const d of days) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(0), key: "", minutes: -1 });
    }
    weeks.push(currentWeek);
  }

  const CELL = 11;
  const GAP = 3;
  const COLS = weeks.length;
  const ROWS = 7;
  const PAD_LEFT = 26; // gün isimleri
  const PAD_TOP = 16; // ay isimleri
  const W = PAD_LEFT + COLS * (CELL + GAP);
  const H = PAD_TOP + ROWS * (CELL + GAP);

  function color(m: number): string {
    if (m < 0) return "transparent";
    if (m === 0) return "oklch(0.62 0.21 285 / 0.10)";
    if (m < 15) return "oklch(0.62 0.21 285 / 0.30)";
    if (m < 45) return "oklch(0.62 0.21 285 / 0.50)";
    if (m < 90) return "oklch(0.62 0.21 285 / 0.70)";
    if (m < 180) return "oklch(0.62 0.21 285 / 0.86)";
    return "oklch(0.66 0.22 285)";
  }

  const months: { x: number; label: string }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks.length; w++) {
    const firstReal = weeks[w].find((d) => d.minutes >= 0);
    if (!firstReal) continue;
    const m = firstReal.date.getMonth();
    if (m !== lastMonth) {
      months.push({
        x: PAD_LEFT + w * (CELL + GAP),
        label: firstReal.date.toLocaleString("tr-TR", { month: "short" }),
      });
      lastMonth = m;
    }
  }

  const dayLabels = ["", "Pzt", "", "Çar", "", "Cum", ""];

  return (
    <div className="mt-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: W, maxWidth: "100%", height: H }}
        className="block"
      >
        {months.map((m, i) => (
          <text
            key={i}
            x={m.x}
            y={11}
            className="fill-muted-foreground"
            fontSize="10"
          >
            {m.label}
          </text>
        ))}
        {dayLabels.map((label, i) =>
          label ? (
            <text
              key={i}
              x={0}
              y={PAD_TOP + i * (CELL + GAP) + CELL - 1}
              className="fill-muted-foreground"
              fontSize="9"
            >
              {label}
            </text>
          ) : null,
        )}
        {weeks.map((week, wi) =>
          week.map((day, di) => (
            <rect
              key={`${wi}-${di}`}
              x={PAD_LEFT + wi * (CELL + GAP)}
              y={PAD_TOP + di * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={2}
              fill={color(day.minutes)}
            >
              {day.minutes >= 0 && (
                <title>
                  {day.date.toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {day.minutes} dk
                </title>
              )}
            </rect>
          )),
        )}
      </svg>
    </div>
  );
}
