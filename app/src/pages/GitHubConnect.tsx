import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github,
  Search,
  GitFork,
  Star,
  RefreshCw,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { githubRepos, currentUser } from '@/data/mockData';

export default function GitHubConnect() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = githubRepos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.language?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">GitHub</h2>
        <p className="text-[hsl(240_5%_55%)] mt-1">
          Connect your GitHub repositories to deploy
        </p>
      </div>

      {/* Connection Status */}
      <Card
        className={`card-dark overflow-hidden ${
          currentUser.githubConnected ? 'border-emerald-500/30' : 'border-[hsl(240_6%_18%)]'
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[hsl(240_8%_14%)] flex items-center justify-center">
                <Github className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">GitHub Account</h3>
                  {currentUser.githubConnected ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : null}
                </div>
                {currentUser.githubConnected ? (
                  <p className="text-sm text-[hsl(240_5%_65%)] mt-0.5">
                    Connected as <span className="text-white font-medium">@{currentUser.email.split('@')[0]}</span>
                  </p>
                ) : (
                  <p className="text-sm text-[hsl(240_5%_65%)] mt-0.5">
                    Connect your GitHub account to start deploying
                  </p>
                )}
              </div>
            </div>
            {currentUser.githubConnected ? (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(240_8%_12%)] text-white text-sm font-medium hover:bg-[hsl(240_8%_16%)] transition-colors border border-[hsl(240_6%_18%)]">
                  <RefreshCw className="h-4 w-4" />
                  Sync
                </button>
              </div>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
                <Github className="h-4 w-4" />
                Connect GitHub
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Repositories */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Repositories</h3>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(240_5%_55%)]" />
            <Input
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)]"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((repo) => (
            <Card
              key={repo.id}
              className="card-dark hover:border-[hsl(25_95%_53%/0.3)] transition-all group cursor-pointer"
              onClick={() => navigate('/deploy', { state: { repo } })}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(240_8%_14%)] flex items-center justify-center text-[hsl(25_95%_53%)] font-bold text-sm">
                      {repo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white group-hover:text-[hsl(25_95%_53%)] transition-colors truncate">
                          {repo.name}
                        </h4>
                        {repo.private ? (
                          <Lock className="h-3.5 w-3.5 text-[hsl(240_5%_45%)]" />
                        ) : (
                          <Unlock className="h-3.5 w-3.5 text-[hsl(240_5%_45%)]" />
                        )}
                      </div>
                      <p className="text-xs text-[hsl(240_5%_55%)] truncate">
                        {repo.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-[hsl(240_5%_55%)]">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[hsl(25_95%_53%)]" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {repo.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3.5 w-3.5" />
                        {repo.forks}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[hsl(240_5%_45%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Github className="h-10 w-10 text-[hsl(240_5%_35%)] mx-auto mb-3" />
            <p className="text-[hsl(240_5%_55%)]">No repositories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
