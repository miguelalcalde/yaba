import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function FeedListSkeleton() {
  return (
    <div className="space-y-3 px-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border p-4">
          <div className="flex gap-3">
            {/* Cover image skeleton */}
            <div className="flex-shrink-0">
              <Skeleton className="w-16 h-16 rounded-lg" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-3/4" />
              </div>

              <Skeleton className="h-3 w-full mt-2" />
              <Skeleton className="h-3 w-2/3 mt-1" />

              {/* Metadata skeleton */}
              <div className="flex items-center gap-3 mt-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex gap-1">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-14" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
