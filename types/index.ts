// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expires_at: string;
}

// Projects
export enum ProjectStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DELETED = 'deleted',
}

export enum ProjectType {
  STATIC = 'static',
  NODE = 'node',
  PYTHON = 'python',
  DOCKER = 'docker',
  GO = 'go',
  RUBY = 'ruby',
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  repository_url: string;
  repository_branch: string;
  project_type: ProjectType;
  status: ProjectStatus;
  domain?: string;
  environment_variables: Record<string, string>;
  build_command?: string;
  start_command?: string;
  created_at: string;
  updated_at: string;
  last_deployed_at?: string;
}

// Deployments
export enum DeploymentStatus {
  PENDING = 'pending',
  BUILDING = 'building',
  DEPLOYING = 'deploying',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Deployment {
  id: string;
  project_id: string;
  status: DeploymentStatus;
  commit_sha: string;
  commit_message?: string;
  branch: string;
  build_logs: string;
  deployment_logs: string;
  duration_seconds?: number;
  triggered_by: string; // 'webhook' | 'manual'
  created_at: string;
  updated_at: string;
  deployed_at?: string;
}

// Domains
export interface Domain {
  id: string;
  project_id: string;
  domain_name: string;
  is_custom: boolean;
  ssl_certificate_status: 'pending' | 'active' | 'expired';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// GitHub Integration
export interface GitHubAccount {
  id: string;
  user_id: string;
  github_user_id: number;
  github_username: string;
  github_email: string;
  github_avatar_url?: string;
  github_token: string; // Encrypted in DB
  connected_at: string;
}

// Monitoring & Logs
export interface HealthCheck {
  id: string;
  project_id: string;
  status: 'up' | 'down';
  response_time_ms: number;
  last_checked_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key: string;
  name: string;
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  type: 'deployment_success' | 'deployment_failed' | 'health_alert' | 'billing';
  project_id?: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Organizations (for future scaling)
export interface Organization {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
