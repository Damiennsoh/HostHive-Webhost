'use client'

import { useEffect, use, useState } from 'react'
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
  Rocket,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { DeploymentRow } from '@/components/deployment-row'
import { FrameworkIcon } from '@/components/framework-icon'
import { cn } from '@/lib/utils'
import { mapDbProjectToUi, mapDbDeploymentToUi } from '@/lib/map-db'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'deployments', label: 'Deployments', icon: Rocket },
  { id: 'domains', label: 'Domains', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function ServiceDetailPage({ params }: { params: Promise<{ groupId: string; serviceId: string }> }) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState('overview')
  const [project, setProject] = useState<any>(null)
  const [deployments, setDeployments] = useState<any[]>([])
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeploying, setIsDeploying] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [projectRes, deploymentsRes, domainsRes] = await Promise.all([
          fetch(`/api/projects/${resolvedParams.serviceId}`),
          fetch(`/api/projects/${resolvedParams.serviceId}/deployments`),
          fetch(`/api/projects/${resolvedParams.serviceId}/domains`),
        ])

        const [projectData, deploymentsData, domainsData] = await Promise.all([
          projectRes.json(),
          deploymentsRes.json(),
          domainsRes.json(),
        ])

        if (projectData.success) setProject(mapDbProjectToUi(projectData.project))
        if (deploymentsData.success) {
          setDeployments(deploymentsData.deployments.map((d: any) => mapDbDeploymentToUi(d, projectData.project)))
        }
        if (domainsData.success) setDomains(domainsData.domains)
      } catch (err) {
        console.error('[Fetch Service Detail]', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.serviceId])

  const handleManualDeploy = async () => {
    setIsDeploying(true)
    try {
      const res = await fetch(`/api/projects/${resolvedParams.serviceId}/deployments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggered_by: 'manual' }),
      })
      const data = await res.json()
      if (data.success) {
        const deploymentsRes = await fetch(`/api/projects/${resolvedParams.serviceId}/deployments`)
        const deploymentsData = await deploymentsRes.json()
        if (deploymentsData.success) {
          setDeployments(deploymentsData.deployments.map((d: any) => mapDbDeploymentToUi(d, project)))
        }
      }
    } catch (err) {
      console.error('[Manual Deploy]', err)
    } finally {
      setIsDeploying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link href={`/projects/${resolvedParams.groupId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <h2 className="text-xl font-semibold text-foreground">Service not found</h2>
          <p className="mt-2 text-muted-foreground">The service you are looking for does not exist or you do not have permission to view it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${resolvedParams.groupId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
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
            <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-border text-foreground">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </Button>
            </a>
            <Button 
              onClick={handleManualDeploy}
              disabled={isDeploying}
              className="bg-white text-black hover:bg-white/90"
            >
              {isDeploying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}
              Deploy
            </Button>
          </div>
        </div>
      </div>

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
                    layoutId="service-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-medium text-foreground">Recent Deployments</h3>
              </div>
              {deployments.length > 0 ? (
                deployments.slice(0, 5).map((deployment) => (
                  <DeploymentRow key={deployment.id} deployment={deployment} showProject={false} />
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No deployments yet</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-foreground">Service Details</h3>
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
          </div>
        </motion.div>
      )}

      {activeTab === 'deployments' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card"
        >
          {deployments.length > 0 ? (
            deployments.map((deployment) => (
              <DeploymentRow key={deployment.id} deployment={deployment} showProject={false} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No deployments yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Push to your repository to trigger a deployment</p>
            </div>
          )}
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
            <p className="mt-1 text-sm text-muted-foreground">Manage your service settings and configuration</p>
            <div className="mt-4">
              <Button variant="outline" className="border-border text-foreground">Edit Settings</Button>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
            <h3 className="font-medium text-red-400">Danger Zone</h3>
            <p className="mt-1 text-sm text-muted-foreground">Permanently delete this service and all of its data</p>
            <div className="mt-4">
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">Delete Service</Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
