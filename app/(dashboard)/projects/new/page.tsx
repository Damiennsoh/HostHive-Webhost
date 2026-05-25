'use client'

import { useState, useRef } from 'react'
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
  Rocket,
  Upload,
  FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { frameworkOptions, mockRepositories } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect } from 'react'

const steps = [
  { id: 1, title: 'Source', description: 'GitHub or local files' },
  { id: 2, title: 'Configure', description: 'Configure your project' },
  { id: 3, title: 'Environment', description: 'Set environment variables' },
  { id: 4, title: 'Deploy', description: 'Review and deploy' },
]

type DeploySource = 'github' | 'upload'

interface EnvVar {
  key: string
  value: string
  isSecret: boolean
}

const ENABLE_MOCK_REPOS = process.env.NEXT_PUBLIC_ENABLE_MOCK_REPOS === 'true'

export default function NewProjectPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [deploySource, setDeploySource] = useState<DeploySource>('github')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [projectName, setProjectName] = useState('')
  const [branch, setBranch] = useState('main')
  const [framework, setFramework] = useState('nextjs')
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: '', value: '', isSecret: false }
  ])
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState('')
  const [realRepos, setRealRepos] = useState<any[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)

  useEffect(() => {
    if (deploySource === 'github' && !ENABLE_MOCK_REPOS) {
      setLoadingRepos(true)
      // This endpoint will return real repositories for the authenticated user
      fetch('/api/github/repos')
        .then(r => r.json())
        .then(data => {
          if (data.repositories) setRealRepos(data.repositories)
        })
        .catch(err => {
          console.error('[Fetch Repos]', err)
          setError('Failed to fetch repositories. Ensure your GitHub account is connected.')
        })
        .finally(() => setLoadingRepos(false))
    }
  }, [deploySource])

  const repositories = ENABLE_MOCK_REPOS 
    ? mockRepositories 
    : realRepos

  const filteredRepos = (repositories || []).filter((repo: any) =>
    repo.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
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
    const repo = repositories.find((r: any) => r.id.toString() === repoId.toString())
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
      const isUpload = deploySource === 'upload'
      const repo = repositories.find((r: any) => r.id.toString() === selectedRepo?.toString())

      if (!isUpload && !repo) throw new Error('Select a repository first')
      if (isUpload && uploadedFiles.length === 0) throw new Error('Select files to upload')

      const projectType = isUpload
        ? 'static'
        : framework === 'docker'
          ? 'docker'
          : framework === 'static'
            ? 'static'
            : 'node'

      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          repository_url: isUpload ? undefined : `https://github.com/${repo!.fullName}`,
          repository_branch: branch,
          project_type: projectType,
          source: deploySource,
        }),
      })

      const createData = await createRes.json()
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create project')

      const projectId = createData.project.id as string

      if (isUpload) {
        const formData = new FormData()
        uploadedFiles.forEach((file) => formData.append('files', file))
        const uploadRes = await fetch(`/api/projects/${projectId}/upload`, {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload files')
      }

      for (const envVar of envVars.filter((v) => v.key.trim())) {
        await fetch(`/api/projects/${projectId}/env`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: envVar.key,
            value: envVar.value,
            is_secret: envVar.isSecret,
          }),
        }).catch(() => {})
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setUploadedFiles(files)
    if (files.length && !projectName) {
      const rootName = files[0].webkitRelativePath?.split('/')[0] ?? files[0].name.replace(/\.[^.]+$/, '')
      setProjectName(rootName.replace(/[^a-z0-9-]/gi, '-').toLowerCase())
    }
    if (deploySource === 'upload') setFramework('static')
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return deploySource === 'upload' ? uploadedFiles.length > 0 : selectedRepo !== null
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
                <h2 className="text-lg font-medium text-foreground">Choose deploy source</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deploy from GitHub or upload static files from your computer
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeploySource('github')}
                  className={cn(
                    'rounded-lg border p-4 text-left transition-colors',
                    deploySource === 'github'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <GitBranch className="mb-2 h-5 w-5 text-primary" />
                  <p className="font-medium text-foreground">GitHub</p>
                  <p className="text-xs text-muted-foreground">Auto-deploy on push</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeploySource('upload')}
                  className={cn(
                    'rounded-lg border p-4 text-left transition-colors',
                    deploySource === 'upload'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <Upload className="mb-2 h-5 w-5 text-primary" />
                  <p className="font-medium text-foreground">Local files</p>
                  <p className="text-xs text-muted-foreground">HTML, CSS, JS folder</p>
                </button>
              </div>

              {deploySource === 'github' && (
              <>
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
                {loadingRepos ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Fetching your repositories...</p>
                  </div>
                ) : filteredRepos.length > 0 ? (
                  filteredRepos.map((repo: any) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => handleRepoSelect(repo.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md border p-4 text-left transition-colors',
                        selectedRepo === repo.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {repo.private ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {repo.fullName || repo.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Updated {new Date(repo.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {selectedRepo === repo.id && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">No repositories found.</p>
                  </div>
                )}
              </div>
              </>
              )}

              {deploySource === 'upload' && (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <FolderOpen className="mx-auto h-10 w-10 text-primary" />
                  <p className="mt-4 font-medium text-foreground">Upload your static site</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a folder containing index.html, CSS, and JS files
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    // @ts-expect-error webkitdirectory is supported in Chromium browsers
                    webkitdirectory=""
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="button"
                    className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose folder
                  </Button>
                  {uploadedFiles.length > 0 && (
                    <p className="mt-3 text-sm text-emerald-400">
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
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
                  <span className="text-sm text-muted-foreground">Source</span>
                  <span className="text-sm font-medium text-foreground">
                    {deploySource === 'upload' ? 'Local files' : 'GitHub'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Repository</span>
                  <span className="text-sm font-medium text-foreground">
                    {deploySource === 'upload'
                      ? `${uploadedFiles.length} files`
                      : mockRepositories.find((r) => r.id === selectedRepo)?.fullName}
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
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
