'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Copy, Eye, EyeOff, Trash2, Key, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mockAPIKeys } from '@/lib/mock-data'

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState(mockAPIKeys)
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const copyKey = async (keyId: string, key: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const createKey = () => {
    if (!newKeyName.trim()) return
    
    const newKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `nxs_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
    }
    
    setApiKeys([...apiKeys, newKey])
    setNewKeyName('')
    setShowNewKeyForm(false)
  }

  const deleteKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== keyId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage API keys for programmatic access to Lynx Host
          </p>
        </div>
        <Button 
          onClick={() => setShowNewKeyForm(true)}
          className="bg-white text-black hover:bg-white/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {/* New Key Form */}
      {showNewKeyForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <h3 className="font-medium text-foreground">Create New API Key</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Give your API key a name to help you remember what it&apos;s used for.
          </p>

          <div className="mt-4 flex gap-4">
            <div className="flex-1">
              <Label htmlFor="keyName" className="sr-only">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button onClick={createKey} className="bg-white text-black hover:bg-white/90">
              Create
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowNewKeyForm(false)
                setNewKeyName('')
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* API Keys List */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Your API Keys</span>
          </div>
        </div>

        {apiKeys.length > 0 ? (
          <div className="divide-y divide-border">
            {apiKeys.map((apiKey, index) => (
              <motion.div
                key={apiKey.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between px-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{apiKey.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="font-mono text-xs text-muted-foreground">
                      {visibleKeys.has(apiKey.id) 
                        ? apiKey.key 
                        : `${apiKey.key.slice(0, 8)}${'•'.repeat(16)}`}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyKey(apiKey.id, apiKey.key)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copiedKey === apiKey.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {apiKey.lastUsed && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteKey(apiKey.id)}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revoke
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Key className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No API keys</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an API key to get started with the Lynx Host API
            </p>
            <Button 
              onClick={() => setShowNewKeyForm(true)}
              className="mt-4 bg-white text-black hover:bg-white/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </div>
        )}
      </div>

      {/* Documentation Link */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-medium text-foreground">API Documentation</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Learn how to use the Lynx Host API to automate your deployments.
        </p>
        <Button variant="outline" className="mt-4 border-border text-foreground">
          View Documentation
        </Button>
      </div>
    </div>
  )
}

