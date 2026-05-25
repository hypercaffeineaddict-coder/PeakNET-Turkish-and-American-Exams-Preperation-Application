export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/60 ${className}`}
      aria-hidden
    />
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-4 h-8 w-1/2" />
    </div>
  );
}

export function StatGridSkeleton({ cols = 4 }: { cols?: 2 | 3 | 4 }) {
  const colClass =
    cols === 2 ? "lg:grid-cols-2" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${colClass}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-52 max-w-full" />
      <Skeleton className="mt-2.5 h-4 w-80 max-w-full" />
    </div>
  );
}
