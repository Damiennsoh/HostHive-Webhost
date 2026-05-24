'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Search, 
  Lock, 
  GitBranch,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mockRepositories, frameworkOptions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const steps = [
  { id: 1, title: 'Repository', description: 'Select your repository' },
  { id: 2, title: 'Configure', description: 'Configure your project' },
  { id: 3, title: 'Environment', description: 'Set environment variables' },
  { id: 4, title: 'Deploy', description: 'Review and deploy' },
]

interface EnvVar {
  key: string
  value: string
  isSecret: boolean
}

export default function NewProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [branch, setBranch] = useState('main')
  const [framework, setFramework] = useState('nextjs')
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: '', value: '', isSecret: false }
  ])
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState('')

  const filteredRepos = mockRepositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRepoSelect = (repoId: string) => {
    setSelectedRepo(repoId)
    const repo = mockRepositories.find(r => r.id === repoId)
    if (repo) {
      setProjectName(repo.name)
    }
  }

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '', isSecret: false }])
  }

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index))
  }

  const updateEnvVar = (index: number, field: keyof EnvVar, value: string | boolean) => {
    const newVars = [...envVars]
    newVars[index] = { ...newVars[index], [field]: value }
    setEnvVars(newVars)
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    setError('')

    try {
      const repo = mockRepositories.find((r) => r.id === selectedRepo)
      if (!repo) throw new Error('Select a repository first')

      const projectType =
        framework === 'docker' ? 'docker' : framework === 'static' ? 'static' : 'node'

      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          repository_url: `https://github.com/${repo.fullName}`,
          repository_branch: branch,
          project_type: projectType,
        }),
      })

      const createData = await createRes.json()
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create project')

      const projectId = createData.project.id as string

      for (const envVar of envVars.filter((v) => v.key.trim())) {
        await fetch(`/api/projects/${projectId}/env`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: envVar.key,
            value: envVar.value,
            is_secret: envVar.isSecret,
          }),
        })
      }

      const deployRes = await fetch(`/api/projects/${projectId}/deployments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch, triggered_by: 'manual' }),
      })

      const deployData = await deployRes.json()
      if (!deployRes.ok) throw new Error(deployData.error || 'Failed to trigger deployment')

      router.push(`/projects/${projectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed')
    } finally {
      setIsDeploying(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedRepo !== null
      case 2:
        return projectName.trim() !== ''
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Create New Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deploy your application in just a few steps
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                  currentStep > step.id
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : currentStep === step.id
                    ? 'border-white bg-white text-black'
                    : 'border-border bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="hidden sm:block">
                <p className={cn(
                  'text-sm font-medium',
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'mx-4 h-px w-8 sm:w-16 lg:w-24',
                currentStep > step.id ? 'bg-emerald-500' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-lg border border-border bg-card p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Repository Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-medium text-foreground">Select Repository</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a repository to deploy from GitHub
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-muted border-border pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto">
                {filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleRepoSelect(repo.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md border p-4 text-left transition-colors',
                      selectedRepo === repo.id
                        ? 'border-white bg-muted'
                        : 'border-border hover:border-zinc-600 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-800">
                        <GitBranch className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{repo.name}</span>
                          {repo.private && (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{repo.fullName}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{repo.language}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-medium text-foreground">Configure Project</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set up your project settings
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-foreground">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-foreground">Branch</Label>
                  <Input
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Framework</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {frameworkOptions.slice(0, 9).map((fw) => (
                      <button
                        key={fw.value}
                        onClick={() => setFramework(fw.value)}
                        className={cn(
                          'rounded-md border p-3 text-left text-sm transition-colors',
                          framework === fw.value
                            ? 'border-white bg-muted'
                            : 'border-border hover:border-zinc-600'
                        )}
                      >
                        <span className="font-medium text-foreground">{fw.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Environment Variables */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-medium text-foreground">Environment Variables</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add environment variables for your deployment
                </p>
              </div>

              <div className="space-y-3">
                {envVars.map((envVar, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="KEY"
                        value={envVar.key}
                        onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                        className="bg-muted border-border font-mono text-sm text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="relative">
                        <Input
                          type={envVar.isSecret ? 'password' : 'text'}
                          placeholder="value"
                          value={envVar.value}
                          onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                          className="bg-muted border-border pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => updateEnvVar(index, 'isSecret', !envVar.isSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {envVar.isSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEnvVar(index)}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={addEnvVar}
                className="border-border text-muted-foreground hover:text-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variable
              </Button>
            </motion.div>
          )}

          {/* Step 4: Review & Deploy */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-medium text-foreground">Review & Deploy</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirm your settings and deploy
                </p>
              </div>

              <div className="space-y-4 rounded-md border border-border bg-muted/50 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Project Name</span>
                  <span className="text-sm font-medium text-foreground">{projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Repository</span>
                  <span className="text-sm font-medium text-foreground">
                    {mockRepositories.find(r => r.id === selectedRepo)?.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Branch</span>
                  <span className="text-sm font-medium text-foreground">{branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Framework</span>
                  <span className="text-sm font-medium text-foreground">
                    {frameworkOptions.find(f => f.value === framework)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Environment Variables</span>
                  <span className="text-sm font-medium text-foreground">
                    {envVars.filter(v => v.key).length} configured
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full bg-white text-black hover:bg-white/90"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Deploy Project
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {currentStep < 4 && (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-white text-black hover:bg-white/90"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
