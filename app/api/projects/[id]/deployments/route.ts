import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { getCoolifyClient } from '@/lib/coolify-client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDeployEmail } from '@/lib/resend';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  if (auth.isDemo) {
    const { getDemoDbDeployments } = await import('@/lib/demo-api');
    const deployments = getDemoDbDeployments().filter((d) => d.project_id === id);
    return NextResponse.json({ success: true, deployments }, { status: 200 });
  }

  const { user, supabase } = auth;
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deployments: data ?? [] }, { status: 200 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  if (auth.isDemo) {
    const { createDemoDbDeployment, getDemoDbProjects } = await import('@/lib/demo-api');
    const project = getDemoDbProjects().find((p) => p.id === id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const deployment = createDemoDbDeployment(project);
    return NextResponse.json({ success: true, deployment }, { status: 201 });
  }

  const { user, supabase } = auth;
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { branch, commit_sha, triggered_by } = body;

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (!project.coolify_uuid) {
    return NextResponse.json({ error: 'Project not linked to Coolify' }, { status: 422 });
  }

  const deployBranch = branch ?? project.git_branch;
  const trigger =
    triggered_by === 'webhook' ? 'github_push' : ('manual' as const);

  try {
    const coolify = getCoolifyClient();
    const deployment = await coolify.deployProject(project.coolify_uuid, {
      force_rebuild: true,
      commit_sha,
    });

    const { data: dbDeploy, error: dbError } = await supabase
      .from('deployments')
      .insert({
        project_id: project.id,
        user_id: user.id,
        coolify_deploy_id: deployment.uuid,
        status: 'queued',
        trigger,
        commit_sha: commit_sha ?? null,
        branch: deployBranch,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    await supabase.from('projects').update({ status: 'deploying' }).eq('id', project.id);

    return NextResponse.json({ success: true, deployment: dbDeploy }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Deployment failed';
    console.error('[Create Deployment Error]', err);

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profile?.email) {
      await sendDeployEmail('deploy_failed', {
        to: profile.email,
        projectName: project.name,
        errorMessage: message,
        branchName: deployBranch,
      });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
