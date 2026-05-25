import { Skeleton, HeaderSkeleton } from "@/components/skeleton";

export default function UstalikLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <HeaderSkeleton />
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <Skeleton className="h-28 w-full rounded-2xl sm:w-64" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
