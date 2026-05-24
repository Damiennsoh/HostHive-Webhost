'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeploymentRow } from '@/components/deployment-row'
import { mockDeployments } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Deployment } from '@/lib/types'

export default function DeploymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDeployment, setExpandedDeployment] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredDeployments = mockDeployments.filter((deployment) => {
    const matchesSearch = 
      deployment.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deployment.commit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deployment.commitMessage.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || deployment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const toggleExpand = (deploymentId: string) => {
    setExpandedDeployment(expandedDeployment === deploymentId ? null : deploymentId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Deployments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor and manage your deployment history
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search deployments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted border-border pl-9 text-foreground placeholder:text-muted-foreground focus:border-zinc-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border">
            {['all', 'ready', 'building', 'error'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status === 'all' ? null : status)}
                className={cn(
                  'px-3 py-2 text-xs font-medium capitalize transition-colors first:rounded-l-md last:rounded-r-md',
                  (status === 'all' && !statusFilter) || statusFilter === status
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Deployments List */}
      <div className="rounded-lg border border-border bg-card">
        {filteredDeployments.length > 0 ? (
          filteredDeployments.map((deployment) => (
            <div key={deployment.id}>
              <div 
                className="cursor-pointer"
                onClick={() => toggleExpand(deployment.id)}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <DeploymentRow deployment={deployment} />
                  </div>
                  <div className="px-4">
                    {expandedDeployment === deployment.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedDeployment === deployment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border bg-muted/30 px-4 py-4"
                >
                  <DeploymentDetails deployment={deployment} />
                </motion.div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No deployments found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || statusFilter 
                ? 'Try adjusting your filters' 
                : 'Deploy your first project to see it here'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DeploymentDetails({ deployment }: { deployment: Deployment }) {
  const logs = deployment.logs || [
    '> Cloning repository...',
    '> Installing dependencies...',
    '> npm install',
    '> Building application...',
    '> npm run build',
    '> Build completed successfully',
    '> Deploying to production...',
    `> Deployed to ${deployment.url || 'production'}`,
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Deployment URL</p>
          <p className="mt-1 text-sm text-foreground">
            {deployment.url || 'Not available'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="mt-1 text-sm text-foreground">
            {deployment.duration > 0 ? `${deployment.duration}s` : 'In progress'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Source</p>
          <p className="mt-1 text-sm text-foreground">
            {deployment.branch} @ {deployment.commit}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-muted-foreground">Build Logs</p>
        <div className="terminal max-h-48 overflow-y-auto p-4">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={cn(
                'text-xs leading-relaxed',
                log.includes('Error') || log.includes('failed')
                  ? 'text-red-400'
                  : log.includes('successfully') || log.includes('Deployed')
                  ? 'text-emerald-400'
                  : 'text-muted-foreground'
              )}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
