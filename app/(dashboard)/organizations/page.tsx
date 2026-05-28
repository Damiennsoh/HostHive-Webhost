'use client'

import { motion } from 'framer-motion'
import { Plus, Users, Settings, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

export default function OrganizationsPage() {
  const { user, organization } = useAuth()

  const personalOrg = organization ?? { id: 'org_personal', name: 'Personal', slug: 'personal', plan: 'free' as const }
  const members = user
    ? [{ id: user.id, name: user.username, email: user.email, role: 'Owner', avatar: user.username.charAt(0).toUpperCase() }]
    : []

  const planLabel: Record<string, string> = {
    free: 'Free', hobbt: 'Hobby', startup: 'Startup', pro: 'Pro', team: 'Team', enterprise: 'Enterprise',
  }

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
              <button className="flex w-full items-center gap-3 px-4 py-3 text-left bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-800 text-sm font-semibold text-foreground">
                  {personalOrg.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{personalOrg.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{planLabel[personalOrg.plan] ?? personalOrg.plan} plan</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Organization Details */}
        <div className="flex-1 min-w-0 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-2xl font-bold text-foreground">
                  {personalOrg.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{personalOrg.name}</h2>
                  <p className="text-sm text-muted-foreground">@{personalOrg.slug}</p>
                  <span className={cn(
                    'mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                    personalOrg.plan === 'enterprise'
                      ? 'bg-amber-500/10 text-amber-400'
                      : personalOrg.plan === 'pro'
                      ? 'bg-white/10 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {planLabel[personalOrg.plan] ?? personalOrg.plan} Plan
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
                  {members.length}
                </span>
              </div>
              <Button size="sm" className="bg-white text-black hover:bg-white/90">
                <Plus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </div>

            <div className="divide-y divide-border">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400">
                    <Crown className="h-3 w-3" />
                    Owner
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
