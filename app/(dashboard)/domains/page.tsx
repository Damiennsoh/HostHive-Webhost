'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Globe, ExternalLink, Trash2, Shield, Copy, Check } from 'lucide-react'
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
import { getDefaultPlatformRecords, type DnsRecord } from '@/lib/dns-config'
import { cn } from '@/lib/utils'
import type { DbProject } from '@/types/supabase'

interface DomainRow {
  id: string
  domain: string
  cname_target: string
  verification_status: string
  ssl_status: string
  project_id: string
  projects?: { name: string; slug: string } | null
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainRow[]>([])
  const [projects, setProjects] = useState<DbProject[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [domainName, setDomainName] = useState('')
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const load = () => {
    Promise.all([fetch('/api/domains'), fetch('/api/projects')])
      .then(async ([dRes, pRes]) => {
        const dJson = await dRes.json()
        const pJson = await pRes.json()
        if (dJson.success) setDomains(dJson.domains)
        if (pJson.success) setProjects(pJson.projects)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = domains.filter((d) =>
    d.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = async () => {
    setError('')
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, domain: domainName }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(typeof json.error === 'string' ? json.error : 'Failed to add domain')
      return
    }
    setDnsRecords(json.dnsRecords ?? [])
    setDomainName('')
    load()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/domains?id=${id}`, { method: 'DELETE' })
    load()
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Domains</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add custom domains with CNAME, A, and TXT verification records
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add custom domain</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="app.example.com"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {dnsRecords.length > 0 && (
                <DnsTable records={dnsRecords} copied={copied} onCopy={copy} />
              )}
              <Button
                className="w-full bg-primary text-primary-foreground"
                disabled={!projectId || !domainName}
                onClick={handleAdd}
              >
                Add domain &amp; show DNS records
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search domains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted border-border pl-9"
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <p className="p-8 text-sm text-muted-foreground">Loading domains…</p>
        ) : filtered.length ? (
          <div className="divide-y divide-border">
            {filtered.map((domain) => (
              <div
                key={domain.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
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
                    {domain.projects?.name ?? 'Project'} → {domain.cname_target}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield
                      className={cn(
                        'h-3.5 w-3.5',
                        domain.ssl_status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                      )}
                    />
                    SSL {domain.ssl_status}
                  </span>
                  <span className="text-xs text-muted-foreground">{domain.verification_status}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-400"
                    onClick={() => handleDelete(domain.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <Globe className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">No domains yet.</p>
            <Link href="/projects/new" className="mt-2 text-sm text-primary hover:underline">
              Create a project first
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-medium text-foreground">Default DNS records (all projects)</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Like Vercel — configure Type, Name, and Value at your registrar:
        </p>
        <div className="mt-4">
          <DnsTable records={getDefaultPlatformRecords()} copied={copied} onCopy={copy} />
        </div>
      </div>
    </div>
  )
}

function DnsTable({
  records,
  copied,
  onCopy,
}: {
  records: DnsRecord[]
  copied: string | null
  onCopy: (text: string, key: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Value</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Purpose</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((r) => {
            const key = `${r.type}-${r.name}`
            return (
              <tr key={key}>
                <td className="px-3 py-2 font-mono text-primary">{r.type}</td>
                <td className="px-3 py-2 font-mono">{r.name}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    {r.value}
                    <button
                      type="button"
                      onClick={() => onCopy(r.value, key)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copied === key ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{r.purpose}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
