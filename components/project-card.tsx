'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GitBranch, Globe, ExternalLink } from 'lucide-react'
import { Project } from '@/lib/types'
import { StatusBadge } from './status-badge'
import { FrameworkIcon } from './framework-icon'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.projectGroupId ?? '_'}/services/${project.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative rounded-lg border border-border bg-card p-5 transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FrameworkIcon framework={project.framework} className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-white">
                {project.name}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span className="truncate">{project.domain}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={project.status} size="sm" />
        </div>

        {project.repository && (
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              <span>{project.branch || 'main'}</span>
            </div>
            <span className="text-zinc-600">|</span>
            <span>{project.repository}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {project.lastDeployment}
          </span>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </motion.div>
    </Link>
  )
}
