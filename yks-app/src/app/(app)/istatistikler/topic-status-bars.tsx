"use client";

type TopicStatusData = {
  name: string;
  done: number;
  inProgress: number;
  notStarted: number;
  color: string;
};

export function TopicStatusBars({ data }: { data: TopicStatusData[] }) {
  if (!data || data.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">Veri yok.</p>;
  }

  return (
    <div className="mt-6 space-y-3">
      {data.map((item) => {
        const total = item.done + item.inProgress + item.notStarted;
        const doneP = total > 0 ? (item.done / total) * 100 : 0;
        const inProgressP = total > 0 ? (item.inProgress / total) * 100 : 0;

        return (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="text-muted-foreground">
                {item.done}/{total}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-emerald-500"
                style={{ width: `${doneP}%` }}
                title={`Bitti: ${item.done}`}
              />
              <div
                className="bg-amber-500"
                style={{ width: `${inProgressP}%` }}
                title={`Devam ediyor: ${item.inProgress}`}
              />
              <div
                className="flex-1 bg-muted-foreground/20"
                title={`Başlanmadı: ${item.notStarted}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
