import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { getCoolifyClient } from '@/lib/coolify-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const { id } = await params;

  const { data: deployment } = await supabase
    .from('deployments')
    .select('coolify_deploy_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!deployment?.coolify_deploy_id) {
    return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
  }

  try {
    const coolify = getCoolifyClient();
    const status = await coolify.getDeploymentStatus(deployment.coolify_deploy_id);

    return NextResponse.json(
      {
        success: true,
        logs: status.logs ? status.logs.split('\n') : [],
        status: status.status,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
