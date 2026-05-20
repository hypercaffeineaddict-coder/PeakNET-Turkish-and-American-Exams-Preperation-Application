import { Skeleton, CardSkeleton } from "@/components/skeleton";

export default function IstatistiklerLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-96" />
      </header>
      <Skeleton className="h-14" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-48" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
