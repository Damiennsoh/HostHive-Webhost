import { z } from 'zod';

const envSchema = z.object({
  COOLIFY_API_URL: z.string().url(),
  COOLIFY_API_TOKEN: z.string().min(1),
});

function getEnv() {
  return envSchema.parse({
    COOLIFY_API_URL: process.env.COOLIFY_API_URL,
    COOLIFY_API_TOKEN: process.env.COOLIFY_API_TOKEN,
  });
}

export interface CoolifyProject {
  uuid: string;
  name: string;
  git_repository?: string;
  git_branch?: string;
  status: 'running' | 'stopped' | 'deploying' | 'idle';
  domains?: string[];
}

export interface CoolifyDeployment {
  uuid: string;
  status: 'queued' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled';
  created_at: string;
  finished_at?: string;
  logs?: string;
}

export class CoolifyClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    const env = getEnv();
    this.baseUrl = env.COOLIFY_API_URL.replace(/\/$/, '');
    this.token = env.COOLIFY_API_TOKEN;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Coolify API ${res.status}: ${errorText}`);
    }

    return res.json() as Promise<T>;
  }

  async listProjects(): Promise<CoolifyProject[]> {
    return this.request('/v1/projects');
  }

  async getProject(uuid: string): Promise<CoolifyProject> {
    return this.request(`/v1/projects/${uuid}`);
  }

  async createProject(data: {
    name: string;
    git_repo: string;
    branch: string;
    build_command?: string;
    start_command?: string;
    root_dir?: string;
    runtime?: 'nixpacks' | 'dockerfile' | 'static';
    env_vars?: Record<string, string>;
  }): Promise<CoolifyProject> {
    return this.request('/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(uuid: string): Promise<void> {
    return this.request(`/v1/projects/${uuid}`, { method: 'DELETE' });
  }

  async deployProject(
    projectUuid: string,
    options?: { force_rebuild?: boolean; commit_sha?: string }
  ): Promise<CoolifyDeployment> {
    return this.request(`/v1/projects/${projectUuid}/deployments`, {
      method: 'POST',
      body: JSON.stringify(options ?? {}),
    });
  }

  async listDeployments(projectUuid: string): Promise<CoolifyDeployment[]> {
    return this.request(`/v1/projects/${projectUuid}/deployments`);
  }

  async getDeploymentStatus(deploymentUuid: string): Promise<CoolifyDeployment> {
    return this.request(`/v1/deployments/${deploymentUuid}`);
  }

  async cancelDeployment(deploymentUuid: string): Promise<void> {
    return this.request(`/v1/deployments/${deploymentUuid}/cancel`, { method: 'POST' });
  }

  async setEnvVars(projectUuid: string, vars: Record<string, string>): Promise<void> {
    return this.request(`/v1/projects/${projectUuid}/env`, {
      method: 'POST',
      body: JSON.stringify({ env: vars }),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request('/v1/health');
  }
}

let _coolify: CoolifyClient | null = null;

export function getCoolifyClient(): CoolifyClient {
  if (!_coolify) {
    _coolify = new CoolifyClient();
  }
  return _coolify;
}
