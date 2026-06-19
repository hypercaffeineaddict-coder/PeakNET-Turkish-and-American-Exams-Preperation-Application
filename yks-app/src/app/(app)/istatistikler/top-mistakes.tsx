import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Item = {
  id: string;
  name: string;
  subjectName: string;
  subjectColor: string;
  count: number;
};

export function TopMistakes({ data }: { data: Item[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <ul className="mt-4 space-y-2">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        return (
          <li key={d.id}>
            <Link
              href={`/konular/${d.id}`}
              className="group block rounded-lg border border-border bg-background p-3 transition hover:border-primary/40"
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{d.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {d.subjectName}
                  </div>
                </div>
                <span className="shrink-0 text-rose-500 font-semibold">
                  {d.count}
                </span>
                <ChevronRight
                  size={14}
                  className="text-muted-foreground/40 transition group-hover:translate-x-0.5"
                />
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-rose-500/70 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
