import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { mapDbDeploymentToUi, mapDbProjectToUi } from '@/lib/map-db';
import { buildDemoDashboardPayload } from '@/lib/demo-api';
import type { DbDeployment, DbProject } from '@/types/supabase';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.isDemo) {
    return NextResponse.json(buildDemoDashboardPayload());
  }

  const { user, supabase } = auth as { user: any; supabase: any };
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [
    { data: groups, error: groupsError },
    { data: projects, error: projectsError },
    { data: deploymentsRows, error: deploymentsError }
  ] = await Promise.all([
    supabase.from('project_groups').select('*').eq('user_id', user.id),
    supabase.from('projects').select('*').eq('user_id', user.id),
    supabase.from('deployments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
  ]);

  if (groupsError || projectsError || deploymentsError) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }

  const projectList = (projects ?? []) as DbProject[];
  const projectMap = new Map(projectList.map((p) => [p.id, p]));
  const deployments = (deploymentsRows ?? []) as DbDeployment[];

  const stats = {
    totalGroups: (groups ?? []).length,
    totalProjects: projectList.length,
    live: projectList.filter((p: any) => p.status === 'running' || p.status === 'active' || p.status === 'ready').length,
    building: projectList.filter((p: any) => p.status === 'deploying' || p.status === 'building').length,
    failed: projectList.filter((p: any) => p.status === 'failed' || p.status === 'error').length,
  };

  const recentProjects = projectList.slice(0, 5).map(mapDbProjectToUi);
  const recentDeployments = deployments.slice(0, 8).map((d) =>
    mapDbDeploymentToUi(d, projectMap.get(d.project_id))
  );

  const activity = deployments.slice(0, 6).map((d: any) => {
    const project = projectMap.get(d.project_id);
    let label: string;

    if (d.status === 'success' || d.status === 'ready') {
      label = `${project?.name ?? 'Project'} deployed to production`;
    } else if (d.status === 'failed' || d.status === 'error') {
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

