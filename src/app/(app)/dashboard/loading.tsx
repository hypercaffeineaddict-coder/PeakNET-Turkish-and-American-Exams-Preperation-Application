import { Skeleton, CardSkeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <CardSkeleton className="h-44" />
        <CardSkeleton className="h-32" />
      </div>
      <aside className="space-y-4">
        <CardSkeleton className="h-32" />
        <CardSkeleton className="h-20" />
      </aside>
    </div>
  );
}
