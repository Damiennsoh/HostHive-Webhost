'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Globe, ExternalLink, Trash2, RefreshCw, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockDomains, mockProjects } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function DomainsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDomains = mockDomains.filter((domain) =>
    domain.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getProjectName = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    return project?.name || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Domains</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage custom domains for your projects
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-white/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search domains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted border-border pl-9 text-foreground placeholder:text-muted-foreground focus:border-zinc-600"
        />
      </div>

      {/* Domains List */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {filteredDomains.length} Domain{filteredDomains.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {filteredDomains.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredDomains.map((domain, index) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://${domain.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:underline"
                      >
                        {domain.domain}
                      </a>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getProjectName(domain.projectId)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* SSL Status */}
                  <div className="flex items-center gap-2">
                    <Shield className={cn(
                      'h-4 w-4',
                      domain.ssl ? 'text-emerald-400' : 'text-amber-400'
                    )} />
                    <span className="text-xs text-muted-foreground">
                      {domain.ssl ? 'SSL Active' : 'SSL Pending'}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                    domain.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : domain.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-red-500/10 text-red-400'
                  )}>
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      domain.status === 'active'
                        ? 'bg-emerald-400'
                        : domain.status === 'pending'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-red-400'
                    )} />
                    {domain.status === 'active' ? 'Active' : domain.status === 'pending' ? 'Pending' : 'Error'}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Globe className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {searchQuery ? 'No domains found' : 'No domains yet'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Add a custom domain to your project'}
            </p>
            {!searchQuery && (
              <Button className="mt-4 bg-white text-black hover:bg-white/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Domain
              </Button>
            )}
          </div>
        )}
      </div>

      {/* DNS Configuration Help */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-medium text-foreground">DNS Configuration</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          To connect a custom domain, add the following DNS records:
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium text-muted-foreground">Type</th>
                <th className="pb-2 text-left font-medium text-muted-foreground">Name</th>
                <th className="pb-2 text-left font-medium text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 font-mono text-foreground">A</td>
                <td className="py-2 font-mono text-foreground">@</td>
                <td className="py-2 font-mono text-muted-foreground">76.76.21.21</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-foreground">CNAME</td>
                <td className="py-2 font-mono text-foreground">www</td>
                <td className="py-2 font-mono text-muted-foreground">cname.nexuscloud.app</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
