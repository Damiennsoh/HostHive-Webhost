'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Building2, Key, CreditCard, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [name, setName] = useState(user?.username ?? '')
  const [email] = useState(user?.email ?? '')
  const [username, setUsername] = useState(user?.username ?? '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <nav className="w-full lg:w-56 shrink-0">
          <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Profile Information</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your account profile information
                </p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-muted border-border text-foreground max-w-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      className="bg-muted border-border text-muted-foreground max-w-md cursor-not-allowed opacity-70"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support to update.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-muted border-border text-foreground max-w-md"
                    />
                  </div>

                  <Button className="bg-white text-black hover:bg-white/90">
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Profile Picture</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a new avatar for your profile
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-semibold text-foreground">
                    {name.charAt(0)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-border text-foreground">
                      Upload
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Change Password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>

                <div className="mt-6 space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword" className="text-foreground">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      className="bg-muted border-border text-foreground"
                    />
                  </div>

                  <Button className="bg-white text-black hover:bg-white/90">
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Two-Factor Authentication</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>

                <div className="mt-6">
                  <Button variant="outline" className="border-border text-foreground">
                    Enable 2FA
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Active Sessions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your active login sessions
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-md bg-muted p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Current Session</p>
                      <p className="text-xs text-muted-foreground">Chrome on macOS - San Francisco, US</p>
                    </div>
                    <span className="text-xs text-emerald-400">Active now</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-muted p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Mobile App</p>
                      <p className="text-xs text-muted-foreground">iPhone 15 Pro - 2 days ago</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-400 hover:bg-red-500/10">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'organizations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-foreground">Organizations</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage your team organizations
                    </p>
                  </div>
                  <Button className="bg-white text-black hover:bg-white/90">
                    Create Organization
                  </Button>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { name: 'Personal', role: 'Owner', members: 1, plan: 'Pro' },
                    { name: 'Acme Corp', role: 'Admin', members: 12, plan: 'Enterprise' },
                    { name: 'Startup Inc', role: 'Member', members: 5, plan: 'Free' },
                  ].map((org) => (
                    <div
                      key={org.name}
                      className="flex items-center justify-between rounded-md border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{org.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {org.members} member{org.members !== 1 ? 's' : ''} - {org.plan}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {org.role}
                        </span>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'api-keys' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-foreground">API Keys</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage API keys for programmatic access
                    </p>
                  </div>
                  <Button className="bg-white text-black hover:bg-white/90">
                    Create API Key
                  </Button>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { name: 'Production API Key', key: 'nxs_prod_...a1b2', lastUsed: '2 hours ago' },
                    { name: 'Development API Key', key: 'nxs_dev_...c3d4', lastUsed: '1 day ago' },
                  ].map((apiKey) => (
                    <div
                      key={apiKey.name}
                      className="flex items-center justify-between rounded-md border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{apiKey.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{apiKey.key}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          Last used {apiKey.lastUsed}
                        </span>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-400 hover:bg-red-500/10">
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Current Plan</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You are currently on the Pro plan
                </p>

                <div className="mt-6 flex items-center justify-between rounded-md bg-muted p-4">
                  <div>
                    <p className="text-xl font-semibold text-foreground">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">$20/month</p>
                  </div>
                  <Button variant="outline" className="border-border text-foreground">
                    Upgrade Plan
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Usage This Month</h2>

                <div className="mt-6 space-y-4">
                  {[
                    { label: 'Build Minutes', used: 847, total: 1000 },
                    { label: 'Bandwidth', used: 850, total: 1024, unit: 'GB' },
                    { label: 'Deployments', used: 142, total: 'Unlimited' },
                  ].map((usage) => (
                    <div key={usage.label}>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{usage.label}</span>
                        <span className="text-foreground">
                          {usage.used}{usage.unit ? ` ${usage.unit}` : ''} / {usage.total}{usage.unit && typeof usage.total === 'number' ? ` ${usage.unit}` : ''}
                        </span>
                      </div>
                      {typeof usage.total === 'number' && (
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-white"
                            style={{ width: `${(usage.used / usage.total) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Payment Method</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your payment methods
                </p>

                <div className="mt-6 flex items-center justify-between rounded-md bg-muted p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-14 items-center justify-center rounded bg-zinc-800 text-xs font-bold text-foreground">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Edit
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-medium text-foreground">Notification Preferences</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose what notifications you want to receive
                </p>

                <div className="mt-6 space-y-4">
                  {[
                    { id: 'deployments', label: 'Deployment notifications', description: 'Get notified when deployments succeed or fail' },
                    { id: 'security', label: 'Security alerts', description: 'Important security notifications about your account' },
                    { id: 'product', label: 'Product updates', description: 'New features and improvements' },
                    { id: 'marketing', label: 'Marketing emails', description: 'Tips and offers from HostHive' },
                  ].map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{pref.label}</p>
                        <p className="text-xs text-muted-foreground">{pref.description}</p>
                      </div>
                      <button
                        className="relative h-6 w-11 rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background data-[checked]:bg-white"
                        data-checked={pref.id !== 'marketing' ? true : undefined}
                      >
                        <span
                          className={cn(
                            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-zinc-400 transition-transform',
                            pref.id !== 'marketing' && 'translate-x-5 bg-black'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
