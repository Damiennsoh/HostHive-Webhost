import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  GitBranch,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Settings2,
  Trash2,
  Variable,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { projects } from '@/data/mockData';
import type { DeploymentStatus } from '@/types';

const statusFilters: { label: string; value: DeploymentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'live' },
  { label: 'Building', value: 'building' },
  { label: 'Failed', value: 'failed' },
  { label: 'Pending', value: 'pending' },
];

function StatusBadge({ status }: { status: DeploymentStatus }) {
  const styles = {
    live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    building: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    stopped: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'live'
            ? 'bg-emerald-400'
            : status === 'building'
            ? 'bg-blue-400'
            : status === 'failed'
            ? 'bg-red-400'
            : status === 'pending'
            ? 'bg-amber-400'
            : 'bg-gray-400'
        }`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeploymentStatus | 'all'>('all');

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.repo.toLowerCase().includes(search.toLowerCase()) ||
      p.framework.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-[hsl(240_5%_55%)] mt-1">
            Manage and monitor all your deployments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(240_5%_55%)]" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? 'bg-[hsl(25_95%_53%)] text-white'
                  : 'bg-[hsl(240_8%_12%)] text-[hsl(240_5%_65%)] hover:text-white hover:bg-[hsl(240_8%_16%)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <Card
            key={project.id}
            className="card-dark hover:border-[hsl(25_95%_53%/0.3)] transition-all group cursor-pointer"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(240_8%_14%)] flex items-center justify-center text-lg font-bold text-[hsl(25_95%_53%)]">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-[hsl(25_95%_53%)] transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-[hsl(240_5%_55%)]">{project.framework}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 rounded-lg hover:bg-[hsl(240_8%_14%)] text-[hsl(240_5%_55%)] transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-[hsl(240_12%_8%)] border-[hsl(240_6%_18%)]"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                      className="text-white hover:bg-[hsl(240_8%_14%)] cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/env-vars/${project.id}`);
                      }}
                      className="text-white hover:bg-[hsl(240_8%_14%)] cursor-pointer"
                    >
                      <Variable className="h-4 w-4 mr-2" />
                      Environment Variables
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                      className="text-white hover:bg-[hsl(240_8%_14%)] cursor-pointer"
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={project.status} />
                  <span className="text-xs text-[hsl(240_5%_55%)]">{project.buildTime}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[hsl(240_5%_55%)]">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>
                    {project.branch} · {project.commit}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[hsl(240_6%_14%)]">
                  <div className="flex gap-1">
                    {project.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-[hsl(240_8%_14%)] text-[hsl(240_5%_65%)]"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                  {project.status === 'live' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(project.url, '_blank');
                      }}
                      className="flex items-center gap-1 text-xs text-[hsl(25_95%_53%)] hover:text-[hsl(25_95%_60%)] font-medium transition-colors"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[hsl(240_5%_55%)] text-lg">No projects found</p>
          <p className="text-[hsl(240_5%_45%)] text-sm mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
