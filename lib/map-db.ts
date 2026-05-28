import type { DbDeployment, DbProject } from '@/types/supabase';
import type { Deployment, DeploymentStatus, Framework, Project } from '@/lib/types';

export function mapProjectStatus(status: DbProject['status']): DeploymentStatus {
  switch (status) {
    case 'running':
      return 'ready';
    case 'deploying':
      return 'building';
    case 'failed':
      return 'error';
    case 'stopped':
    case 'inactive':
    default:
      return 'queued';
  }
}

export function mapDeploymentStatus(status: DbDeployment['status']): DeploymentStatus {
  switch (status) {
    case 'success':
      return 'ready';
    case 'building':
    case 'deploying':
      return 'building';
    case 'failed':
      return 'error';
    case 'cancelled':
      return 'canceled';
    case 'queued':
    default:
      return 'queued';
  }
}

export function mapDbProjectToUi(project: DbProject): Project {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    framework: (project.framework as Framework) || 'nodejs',
    domain: project.custom_domain || project.assigned_domain || `${project.slug}.lynxhost.app`,
    status: mapProjectStatus(project.status),
    lastDeployment: new Date(project.updated_at).toLocaleDateString(),
    organizationId: 'personal',
    createdAt: project.created_at,
    repository: project.git_repo_url.replace('https://github.com/', ''),
    branch: project.git_branch,
  };
}

export function mapDbDeploymentToUi(
  deployment: DbDeployment,
  project?: DbProject | { name: string; assigned_domain?: string | null; custom_domain?: string | null; slug: string }
): Deployment {
  const domain =
    project && 'custom_domain' in project
      ? project.custom_domain || project.assigned_domain || `${project.slug}.lynxhost.app`
      : undefined;

  return {
    id: deployment.id,
    projectId: deployment.project_id,
    projectName: project?.name ?? 'Project',
    commit: deployment.commit_sha?.slice(0, 7) ?? '—',
    commitMessage: deployment.commit_message ?? 'Deployment',
    branch: deployment.branch ?? 'main',
    status: mapDeploymentStatus(deployment.status),
    duration: deployment.duration_secs ?? 0,
    createdAt: deployment.created_at,
    url: domain ? `https://${domain}` : undefined,
  };
}

