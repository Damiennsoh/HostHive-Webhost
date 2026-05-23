/**
 * Coolify API Integration
 * 
 * This module provides a complete wrapper around the Coolify v4 REST API
 * for managing deployments, projects, services, and resources.
 * 
 * Coolify Base URL: https://your-coolify-instance:8000/api/v1
 * Authentication: Bearer token (from Coolify Settings > API)
 * 
 * To use:
 * 1. Deploy Coolify on your VPS
 * 2. Generate API token from Coolify UI
 * 3. Set COOLIFY_API_URL and COOLIFY_API_TOKEN env vars
 * 4. Use the helpers below in your Next.js API routes
 * 
 * Architecture Flow:
 * Next.js API Route → Coolify API → Docker/Nixpacks → Traefik → Live URL
 */

// Coolify API Integration - types used inline

const COOLIFY_API_URL = import.meta.env.VITE_COOLIFY_API_URL || 'http://localhost:8000/api/v1';
const COOLIFY_TOKEN = import.meta.env.VITE_COOLIFY_API_TOKEN || '';

// ===== HTTP CLIENT =====

async function coolifyFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${COOLIFY_API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${COOLIFY_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Coolify API error: ${response.status}`);
  }

  return response.json();
}

// ===== PROJECTS =====

export async function listCoolifyProjects() {
  return coolifyFetch('/projects');
}

export async function createCoolifyProject(name: string, description?: string) {
  return coolifyFetch('/projects', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function getCoolifyProject(projectUuid: string) {
  return coolifyFetch(`/projects/${projectUuid}`);
}

export async function deleteCoolifyProject(projectUuid: string) {
  return coolifyFetch(`/projects/${projectUuid}`, { method: 'DELETE' });
}

// ===== APPLICATIONS =====

export async function listApplications(projectUuid?: string) {
  const query = projectUuid ? `?project_uuid=${projectUuid}` : '';
  return coolifyFetch(`/applications${query}`);
}

export async function createApplication(data: {
  project_uuid: string;
  server_uuid?: string;
  environment_name?: string;
  git_repository?: string;
  git_branch?: string;
  build_pack?: 'nixpacks' | 'dockerfile' | 'dockercompose' | 'static';
  ports_exposes?: string;
  base_directory?: string;
  publish_directory?: string;
  name: string;
  description?: string;
  instant_deploy?: boolean;
}) {
  return coolifyFetch('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getApplication(uuid: string) {
  return coolifyFetch(`/applications/${uuid}`);
}

export async function updateApplication(uuid: string, data: Partial<any>) {
  return coolifyFetch(`/applications/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteApplication(uuid: string) {
  return coolifyFetch(`/applications/${uuid}`, { method: 'DELETE' });
}

// ===== DEPLOYMENTS =====

export async function deployApplication(applicationUuid: string, forceRebuild = false) {
  return coolifyFetch(`/applications/${applicationUuid}/deploy`, {
    method: 'POST',
    body: JSON.stringify({ force_rebuild: forceRebuild }),
  });
}

export async function getDeploymentLogs(deploymentUuid: string) {
  return coolifyFetch(`/deployments/${deploymentUuid}/logs`);
}

export async function listDeployments(applicationUuid?: string) {
  const query = applicationUuid ? `?application_uuid=${applicationUuid}` : '';
  return coolifyFetch(`/deployments${query}`);
}

export async function stopApplication(uuid: string) {
  return coolifyFetch(`/applications/${uuid}/stop`, { method: 'POST' });
}

export async function restartApplication(uuid: string) {
  return coolifyFetch(`/applications/${uuid}/restart`, { method: 'POST' });
}

// ===== ENVIRONMENT VARIABLES =====

export async function getApplicationEnvVars(applicationUuid: string) {
  return coolifyFetch(`/applications/${applicationUuid}/envs`);
}

export async function setApplicationEnvVar(
  applicationUuid: string,
  key: string,
  value: string,
  isBuildVariable = false
) {
  return coolifyFetch(`/applications/${applicationUuid}/envs`, {
    method: 'POST',
    body: JSON.stringify({
      key,
      value,
      is_build_variable: isBuildVariable,
      is_literal: true,
    }),
  });
}

export async function deleteApplicationEnvVar(envUuid: string) {
  return coolifyFetch(`/envs/${envUuid}`, { method: 'DELETE' });
}

// ===== DOMAINS =====

export async function getApplicationDomains(applicationUuid: string) {
  return coolifyFetch(`/applications/${applicationUuid}/domains`);
}

export async function addApplicationDomain(
  applicationUuid: string,
  domain: string,
  isHttps = true
) {
  // Coolify handles SSL auto-provisioning via Traefik
  return coolifyFetch(`/applications/${applicationUuid}/domains`, {
    method: 'POST',
    body: JSON.stringify({ domain, is_https: isHttps }),
  });
}

export async function deleteApplicationDomain(domainUuid: string) {
  return coolifyFetch(`/domains/${domainUuid}`, { method: 'DELETE' });
}

// ===== FULL DEPLOYMENT PIPELINE =====

export async function deployFromGitHub(data: {
  projectUuid: string;
  repo: string;
  branch: string;
  rootDir?: string;
  framework: string;
  name: string;
  envVars?: Record<string, string>;
  domain?: string;
}) {
  const { projectUuid, repo, branch, rootDir, framework, name, envVars, domain } = data;

  // 1. Create the application in Coolify
  const buildPack = framework === 'docker' ? 'dockerfile' : 'nixpacks';
  const app = await createApplication({
    project_uuid: projectUuid,
    name,
    git_repository: `https://github.com/${repo}`,
    git_branch: branch,
    build_pack: buildPack as any,
    base_directory: rootDir || '/',
    instant_deploy: false,
  });

  const appUuid = app.uuid;

  // 2. Set environment variables
  if (envVars) {
    for (const [key, value] of Object.entries(envVars)) {
      await setApplicationEnvVar(appUuid, key, value);
    }
  }

  // 3. Add custom domain if provided
  if (domain) {
    await addApplicationDomain(appUuid, domain);
  }

  // 4. Trigger deployment
  const deployment = await deployApplication(appUuid);

  return {
    application: app,
    deployment,
    url: domain
      ? `https://${domain}`
      : app.fqdn || `https://${app.uuid}.hostdesk.app`,
  };
}

// ===== BUILD LOGS (Server-Sent Events) =====

export function streamDeploymentLogs(
  deploymentUuid: string,
  onLog: (log: string) => void,
  onError?: (error: Error) => void
) {
  const eventSource = new EventSource(
    `${COOLIFY_API_URL}/deployments/${deploymentUuid}/logs/stream?token=${COOLIFY_TOKEN}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onLog(data.log || data.message || event.data);
    } catch {
      onLog(event.data);
    }
  };

  eventSource.onerror = () => {
    onError?.(new Error('Log stream error'));
    eventSource.close();
  };

  return () => eventSource.close();
}

// ===== WEBHOOK HANDLER (for GitHub push events) =====

export async function handleGitHubWebhook(payload: {
  ref: string;
  repository: { full_name: string };
  head_commit?: { id: string };
}) {
  const branch = payload.ref.replace('refs/heads/', '');
  const repo = payload.repository.full_name;
  const commit = payload.head_commit?.id;

  // Find the project in your database that matches this repo
  // Then trigger deployment via Coolify API
  // This would be called from a Next.js API route

  return {
    branch,
    repo,
    commit,
    message: 'Webhook received',
  };
}

// ===== HEALTH & STATUS =====

export async function getCoolifyHealth() {
  return coolifyFetch('/health');
}

export async function listServers() {
  return coolifyFetch('/servers');
}

export async function getServerResources(serverUuid: string) {
  return coolifyFetch(`/servers/${serverUuid}/resources`);
}

// ===== RESEND EMAIL NOTIFICATIONS =====

/**
 * Send deployment notification via Resend
 * Call this from your Next.js API routes after deployment events
 */
export async function sendDeploymentNotification(data: {
  to: string;
  projectName: string;
  status: 'success' | 'failed';
  url?: string;
  logs?: string;
}) {
  const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'HostDesk <deploy@hostdesk.dev>',
      to: data.to,
      subject: `Deployment ${data.status === 'success' ? 'Successful' : 'Failed'}: ${data.projectName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${data.status === 'success' ? '#10b981' : '#ef4444'};">
            Deployment ${data.status === 'success' ? 'Successful 🎉' : 'Failed ❌'}
          </h2>
          <p><strong>Project:</strong> ${data.projectName}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          ${data.url ? `<p><strong>URL:</strong> <a href="${data.url}">${data.url}</a></p>` : ''}
          ${data.logs ? `<pre style="background: #1a1a2e; color: #fff; padding: 16px; border-radius: 8px; overflow-x: auto;">${data.logs}</pre>` : ''}
        </div>
      `,
    }),
  });

  return response.json();
}

// ===== UPTIME MONITORING =====

/**
 * Check if a deployment is live and responding
 */
export async function checkDeploymentHealth(url: string): Promise<{
  status: 'up' | 'down';
  responseTime: number;
  statusCode?: number;
}> {
  const start = Date.now();
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    return {
      status: response.ok ? 'up' : 'down',
      responseTime: Date.now() - start,
      statusCode: response.status,
    };
  } catch {
    return { status: 'down', responseTime: Date.now() - start };
  }
}
