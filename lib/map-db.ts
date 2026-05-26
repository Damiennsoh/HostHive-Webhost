import type { DbDeployment, DbProject, DbManagedDatabase, Database } from '@/types/supabase';
import type { Deployment, DeploymentStatus, Framework, Project, ProjectGroup, ManagedDatabase } from '@/lib/types';

type DbProjectGroup = Database['public']['Tables']['project_groups']['Row'];

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

export function mapDbProjectGroupToUi(group: DbProjectGroup): ProjectGroup {
  return {
    id: group.id,
    userId: group.user_id,
    organizationId: group.organization_id || undefined,
    name: group.name,
    description: group.description || undefined,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
  };
}

export function mapDbProjectToUi(project: DbProject): Project {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    framework: (project.framework as Framework) || 'nodejs',
    domain: project.custom_domain || project.assigned_domain || `${project.slug}.hosthive.app`,
    status: mapProjectStatus(project.status),
    lastDeployment: new Date(project.updated_at).toLocaleDateString(),
    organizationId: 'personal',
    projectGroupId: project.project_group_id || undefined,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    repository: project.git_repo_url?.replace('https://github.com/', '') || '',
    branch: project.git_branch || 'main',
  };
}

export function mapDbManagedDatabaseToUi(db: DbManagedDatabase): ManagedDatabase {
  return {
    id: db.id,
    userId: db.user_id,
    projectGroupId: db.project_group_id || undefined,
    name: db.name,
    dbType: db.db_type as 'postgresql' | 'mysql' | 'redis',
    status: db.status || 'unknown',
    coolifyUuid: db.coolify_uuid || undefined,
    host: db.host || undefined,
    port: db.port || undefined,
    databaseName: db.database_name || undefined,
    username: db.username || undefined,
    internalNetwork: db.internal_network || undefined,
    connectionUrl: db.connection_url || undefined,
    envVarKey: db.env_var_key || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}


export function mapDbDeploymentToUi(
  deployment: DbDeployment,
  project?: DbProject | { name: string; assigned_domain?: string | null; custom_domain?: string | null; slug: string }
): Deployment {
  const domain =
    project && 'custom_domain' in project
      ? project.custom_domain || project.assigned_domain || `${project.slug}.hosthive.app`
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

