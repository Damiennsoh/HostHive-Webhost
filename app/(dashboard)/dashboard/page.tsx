'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  GitBranch,
  Globe,
  Folder,
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
} from 'lucide-react'
import { DeploymentRow } from '@/components/deployment-row'
import { StatusBadge } from '@/components/status-badge'
import type { Deployment, Project } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DashboardData {
  stats: { totalProjects: number; live: number; building: number; failed: number }
  recentProjects: Project[]
  recentDeployments: Deployment[]
  activity: { id: string; label: string; status: string; createdAt: string }[]
}

function activityDot(status: string) {
  if (status === 'success') return 'bg-emerald-400'
  if (status === 'failed') return 'bg-red-400'
  if (status === 'building' || status === 'deploying') return 'bg-primary animate-pulse'
  return 'bg-zinc-500'
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats ?? { totalProjects: 0, live: 0, building: 0, failed: 0 }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your deployments, monitor status, and scale your applications
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Projects', value: stats.totalProjects, icon: Folder, color: 'text-primary' },
          { label: 'Live', value: stats.live, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Building', value: stats.building, icon: Loader2, color: 'text-blue-400' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading activity…</p>
          ) : data?.activity.length ? (
            <ul className="mt-6 space-y-4">
              {data.activity.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', activityDot(item.status))} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              No activity yet.{' '}
              <Link href="/projects/new" className="text-primary hover:underline">
                Deploy your first project
              </Link>
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading projects…</p>
          ) : data?.recentProjects.length ? (
            <ul className="mt-6 space-y-3">
              {data.recentProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.branch ?? 'main'}</p>
                    </div>
                    <StatusBadge status={project.status} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">No projects yet.</p>
          )}
          <Link
            href="/projects"
            className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            View all projects
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {data?.recentDeployments.length ? (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Deployments</h2>
          </div>
          {data.recentDeployments.map((d) => (
            <DeploymentRow key={d.id} deployment={d} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: '/projects/new',
            icon: Zap,
            title: 'New Deployment',
            desc: 'Deploy from GitHub or upload files',
          },
          {
            href: '/projects/new',
            icon: GitBranch,
            title: 'Connect Repo',
            desc: 'Link GitHub repositories',
          },
          {
            href: '/domains',
            icon: Globe,
            title: 'Manage Domains',
            desc: 'Configure custom domains & SSL',
          },
        ].map((action) => (
          <Link key={action.title} href={action.href}>
            <motion.div
              whileHover={{ y: -2 }}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <action.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-medium text-foreground">{action.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{action.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
