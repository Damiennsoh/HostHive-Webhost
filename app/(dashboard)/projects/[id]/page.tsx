'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  GitBranch, 
  Globe, 
  ExternalLink, 
  Settings,
  Activity,
  Clock,
  Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { DeploymentRow } from '@/components/deployment-row'
import { FrameworkIcon } from '@/components/framework-icon'
import { mockProjects, mockDeployments, mockDomains } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'deployments', label: 'Deployments', icon: Rocket },
  { id: 'domains', label: 'Domains', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState('overview')
  
  const project = mockProjects.find(p => p.id === resolvedParams.id) || mockProjects[0]
  const projectDeployments = mockDeployments.filter(d => d.projectId === project.id)
  const projectDomains = mockDomains.filter(d => d.projectId === project.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <FrameworkIcon framework={project.framework} className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
                <StatusBadge status={project.status} />
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <a 
                    href={`https://${project.domain}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    {project.domain}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>{project.branch}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <a
              href={`https://${project.domain}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-border text-foreground">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </Button>
            </a>
            <Button className="bg-white text-black hover:bg-white/90">
              <Rocket className="mr-2 h-4 w-4" />
              Deploy
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="project-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Activity */}
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-medium text-foreground">Recent Deployments</h3>
              </div>
              {projectDeployments.length > 0 ? (
                projectDeployments.slice(0, 5).map((deployment) => (
                  <DeploymentRow 
                    key={deployment.id} 
                    deployment={deployment} 
                    showProject={false}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No deployments yet
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-foreground">Project Details</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Framework</span>
                  <span className="text-foreground capitalize">{project.framework}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repository</span>
                  <span className="text-foreground">{project.repository}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Branch</span>
                  <span className="text-foreground">{project.branch}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Deployed</span>
                  <span className="text-foreground">{project.lastDeployment}</span>
                </div>
              </div>
            </div>

            {/* Domains */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-foreground">Domains</h3>
              <div className="mt-4 space-y-2">
                {projectDomains.map((domain) => (
                  <div 
                    key={domain.id}
                    className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{domain.domain}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'deployments' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card"
        >
          {projectDeployments.length > 0 ? (
            projectDeployments.map((deployment) => (
              <DeploymentRow 
                key={deployment.id} 
                deployment={deployment} 
                showProject={false}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No deployments yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Push to your repository to trigger a deployment
              </p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'domains' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {projectDomains.length} domain{projectDomains.length !== 1 ? 's' : ''} configured
            </p>
            <Button className="bg-white text-black hover:bg-white/90">
              Add Domain
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card">
            {projectDomains.map((domain) => (
              <div 
                key={domain.id}
                className="flex items-center justify-between border-b border-border px-4 py-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{domain.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      SSL {domain.ssl ? 'enabled' : 'disabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                    domain.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  )}>
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      domain.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                    )} />
                    {domain.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-6"
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-medium text-foreground">General Settings</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your project settings and configuration
            </p>
            <div className="mt-4">
              <Button variant="outline" className="border-border text-foreground">
                Edit Settings
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
            <h3 className="font-medium text-red-400">Danger Zone</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete this project and all of its data
            </p>
            <div className="mt-4">
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                Delete Project
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
