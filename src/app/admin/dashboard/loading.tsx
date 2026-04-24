import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-12 w-48 mb-8" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="mt-8">
        <Skeleton className="h-12 w-36 mb-4" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
