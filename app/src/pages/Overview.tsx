import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Zap,
  Globe,
  GitBranch,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects, activityEvents } from '@/data/mockData';
import type { DeploymentStatus } from '@/types';

function StatusIcon({ status }: { status: DeploymentStatus }) {
  switch (status) {
    case 'live':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'building':
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-amber-500" />;
    case 'stopped':
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  }
}

export default function Overview() {
  const navigate = useNavigate();

  const stats = {
    total: projects.length,
    live: projects.filter((p) => p.status === 'live').length,
    building: projects.filter((p) => p.status === 'building').length,
    failed: projects.filter((p) => p.status === 'failed').length,
  };

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="text-[hsl(240_5%_55%)] mt-1">
          Manage your deployments, monitor status, and scale your applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-dark">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(240_5%_55%)] font-medium uppercase tracking-wide">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[hsl(240_8%_14%)] flex items-center justify-center">
                <Zap className="h-5 w-5 text-[hsl(25_95%_53%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-dark">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(240_5%_55%)] font-medium uppercase tracking-wide">
                  Live
                </p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.live}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-dark">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(240_5%_55%)] font-medium uppercase tracking-wide">
                  Building
                </p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.building}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-dark">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(240_5%_55%)] font-medium uppercase tracking-wide">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.failed}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="card-dark lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[hsl(25_95%_53%)]" />
                <CardTitle className="text-white text-base">Recent Activity</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {activityEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 py-3 px-3 rounded-lg hover:bg-[hsl(240_8%_10%)] transition-colors"
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        event.status === 'success'
                          ? 'bg-emerald-500'
                          : event.status === 'error'
                          ? 'bg-red-500'
                          : event.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{event.message}</p>
                    <p className="text-xs text-[hsl(240_5%_55%)] mt-0.5">
                      {new Date(event.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="card-dark">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[hsl(25_95%_53%)]" />
                <CardTitle className="text-white text-base">Recent Projects</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(240_8%_10%)] transition-colors cursor-pointer group"
                >
                  <StatusIcon status={project.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white group-hover:text-[hsl(25_95%_53%)] transition-colors truncate">
                        {project.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <GitBranch className="h-3 w-3 text-[hsl(240_5%_55%)]" />
                      <span className="text-xs text-[hsl(240_5%_55%)]">{project.branch}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[hsl(240_5%_55%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="w-full mt-3 py-2 text-sm text-[hsl(25_95%_53%)] hover:text-[hsl(25_95%_60%)] font-medium transition-colors"
            >
              View all projects →
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/deploy')}
          className="flex items-center gap-4 p-4 rounded-xl card-dark hover:border-[hsl(25_95%_53%/0.3)] transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white group-hover:text-[hsl(25_95%_53%)] transition-colors">
              New Deployment
            </p>
            <p className="text-xs text-[hsl(240_5%_55%)] mt-0.5">
              Deploy from GitHub or upload files
            </p>
          </div>
        </button>
        <button
          onClick={() => navigate('/github-connect')}
          className="flex items-center gap-4 p-4 rounded-xl card-dark hover:border-[hsl(25_95%_53%/0.3)] transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-lg bg-[hsl(240_8%_14%)] flex items-center justify-center">
            <GitBranch className="h-6 w-6 text-[hsl(25_95%_53%)]" />
          </div>
          <div>
            <p className="font-semibold text-white group-hover:text-[hsl(25_95%_53%)] transition-colors">
              Connect Repo
            </p>
            <p className="text-xs text-[hsl(240_5%_55%)] mt-0.5">
              Link GitHub repositories
            </p>
          </div>
        </button>
        <button
          onClick={() => navigate('/domains')}
          className="flex items-center gap-4 p-4 rounded-xl card-dark hover:border-[hsl(25_95%_53%/0.3)] transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-lg bg-[hsl(240_8%_14%)] flex items-center justify-center">
            <Globe className="h-6 w-6 text-[hsl(25_95%_53%)]" />
          </div>
          <div>
            <p className="font-semibold text-white group-hover:text-[hsl(25_95%_53%)] transition-colors">
              Manage Domains
            </p>
            <p className="text-xs text-[hsl(240_5%_55%)] mt-0.5">
              Configure custom domains & SSL
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
