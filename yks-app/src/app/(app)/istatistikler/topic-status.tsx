type Item = {
  id: string;
  name: string;
  color: string | null;
  total: number;
  done: number;
  inProgress: number;
  notStarted: number;
};

export function TopicStatusBars({ data }: { data: Item[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {data.map((d) => {
        const pctDone = d.total > 0 ? (d.done / d.total) * 100 : 0;
        const pctInProgress = d.total > 0 ? (d.inProgress / d.total) * 100 : 0;
        return (
          <li key={d.id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color ?? "#888" }}
                />
                {d.name}
              </span>
              <span className="text-muted-foreground">
                <span className="text-emerald-500">{d.done}</span>
                {" · "}
                <span className="text-primary">{d.inProgress}</span>
                {" · "}
                {d.notStarted}{" "}
                <span className="text-muted-foreground/60">
                  / {d.total}
                </span>
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${pctDone}%` }}
              />
              <div
                className="bg-primary transition-all"
                style={{ width: `${pctInProgress}%` }}
              />
            </div>
          </li>
        );
      })}
      <li className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Bitti
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary" /> Devam
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />{" "}
          Başlamadın
        </span>
      </li>
    </ul>
  );
}
