'use client'

import { motion } from 'framer-motion'
import { Deployment } from '@/lib/types'
import { StatusBadge } from './status-badge'
import { GitBranch, Clock, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'

interface DeploymentRowProps {
  deployment: Deployment
  showProject?: boolean
}

export function DeploymentRow({ deployment, showProject = true }: DeploymentRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-center gap-4 border-b border-border px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted font-mono text-xs text-muted-foreground">
        {deployment.commit.slice(0, 3)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {showProject && (
            <>
              <span className="font-medium text-foreground">{deployment.projectName}</span>
              <span className="text-muted-foreground">/</span>
            </>
          )}
          <span className="truncate text-sm text-muted-foreground">
            {deployment.commitMessage}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">{deployment.commit}</span>
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            {deployment.branch}
          </div>
        </div>
      </div>

      <StatusBadge status={deployment.status} size="sm" />

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {deployment.duration > 0 ? `${deployment.duration}s` : '-'}
      </div>

      <div className="w-24 text-right text-xs text-muted-foreground">
        {formatDistanceToNow(deployment.createdAt)}
      </div>

      {deployment.url && (
        <a
          href={deployment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </motion.div>
  )
}
