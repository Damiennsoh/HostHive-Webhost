import { DeploymentStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: DeploymentStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<DeploymentStatus, { label: string; className: string; dotClassName: string }> = {
  ready: {
    label: 'Ready',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dotClassName: 'bg-emerald-400',
  },
  building: {
    label: 'Building',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dotClassName: 'bg-amber-400 animate-pulse',
  },
  error: {
    label: 'Error',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
    dotClassName: 'bg-red-400',
  },
  queued: {
    label: 'Queued',
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    dotClassName: 'bg-zinc-400',
  },
  canceled: {
    label: 'Canceled',
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    dotClassName: 'bg-zinc-400',
  },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClassName)} />
      {config.label}
    </span>
  )
}
