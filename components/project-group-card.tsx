'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Folder, Database, Globe, ArrowRight, Layers } from 'lucide-react'
import { ProjectGroup } from '@/lib/types'
import { useEffect, useState } from 'react'

interface ProjectGroupCardProps {
  group: ProjectGroup
}

export function ProjectGroupCard({ group }: ProjectGroupCardProps) {
  const [stats, setStats] = useState({ services: 0, databases: 0 })

  useEffect(() => {
    // Fetch count of services and databases in this group
    Promise.all([
      fetch(`/api/projects?groupId=${group.id}`).then(r => r.json()),
      fetch(`/api/databases?groupId=${group.id}`).then(r => r.json())
    ]).then(([projectsData, dbsData]) => {
      setStats({
        services: projectsData.success ? projectsData.projects.length : 0,
        databases: dbsData.success ? dbsData.databases.length : 0
      })
    })
  }, [group.id])

  return (
    <Link href={`/projects/${group.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-white transition-colors">
                {group.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {group.description || 'Multi-service project'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>{stats.services} Services</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            <span>{stats.databases} Databases</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Updated {new Date(group.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View Group</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
