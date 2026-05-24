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

  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, deployment: data }, { status: 200 });
}

export async function POST(
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
    await coolify.cancelDeployment(deployment.coolify_deploy_id);

    await supabase
      .from('deployments')
      .update({ status: 'cancelled', finished_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ success: true, message: 'Deployment cancellation requested' }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cancel failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
