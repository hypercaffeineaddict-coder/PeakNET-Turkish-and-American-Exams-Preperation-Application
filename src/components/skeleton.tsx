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

export function StatGridSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-${cols}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
