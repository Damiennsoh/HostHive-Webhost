import { MetricsCardSkeleton, ProjectCardSkeleton, TableRowSkeleton } from '@/components/skeletons'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricsCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent Deployments */}
      <div>
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 rounded-lg border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
