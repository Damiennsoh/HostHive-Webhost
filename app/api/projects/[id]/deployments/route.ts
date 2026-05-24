import { NextRequest, NextResponse } from 'next/server';
import { mockDeployments } from '@/lib/mock-data';

/**
 * GET /api/projects/[id]/deployments
 * Get all deployments for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual Supabase query
    // const { data } = await supabase
    //   .from('deployments')
    //   .select('*')
    //   .eq('project_id', id)
    //   .order('created_at', { ascending: false });

    const deployments = mockDeployments.filter((d) => d.project_id === id);

    return NextResponse.json(
      { success: true, deployments },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Get Deployments Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/deployments
 * Trigger a new deployment
 * 
 * Expected body: {
 *   branch: string,
 *   commit_sha?: string,
 *   triggered_by: 'manual' | 'webhook'
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { branch, commit_sha, triggered_by } = body;

    if (!branch || !triggered_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Integrate with Coolify API
    // POST to Coolify: /api/v1/projects/{projectId}/deployments
    // const coolifyResponse = await fetch(`${COOLIFY_URL}/api/v1/projects/${id}/deployments`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` },
    //   body: JSON.stringify({ branch, commit_sha }),
    // });

    const newDeployment = {
      id: 'deploy_' + Date.now(),
      project_id: id,
      status: 'pending',
      commit_sha: commit_sha || 'abc123',
      commit_message: 'New deployment',
      branch,
      build_logs: '',
      deployment_logs: '',
      triggered_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, deployment: newDeployment },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Create Deployment Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
