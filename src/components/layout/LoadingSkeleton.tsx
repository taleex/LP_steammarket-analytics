import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
};
