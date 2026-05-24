'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Folder, Rocket, Globe, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MetricsCard } from '@/components/metrics-card'
import { ProjectCard } from '@/components/project-card'
import { DeploymentRow } from '@/components/deployment-row'
import { mockProjects, mockDeployments, mockMetrics } from '@/lib/mock-data'

export default function DashboardPage() {
  const recentDeployments = mockDeployments.slice(0, 5)
  const recentProjects = mockProjects.slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Here&apos;s an overview of your projects.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-white text-black hover:bg-white/90">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Projects"
          value={mockMetrics.totalProjects}
          icon={<Folder className="h-4 w-4" />}
          trend={{ value: '12%', positive: true }}
        />
        <MetricsCard
          title="Deployments"
          value={mockMetrics.totalDeployments}
          icon={<Rocket className="h-4 w-4" />}
          trend={{ value: '8%', positive: true }}
        />
        <MetricsCard
          title="Domains"
          value={mockMetrics.totalDomains}
          icon={<Globe className="h-4 w-4" />}
        />
        <MetricsCard
          title="Build Minutes"
          value={mockMetrics.buildMinutes}
          subtitle="this month"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Recent Deployments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Deployments</h2>
          <Link
            href="/deployments"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 rounded-lg border border-border bg-card">
          {recentDeployments.map((deployment) => (
            <DeploymentRow key={deployment.id} deployment={deployment} />
          ))}
        </div>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {recentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
