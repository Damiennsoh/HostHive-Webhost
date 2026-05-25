'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Github } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GitHubRepo } from '@/lib/github';

interface RepoPickerProps {
  onSelect: (repo: GitHubRepo) => void;
  selectedRepoId?: string;
}

export function RepoPicker({ onSelect, selectedRepoId }: RepoPickerProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        setLoading(true);
        const res = await fetch('/api/github/repos');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch repositories');
        }

        setRepos(data.repositories || []);
        setError(null);
      } catch (err) {
        console.error('[RepoPicker Fetch Error]', err);
        setError(err instanceof Error ? err.message : 'Failed to load repositories');
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading repositories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-center">
        <Github className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
        <p className="mt-2 text-sm text-muted-foreground">No repositories found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="repo-select">Select Repository</Label>
      <Select
        value={selectedRepoId}
        onValueChange={(id) => {
          const repo = repos.find((r) => r.id.toString() === id);
          if (repo) onSelect(repo);
        }}
      >
        <SelectTrigger id="repo-select" className="w-full">
          <SelectValue placeholder="Select a repository" />
        </SelectTrigger>
        <SelectContent>
          {repos.map((repo) => (
            <SelectItem key={repo.id} value={repo.id.toString()}>
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 opacity-70" />
                <span>{repo.full_name}</span>
                {repo.private && (
                  <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                    Private
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
