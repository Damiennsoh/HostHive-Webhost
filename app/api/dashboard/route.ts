import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { mapDbDeploymentToUi, mapDbProjectToUi } from '@/lib/map-db';
import type { DbDeployment, DbProject } from '@/types/supabase';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  const projectList = (projects ?? []) as DbProject[];
  const projectMap = new Map(projectList.map((p) => [p.id, p]));

  const { data: deploymentRows } = await supabase
    .from('deployments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const deployments = (deploymentRows ?? []) as DbDeployment[];

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

  return NextResponse.json({
    success: true,
    stats,
    recentProjects,
    recentDeployments,
    activity,
  });
}
