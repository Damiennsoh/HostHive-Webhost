'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Database, Plus, Trash2, Link2, Loader2, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DbProject } from '@/types/supabase'

interface ManagedDatabaseRow {
  id: string
  name: string
  db_type: 'postgresql' | 'mysql' | 'redis'
  status: string
  host: string | null
  port: number | null
  env_var_key: string
  internal_network: string | null
  project_id: string | null
  projects?: { name: string; slug: string } | null
}

const typeLabels = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  redis: 'Redis',
}

export default function DatabasesPage() {
  const [databases, setDatabases] = useState<ManagedDatabaseRow[]>([])
  const [projects, setProjects] = useState<DbProject[]>([])
  const [loading, setLoading] = useState(true)
  const [coolifyConfigured, setCoolifyConfigured] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [dbType, setDbType] = useState<'postgresql' | 'mysql' | 'redis'>('postgresql')
  const [linkProjectId, setLinkProjectId] = useState<Record<string, string>>({})

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([fetch('/api/databases'), fetch('/api/projects')])
      .then(async ([dbRes, projRes]) => {
        const dbJson = await dbRes.json()
        const projJson = await projRes.json()
        if (dbJson.success) {
          setDatabases(dbJson.databases ?? [])
          setCoolifyConfigured(Boolean(dbJson.coolifyConfigured))
        }
        if (projJson.success) {
          setProjects(projJson.projects ?? [])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, db_type: dbType }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create database')
      setName('')
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this database? Linked env vars are not removed automatically.')) return
    await fetch(`/api/databases/${id}`, { method: 'DELETE' })
    load()
  }

  const handleLink = async (dbId: string) => {
    const projectId = linkProjectId[dbId]
    if (!projectId) return
    const res = await fetch(`/api/databases/${dbId}/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    })
    const json = await res.json()
    if (!res.ok) alert(json.error || 'Link failed')
    else load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Databases</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            PostgreSQL, MySQL, and Redis — provisioned via Coolify with private networking
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Database
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle>Create managed database</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!coolifyConfigured && (
                <p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  Set COOLIFY_SERVER_UUID in .env.local for live provisioning. A placeholder
                  connection is stored until Coolify is configured.
                </p>
              )}
              {error && (
                <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
              )}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-app-db"
                  className="border-border bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={dbType} onValueChange={(v) => setDbType(v as typeof dbType)}>
                  <SelectTrigger className="border-border bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="redis">Redis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground"
                disabled={creating || !name.trim()}
                onClick={handleCreate}
              >
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create & provision
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading databases…</p>
      ) : databases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Database className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 font-medium">No databases yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add PostgreSQL, MySQL, or Redis and link to a project to auto-inject{' '}
            <code className="text-primary">DATABASE_URL</code>
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {databases.map((db) => (
            <motion.div
              key={db.id}
              layout
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{db.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {typeLabels[db.db_type]} · {db.status}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-400"
                  onClick={() => handleDelete(db.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {db.internal_network && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Network className="h-3.5 w-3.5" />
                  Private network: {db.internal_network}
                </div>
              )}

              {db.host && (
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {db.host}:{db.port} · env: {db.env_var_key}
                </p>
              )}

              {db.projects ? (
                <p className="mt-3 text-sm text-emerald-400">
                  Linked to {db.projects.name}
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Select
                    value={linkProjectId[db.id] ?? ''}
                    onValueChange={(v) =>
                      setLinkProjectId((prev) => ({ ...prev, [db.id]: v }))
                    }
                  >
                    <SelectTrigger className="border-border bg-muted text-sm">
                      <SelectValue placeholder="Link to project…" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border"
                    onClick={() => handleLink(db.id)}
                  >
                    <Link2 className="mr-1 h-3.5 w-3.5" />
                    Inject env
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Linking injects <code>DATABASE_URL</code>, <code>MYSQL_URL</code>, or{' '}
        <code>REDIS_URL</code> into your project and syncs to Coolify when connected.{' '}
        <Link href="/docs" className="text-primary hover:underline">
          Read the docs
        </Link>
      </p>
    </div>
  )
}
