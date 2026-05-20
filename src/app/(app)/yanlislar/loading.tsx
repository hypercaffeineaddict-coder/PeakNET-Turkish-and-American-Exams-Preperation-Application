import { Skeleton, CardSkeleton } from "@/components/skeleton";

export default function YanlislarLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
