'use client'

import { useEffect, use, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Layers, 
  Database as DbIcon, 
  Globe, 
  Settings,
  Activity,
  LayoutDashboard,
  Loader2,
  ExternalLink,
  GitBranch
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { ProjectCard } from '@/components/project-card'
import { cn } from '@/lib/utils'
import { mapDbProjectToUi, mapDbManagedDatabaseToUi } from '@/lib/map-db'
import type { Project, ManagedDatabase, ProjectGroup } from '@/lib/types'

export default function ProjectGroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const resolvedParams = use(params)
  const [group, setGroup] = useState<ProjectGroup | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [databases, setDatabases] = useState<ManagedDatabase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [groupRes, projectsRes, databasesRes] = await Promise.all([
          fetch(`/api/project-groups/${resolvedParams.groupId}`).catch(() => null), // Need to create this endpoint or handle it
          fetch(`/api/projects?groupId=${resolvedParams.groupId}`),
          fetch(`/api/databases?groupId=${resolvedParams.groupId}`)
        ])

        // For now, if group endpoint doesn't exist, we might need to fetch from list
        // Let's assume we'll create /api/project-groups/[id]
        if (groupRes && groupRes.ok) {
          const groupData = await groupRes.json()
          if (groupData.success) setGroup(groupData.group)
        } else {
          // Fallback: fetch all and find
          const allGroupsRes = await fetch('/api/project-groups')
          const allGroupsData = await allGroupsRes.json()
          if (allGroupsData.success) {
            const found = allGroupsData.groups.find((g: any) => g.id === resolvedParams.groupId)
            setGroup(found)
          }
        }

        const [projectsData, databasesData] = await Promise.all([
          projectsRes.json(),
          databasesRes.json()
        ])

        if (projectsData.success) {
          setProjects(projectsData.projects.map(mapDbProjectToUi))
        }
        if (databasesData.success) {
          setDatabases(databasesData.databases.map(mapDbManagedDatabaseToUi))
        }
      } catch (err) {
        console.error('[Fetch Group Detail]', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.groupId])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="space-y-4">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <h2 className="text-xl font-semibold text-foreground">Group not found</h2>
          <p className="mt-2 text-muted-foreground">The project group you are looking for does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{group.name}</h1>
              <p className="text-muted-foreground">{group.description || 'Project Group'}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <Link href={`/projects/new?groupId=${group.id}`}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </Link>
            <Link href={`/databases?groupId=${group.id}`}>
              <Button variant="outline" className="border-border text-foreground">
                <DbIcon className="mr-2 h-4 w-4" />
                Add Database
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Services
          </h2>
          <span className="text-sm text-muted-foreground">{projects.length} services</span>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/50">
            <p className="text-muted-foreground">No services connected to this group yet.</p>
            <Link href={`/projects/new?groupId=${group.id}`} className="mt-4 inline-block">
              <Button variant="link" className="text-primary">Create your first service</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Databases Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <DbIcon className="h-5 w-5 text-emerald-400" />
            Databases
          </h2>
          <span className="text-sm text-muted-foreground">{databases.length} databases</span>
        </div>

        {databases.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {databases.map((db) => (
              <motion.div
                key={db.id}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border bg-card p-5 group transition-all hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <DbIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-white transition-colors">{db.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase">{db.dbType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 uppercase">
                    <div className="h-1 w-1 rounded-full bg-emerald-400" />
                    {db.status}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                   <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Host</span>
                    <span className="text-foreground font-mono">{db.host || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Internal Port</span>
                    <span className="text-foreground">{db.port || '—'}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end pt-4 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                    Connect
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/50">
            <p className="text-muted-foreground">No databases connected to this group yet.</p>
            <Link href={`/databases?groupId=${group.id}`} className="mt-4 inline-block">
              <Button variant="link" className="text-primary">Provision a database</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
