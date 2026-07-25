import { Skeleton } from "@/components/ui/skeleton";

export default function BookingStoriesLoading() {
  return (
    <div className="grid gap-5" aria-label="Loading booking stories">
      <Skeleton className="h-12 w-72" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
