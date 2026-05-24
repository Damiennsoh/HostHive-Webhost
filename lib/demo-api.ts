import type { DbDeployment, DbProject } from '@/types/supabase';
import type { Deployment, Project } from '@/lib/types';
import { mapDbDeploymentToUi, mapDbProjectToUi } from '@/lib/map-db';
import { mockDeployments, mockProjects } from '@/lib/mock-data';

const demoProjects: DbProject[] = [];
const demoDeployments: DbDeployment[] = [];

function uiStatusToDb(status: Project['status']): DbProject['status'] {
  switch (status) {
    case 'ready':
      return 'running';
    case 'building':
      return 'deploying';
    case 'error':
      return 'failed';
    default:
      return 'inactive';
  }
}

function uiDeploymentStatusToDb(status: Deployment['status']): DbDeployment['status'] {
  switch (status) {
    case 'ready':
      return 'success';
    case 'building':
      return 'building';
    case 'error':
      return 'failed';
    case 'canceled':
      return 'cancelled';
    default:
      return 'queued';
  }
}

export function mockProjectToDb(project: Project, userId = 'mock_user'): DbProject {
  const now = new Date().toISOString();
  return {
    id: project.id,
    user_id: userId,
    name: project.name,
    slug: project.slug,
    coolify_uuid: null,
    git_repo_url: project.repository
      ? `https://github.com/${project.repository}`
      : 'upload://local',
    git_branch: project.branch ?? 'main',
    git_provider: 'github',
    build_command: null,
    start_command: null,
    root_directory: null,
    runtime: project.framework === 'static' ? 'static' : 'nixpacks',
    custom_domain: null,
    assigned_domain: project.domain,
    status: uiStatusToDb(project.status),
    framework: project.framework,
    is_public: true,
    created_at: project.createdAt,
    updated_at: now,
  };
}

function mockDeploymentToDb(deployment: Deployment, userId = 'mock_user'): DbDeployment {
  return {
    id: deployment.id,
    project_id: deployment.projectId,
    user_id: userId,
    coolify_deploy_id: null,
    status: uiDeploymentStatusToDb(deployment.status),
    trigger: 'manual',
    commit_sha: deployment.commit === '—' ? null : deployment.commit,
    commit_message: deployment.commitMessage,
    commit_author: null,
    branch: deployment.branch,
    log_url: null,
    duration_secs: deployment.duration,
    error_message: null,
    started_at: deployment.createdAt,
    finished_at: deployment.createdAt,
    created_at: deployment.createdAt,
  };
}

export function getDemoDbProjects(): DbProject[] {
  const seeded = mockProjects.map((p) => mockProjectToDb(p));
  return [...demoProjects, ...seeded];
}

export function getDemoDbDeployments(): DbDeployment[] {
  const seeded = mockDeployments.map((d) => mockDeploymentToDb(d));
  return [...demoDeployments, ...seeded].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function createDemoDbProject(input: {
  name: string;
  slug: string;
  repository_url?: string;
  repository_branch?: string;
  project_type?: string;
  source?: 'github' | 'upload';
}): DbProject {
  const now = new Date().toISOString();
  const baseDomain = process.env.BASE_DOMAIN ?? 'hosthive.app';
  const project: DbProject = {
    id: `demo_${Date.now()}`,
    user_id: 'mock_user',
    name: input.name,
    slug: input.slug,
    coolify_uuid: null,
    git_repo_url: input.repository_url ?? 'upload://local',
    git_branch: input.repository_branch ?? 'main',
    git_provider: 'github',
    build_command: null,
    start_command: null,
    root_directory: null,
    runtime: input.project_type === 'static' || input.source === 'upload' ? 'static' : 'nixpacks',
    custom_domain: null,
    assigned_domain: `${input.slug}.${baseDomain}`,
    status: 'deploying',
    framework: input.project_type ?? (input.source === 'upload' ? 'static' : 'nodejs'),
    is_public: true,
    created_at: now,
    updated_at: now,
  };
  demoProjects.unshift(project);
  return project;
}

export function createDemoDbDeployment(project: DbProject): DbDeployment {
  const now = new Date().toISOString();
  const deployment: DbDeployment = {
    id: `demo_dep_${Date.now()}`,
    project_id: project.id,
    user_id: 'mock_user',
    coolify_deploy_id: null,
    status: 'success',
    trigger: 'manual',
    commit_sha: project.git_repo_url.startsWith('upload://') ? 'upload' : 'demo0001',
    commit_message:
      project.runtime === 'static' ? 'Static files uploaded from local machine' : 'Demo deployment',
    commit_author: null,
    branch: project.git_branch,
    log_url: null,
    duration_secs: 38,
    error_message: null,
    started_at: now,
    finished_at: now,
    created_at: now,
  };
  demoDeployments.unshift(deployment);
  project.status = 'running';
  project.updated_at = now;
  return deployment;
}

export function buildDemoDashboardPayload() {
  const projectList = getDemoDbProjects();
  const deployments = getDemoDbDeployments();
  const projectMap = new Map(projectList.map((p) => [p.id, p]));

  const stats = {
    totalProjects: projectList.length,
    live: projectList.filter((p) => p.status === 'running').length,
    building: projectList.filter((p) => p.status === 'deploying').length,
    failed: projectList.filter((p) => p.status === 'failed').length,
  };

  const recentProjects = projectList.slice(0, 5).map(mapDbProjectToUi);
  const recentDeployments = deployments.slice(0, 8).map((d) =>
    mapDbDeploymentToUi(d, projectMap.get(d.project_id))
  );

  const activity = deployments.slice(0, 6).map((d) => {
    const project = projectMap.get(d.project_id);
    let label: string;

    if (d.status === 'success') {
      label = `${project?.name ?? 'Project'} deployed to production`;
    } else if (d.status === 'failed') {
      label = `Build failed for ${project?.name ?? 'project'}`;
    } else if (d.status === 'building' || d.status === 'deploying') {
      label = `${project?.name ?? 'Project'} deployment started`;
    } else {
      label = `${project?.name ?? 'Project'} deployment queued`;
    }

    return { id: d.id, label, status: d.status, createdAt: d.created_at };
  });

  return { success: true, stats, recentProjects, recentDeployments, activity };
}
