import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Rocket,
  Github,
  GitBranch,
  FolderOpen,
  Settings2,
  Variable,
  Globe,
  ChevronRight,
  Check,
  Loader2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { githubRepos, buildTemplates } from '@/data/mockData';

interface DeployForm {
  repo: string;
  branch: string;
  rootDir: string;
  framework: string;
  envVars: { key: string; value: string }[];
  domain: string;
}

const steps = [
  { id: 'repo', label: 'Repository', icon: Github },
  { id: 'config', label: 'Configuration', icon: Settings2 },
  { id: 'env', label: 'Environment', icon: Variable },
  { id: 'deploy', label: 'Deploy', icon: Rocket },
];

export default function NewDeployment() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRepo = (location.state as any)?.repo;

  const [currentStep, setCurrentStep] = useState(selectedRepo ? 1 : 0);
  const [form, setForm] = useState<DeployForm>({
    repo: selectedRepo?.fullName || '',
    branch: selectedRepo?.defaultBranch || 'main',
    rootDir: '/',
    framework: 'auto',
    envVars: [{ key: '', value: '' }],
    domain: '',
  });
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      setDeploying(false);
      setDeployed(true);
    }, 3000);
  };

  const addEnvVar = () => {
    setForm({ ...form, envVars: [...form.envVars, { key: '', value: '' }] });
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...form.envVars];
    updated[index][field] = value;
    setForm({ ...form, envVars: updated });
  };

  const removeEnvVar = (index: number) => {
    const updated = form.envVars.filter((_, i) => i !== index);
    setForm({ ...form, envVars: updated.length ? updated : [{ key: '', value: '' }] });
  };

  if (deployed) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Deployment Started!</h2>
        <p className="text-[hsl(240_5%_55%)] mb-6">
          Your project <span className="text-white font-medium">{form.repo.split('/')[1]}</span> is being
          deployed. You'll receive an email when it's live.
        </p>
        <div className="bg-[hsl(240_8%_12%)] rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[hsl(240_5%_55%)]">Project URL</span>
            <span className="text-xs text-emerald-400">Building...</span>
          </div>
          <code className="text-sm text-[hsl(25_95%_53%)] font-mono">
            https://{form.repo.split('/')[1]}-abc123.hostdesk.app
          </code>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-lg bg-[hsl(240_8%_14%)] text-white font-medium text-sm hover:bg-[hsl(240_8%_18%)] transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              setDeployed(false);
              setCurrentStep(0);
              setForm({
                repo: '',
                branch: 'main',
                rootDir: '/',
                framework: 'auto',
                envVars: [{ key: '', value: '' }],
                domain: '',
              });
            }}
            className="px-6 py-2.5 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Deploy Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (currentStep > 0) setCurrentStep(currentStep - 1);
            else navigate(-1);
          }}
          className="p-2 rounded-lg hover:bg-[hsl(240_8%_12%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">New Deployment</h2>
          <p className="text-[hsl(240_5%_55%)] text-sm">Deploy a new project from GitHub</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium flex-1 ${
                i === currentStep
                  ? 'bg-[hsl(25_95%_53%/0.15)] text-[hsl(25_95%_53%)] border border-[hsl(25_95%_53%/0.2)]'
                  : i < currentStep
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-[hsl(240_8%_12%)] text-[hsl(240_5%_55%)]'
              }`}
            >
              <step.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-[hsl(240_5%_35%)]" />}
          </div>
        ))}
      </div>

      {/* Step 1: Repository */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Select Repository</h3>
          <div className="space-y-2">
            {githubRepos.map((repo) => (
              <Card
                key={repo.id}
                className={`card-dark cursor-pointer transition-all ${
                  form.repo === repo.fullName
                    ? 'border-[hsl(25_95%_53%)] bg-[hsl(25_95%_53%/0.05)]'
                    : 'hover:border-[hsl(25_95%_53%/0.3)]'
                }`}
                onClick={() => {
                  setForm({ ...form, repo: repo.fullName, branch: repo.defaultBranch });
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[hsl(240_8%_14%)] flex items-center justify-center text-[hsl(25_95%_53%)] font-bold text-sm">
                        {repo.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{repo.name}</h4>
                        <p className="text-xs text-[hsl(240_5%_55%)]">{repo.fullName}</p>
                      </div>
                    </div>
                    {form.repo === repo.fullName && (
                      <Check className="h-5 w-5 text-[hsl(25_95%_53%)]" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <button
            onClick={() => form.repo && setCurrentStep(1)}
            disabled={!form.repo}
            className="w-full py-2.5 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Configuration */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Configuration</h3>

          <Card className="card-dark">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Repository</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(240_8%_12%)] border border-[hsl(240_6%_18%)] text-white text-sm">
                  <Github className="h-4 w-4 text-[hsl(240_5%_55%)]" />
                  {form.repo}
                </div>
              </div>

              <div>
                <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Branch</label>
                <div className="relative">
                  <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(240_5%_55%)]" />
                  <Input
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="pl-10 bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white focus-visible:ring-[hsl(25_95%_53%)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Root Directory</label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(240_5%_55%)]" />
                  <Input
                    value={form.rootDir}
                    onChange={(e) => setForm({ ...form, rootDir: e.target.value })}
                    placeholder="/"
                    className="pl-10 bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)]"
                  />
                </div>
                <p className="text-xs text-[hsl(240_5%_45%)] mt-1">
                  Leave as / if your app is at the root of the repository
                </p>
              </div>

              <div>
                <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Framework Preset</label>
                <Select value={form.framework} onValueChange={(v) => setForm({ ...form, framework: v })}>
                  <SelectTrigger className="bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white focus:ring-[hsl(25_95%_53%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(240_12%_8%)] border-[hsl(240_6%_18%)]">
                    {buildTemplates.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        className="text-white hover:bg-[hsl(240_8%_14%)] focus:bg-[hsl(240_8%_14%)]"
                      >
                        <div>
                          <span className="font-medium">{t.name}</span>
                          <span className="text-xs text-[hsl(240_5%_55%)] ml-2">{t.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(0)}
              className="flex-1 py-2.5 rounded-lg bg-[hsl(240_8%_14%)] text-white font-medium text-sm hover:bg-[hsl(240_8%_18%)] transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="flex-1 py-2.5 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Environment */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Environment Variables</h3>

          <Card className="card-dark">
            <CardContent className="p-4 space-y-3">
              {form.envVars.map((env, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="KEY"
                    value={env.key}
                    onChange={(e) => updateEnvVar(i, 'key', e.target.value.toUpperCase())}
                    className="bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)] font-mono text-sm"
                  />
                  <Input
                    placeholder="value"
                    value={env.value}
                    onChange={(e) => updateEnvVar(i, 'value', e.target.value)}
                    className="flex-1 bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)]"
                  />
                  <button
                    onClick={() => removeEnvVar(i)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[hsl(240_5%_55%)] hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addEnvVar}
                className="flex items-center gap-2 text-sm text-[hsl(25_95%_53%)] hover:text-[hsl(25_95%_60%)] font-medium transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Add Variable
              </button>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardContent className="p-4">
              <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Custom Domain (optional)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(240_5%_55%)]" />
                <Input
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  placeholder="your-domain.com"
                  className="pl-10 bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)]"
                />
              </div>
              <p className="text-xs text-[hsl(240_5%_45%)] mt-1">
                Leave empty to use a hostdesk.app subdomain
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 py-2.5 rounded-lg bg-[hsl(240_8%_14%)] text-white font-medium text-sm hover:bg-[hsl(240_8%_18%)] transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex-1 py-2.5 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Review & Deploy
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Deploy */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Review & Deploy</h3>

          <Card className="card-dark">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[hsl(240_6%_14%)]">
                <div className="w-12 h-12 rounded-lg bg-[hsl(25_95%_53%/0.15)] flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-[hsl(25_95%_53%)]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    {form.repo.split('/')[1] || 'Project'}
                  </h4>
                  <p className="text-sm text-[hsl(240_5%_55%)]">{form.repo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[hsl(240_5%_55%)]">Branch</p>
                  <p className="text-sm text-white font-medium">{form.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(240_5%_55%)]">Root Directory</p>
                  <p className="text-sm text-white font-medium">{form.rootDir}</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(240_5%_55%)]">Framework</p>
                  <p className="text-sm text-white font-medium">
                    {buildTemplates.find((t) => t.id === form.framework)?.name || 'Auto-Detect'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(240_5%_55%)]">Domain</p>
                  <p className="text-sm text-white font-medium">
                    {form.domain || 'Auto-generated'}
                  </p>
                </div>
              </div>

              {form.envVars.some((e) => e.key) && (
                <div className="pt-4 border-t border-[hsl(240_6%_14%)]">
                  <p className="text-xs text-[hsl(240_5%_55%)] mb-2">Environment Variables</p>
                  <div className="flex flex-wrap gap-1">
                    {form.envVars
                      .filter((e) => e.key)
                      .map((env, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-xs font-mono bg-[hsl(240_8%_14%)] text-[hsl(240_5%_65%)]"
                        >
                          {env.key}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={deploying}
              className="flex-1 py-2.5 rounded-lg bg-[hsl(240_8%_14%)] text-white font-medium text-sm hover:bg-[hsl(240_8%_18%)] transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="flex-1 py-2.5 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {deploying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Deploy Project
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
