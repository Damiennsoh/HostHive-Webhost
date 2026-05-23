export type DeploymentStatus = 'live' | 'building' | 'failed' | 'stopped' | 'pending';

export interface Project {
  id: string;
  name: string;
  repo: string;
  branch: string;
  framework: string;
  status: DeploymentStatus;
  url: string;
  lastDeployed: string;
  commit: string;
  buildTime: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'docker' | 'static';
  languages: string[];
}

export interface ActivityEvent {
  id: string;
  type: 'deploy' | 'build-fail' | 'dns-verify' | 'env-update' | 'ssl-renew' | 'start';
  message: string;
  project?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface Domain {
  id: string;
  domain: string;
  project: string;
  projectId: string;
  ssl: 'active' | 'pending' | 'expired';
  dns: 'verified' | 'pending' | 'error';
  isDefault: boolean;
}

export interface EnvVar {
  id: string;
  key: string;
  value: string;
  projectId: string;
  encrypted: boolean;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  language: string | null;
  updatedAt: string;
  private: boolean;
  defaultBranch: string;
  url: string;
  stars: number;
  forks: number;
}

export interface DeploymentLog {
  id: string;
  projectId: string;
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface AnalyticsData {
  date: string;
  deployments: number;
  requests: number;
  errors: number;
  responseTime: number;
}

export interface ProjectResponseTime {
  project: string;
  time: number;
  status: 'good' | 'slow' | 'error';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  githubConnected: boolean;
  plan: 'free' | 'pro' | 'team';
}

export interface Notification {
  id: string;
  type: 'deploy_success' | 'deploy_fail' | 'uptime_alert' | 'ssl_expiry';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  projectId?: string;
}
