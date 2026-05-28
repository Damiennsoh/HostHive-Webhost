'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectGroupCard } from '@/components/project-group-card'
import { mapDbProjectGroupToUi } from '@/lib/map-db'
import type { ProjectGroup } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ProjectsPage() {
  const [groups, setGroups] = useState<ProjectGroup[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/project-groups')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setGroups(json.groups)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and deploy your applications</p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted border-border pl-9"
        />
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading projects…</p>
        </div>
      ) : filteredGroups.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('grid gap-4', viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}
        >
          {filteredGroups.map((group) => (
            <ProjectGroupCard key={group.id} group={group} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16">
          <h3 className="text-lg font-medium text-foreground">No projects found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
          {!searchQuery && (
            <Link href="/projects/new" className="mt-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
