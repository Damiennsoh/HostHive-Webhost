'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Settings, Crown, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockOrganizations } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function OrganizationsPage() {
  const [selectedOrg, setSelectedOrg] = useState(mockOrganizations[0].id)

  const currentOrg = mockOrganizations.find(o => o.id === selectedOrg) || mockOrganizations[0]

  const mockMembers = [
    { id: '1', name: 'Developer', email: 'developer@example.com', role: 'Owner', avatar: 'D' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', avatar: 'J' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'Member', avatar: 'B' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your teams and collaborators
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-white/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Organizations List */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <span className="text-sm font-medium text-foreground">Your Organizations</span>
            </div>
            <div className="divide-y divide-border">
              {mockOrganizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrg(org.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                    selectedOrg === org.id
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-800 text-sm font-semibold text-foreground">
                    {org.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{org.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{org.plan} plan</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organization Details */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Organization Header */}
          <motion.div
            key={currentOrg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-2xl font-bold text-foreground">
                  {currentOrg.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{currentOrg.name}</h2>
                  <p className="text-sm text-muted-foreground">@{currentOrg.slug}</p>
                  <span className={cn(
                    'mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                    currentOrg.plan === 'enterprise' 
                      ? 'bg-amber-500/10 text-amber-400'
                      : currentOrg.plan === 'pro'
                      ? 'bg-white/10 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {currentOrg.plan} Plan
                  </span>
                </div>
              </div>
              <Button variant="outline" className="border-border text-foreground">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </motion.div>

          {/* Members */}
          <motion.div
            key={`members-${currentOrg.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Members</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {mockMembers.length}
                </span>
              </div>
              <Button size="sm" className="bg-white text-black hover:bg-white/90">
                <Plus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </div>

            <div className="divide-y divide-border">
              {mockMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      member.role === 'Owner' 
                        ? 'bg-amber-500/10 text-amber-400'
                        : member.role === 'Admin'
                        ? 'bg-white/10 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {member.role === 'Owner' && <Crown className="h-3 w-3" />}
                      {member.role}
                    </span>
                    {member.role !== 'Owner' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          {currentOrg.id !== 'org_1' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-red-500/20 bg-red-500/5 p-6"
            >
              <h3 className="font-medium text-red-400">Danger Zone</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Leave or delete this organization. This action cannot be undone.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  Leave Organization
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
