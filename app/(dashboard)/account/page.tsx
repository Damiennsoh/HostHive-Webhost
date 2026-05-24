'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Edit2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('Developer')
  const [email, setEmail] = useState('developer@example.com')
  const [username, setUsername] = useState('developer')
  const [bio, setBio] = useState('Full-stack developer building amazing products.')

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-foreground">
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{name}</h2>
              <p className="text-sm text-muted-foreground">@{username}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {email}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined January 2024
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="border-border text-foreground"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4 border-t border-border pt-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editName" className="text-foreground">Full Name</Label>
                <Input
                  id="editName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUsername" className="text-foreground">Username</Label>
                <Input
                  id="editUsername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail" className="text-foreground">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editBio" className="text-foreground">Bio</Label>
              <textarea
                id="editBio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-zinc-600 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-white text-black hover:bg-white/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Projects', value: '6' },
          { label: 'Deployments', value: '142' },
          { label: 'Organizations', value: '3' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-border bg-card p-6"
      >
        <h3 className="font-medium text-foreground">Recent Activity</h3>
        <div className="mt-4 space-y-4">
          {[
            { action: 'Deployed marketing-site to production', time: '2 hours ago' },
            { action: 'Created new project dashboard-app', time: '1 day ago' },
            { action: 'Updated environment variables for api-gateway', time: '2 days ago' },
            { action: 'Added domain docs.hosthive.app', time: '3 days ago' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-foreground">{activity.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-lg border border-red-500/20 bg-red-500/5 p-6"
      >
        <h3 className="font-medium text-red-400">Danger Zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and all associated data
        </p>
        <div className="mt-4">
          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            Delete Account
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
