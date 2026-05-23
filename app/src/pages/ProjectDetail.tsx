import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  GitBranch,
  ExternalLink,
  Variable,
  Globe,
  Trash2,
  RefreshCw,
  Settings2,
  Copy,
  Check,
  Terminal,
  Calendar,
  Timer,
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projects, envVars, deploymentLogs, domains } from '@/data/mockData';
import type { DeploymentStatus } from '@/types';

function StatusBadge({ status }: { status: DeploymentStatus }) {
  const styles = {
    live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    building: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    stopped: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const icons = {
    live: CheckCircle2,
    building: Loader2,
    failed: XCircle,
    pending: Clock,
    stopped: Clock,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      <Icon className={`h-3.5 w-3.5 ${status === 'building' ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const projectEnvVars = envVars.filter((e) => e.projectId === id);
  const projectDomains = domains.filter((d) => d.projectId === id);
  const logs = deploymentLogs;

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-[hsl(240_5%_55%)]">Project not found</p>
        <button onClick={() => navigate('/projects')} className="mt-4 text-[hsl(25_95%_53%)] hover:underline">
          Back to projects
        </button>
      </div>
    );
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(project.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg hover:bg-[hsl(240_8%_12%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(240_8%_14%)] flex items-center justify-center text-xl font-bold text-[hsl(25_95%_53%)]">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{project.name}</h2>
                <StatusBadge status={project.status} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <GitBranch className="h-3.5 w-3.5 text-[hsl(240_5%_55%)]" />
                <span className="text-xs text-[hsl(240_5%_55%)]">
                  {project.branch} · {project.commit}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {project.status === 'live' && (
            <button
              onClick={() => window.open(project.url, '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(240_8%_14%)] text-white text-sm font-medium hover:bg-[hsl(240_8%_18%)] transition-colors border border-[hsl(240_6%_18%)]"
            >
              <ExternalLink className="h-4 w-4" />
              Visit
            </button>
          )}
          <button
            onClick={() => navigate(`/env-vars/${project.id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(240_8%_14%)] text-white text-sm font-medium hover:bg-[hsl(240_8%_18%)] transition-colors border border-[hsl(240_6%_18%)]"
          >
            <Variable className="h-4 w-4" />
            Env Vars
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <RefreshCw className="h-4 w-4" />
            Redeploy
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[hsl(240_8%_12%)] border border-[hsl(240_6%_18%)]">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[hsl(25_95%_53%)] data-[state=active]:text-white text-[hsl(240_5%_65%)]"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="data-[state=active]:bg-[hsl(25_95%_53%)] data-[state=active]:text-white text-[hsl(240_5%_65%)]"
          >
            Logs
          </TabsTrigger>
          <TabsTrigger
            value="domains"
            className="data-[state=active]:bg-[hsl(25_95%_53%)] data-[state=active]:text-white text-[hsl(240_5%_65%)]"
          >
            Domains
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-[hsl(25_95%_53%)] data-[state=active]:text-white text-[hsl(240_5%_65%)]"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="card-dark">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-[hsl(240_5%_55%)] mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Last Deployed</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {project.lastDeployed !== '—'
                    ? new Date(project.lastDeployed).toLocaleString()
                    : 'Never'}
                </p>
              </CardContent>
            </Card>
            <Card className="card-dark">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-[hsl(240_5%_55%)] mb-2">
                  <Timer className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Build Time</span>
                </div>
                <p className="text-sm font-medium text-white">{project.buildTime}</p>
              </CardContent>
            </Card>
            <Card className="card-dark">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-[hsl(240_5%_55%)] mb-2">
                  <GitBranch className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Commit</span>
                </div>
                <p className="text-sm font-medium text-white font-mono">{project.commit}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-dark">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Project URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm bg-[hsl(240_8%_12%)] px-3 py-2 rounded-lg text-[hsl(25_95%_53%)] font-mono border border-[hsl(240_6%_18%)]">
                  {project.url}
                </code>
                <button
                  onClick={copyUrl}
                  className="p-2 rounded-lg hover:bg-[hsl(240_8%_14%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => window.open(project.url, '_blank')}
                  className="p-2 rounded-lg hover:bg-[hsl(240_8%_14%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="card-dark">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Environment Variables</CardTitle>
              </CardHeader>
              <CardContent>
                {projectEnvVars.length > 0 ? (
                  <div className="space-y-2">
                    {projectEnvVars.map((env) => (
                      <div
                        key={env.id}
                        className="flex items-center justify-between py-2 border-b border-[hsl(240_6%_14%)] last:border-0"
                      >
                        <span className="text-sm font-mono text-white">{env.key}</span>
                        <span className="text-sm text-[hsl(240_5%_55%)]">
                          {env.encrypted ? '••••••••' : env.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[hsl(240_5%_55%)]">No environment variables configured</p>
                )}
                <button
                  onClick={() => navigate(`/env-vars/${project.id}`)}
                  className="mt-3 text-sm text-[hsl(25_95%_53%)] hover:text-[hsl(25_95%_60%)] font-medium transition-colors"
                >
                  Manage variables →
                </button>
              </CardContent>
            </Card>

            <Card className="card-dark">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Domains</CardTitle>
              </CardHeader>
              <CardContent>
                {projectDomains.length > 0 ? (
                  <div className="space-y-2">
                    {projectDomains.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between py-2 border-b border-[hsl(240_6%_14%)] last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-[hsl(240_5%_55%)]" />
                          <span className="text-sm text-white">{d.domain}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            d.ssl === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {d.ssl}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[hsl(240_5%_55%)]">No custom domains configured</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="mt-4">
          <Card className="card-dark">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-[hsl(25_95%_53%)]" />
                <CardTitle className="text-white text-base">Deployment Logs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[hsl(240_14%_3%)] rounded-lg p-4 font-mono text-sm space-y-1 overflow-x-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="text-[hsl(240_5%_35%)] text-xs flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`${
                        log.level === 'success'
                          ? 'text-emerald-400'
                          : log.level === 'error'
                          ? 'text-red-400'
                          : log.level === 'warn'
                          ? 'text-amber-400'
                          : 'text-[hsl(240_5%_65%)]'
                      }`}
                    >
                      {log.level === 'success' && '✓ '}
                      {log.level === 'error' && '✗ '}
                      {log.level === 'warn' && '⚠ '}
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="mt-4">
          <Card className="card-dark">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Custom Domains</CardTitle>
            </CardHeader>
            <CardContent>
              {projectDomains.length > 0 ? (
                <div className="space-y-3">
                  {projectDomains.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[hsl(240_8%_10%)] border border-[hsl(240_6%_14%)]"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-[hsl(25_95%_53%)]" />
                        <div>
                          <p className="text-sm font-medium text-white">{d.domain}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                d.ssl === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : d.ssl === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}
                            >
                              SSL: {d.ssl}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                d.dns === 'verified'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              DNS: {d.dns}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-[hsl(240_8%_14%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors">
                        <Settings2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-10 w-10 text-[hsl(240_5%_35%)] mx-auto mb-3" />
                  <p className="text-[hsl(240_5%_55%)]">No custom domains</p>
                  <button className="mt-3 text-sm text-[hsl(25_95%_53%)] hover:underline">
                    Add a domain →
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card className="card-dark">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Build Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Framework</label>
                <p className="text-sm text-white">{project.framework}</p>
              </div>
              <div>
                <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Languages</label>
                <div className="flex gap-1">
                  {project.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-1 rounded text-xs font-medium bg-[hsl(240_8%_14%)] text-[hsl(240_5%_65%)]"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Type</label>
                <p className="text-sm text-white capitalize">{project.type}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-dark border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-400 text-base">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <div>
                  <p className="text-sm font-medium text-white">Delete Project</p>
                  <p className="text-xs text-[hsl(240_5%_55%)]">
                    This will permanently delete the project and all its data
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
