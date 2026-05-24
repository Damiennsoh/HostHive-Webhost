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
    .from('env_vars')
    .select('id, key, is_secret, created_at, updated_at')
    .eq('project_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const environment_variables = Object.fromEntries(
    (data ?? []).map((v) => [v.key, v.is_secret ? '••••••••' : ''])
  );

  return NextResponse.json({ success: true, environment_variables, variables: data }, { status: 200 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const { id } = await params;
  const body = await request.json();
  const { key, value, is_secret } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, coolify_uuid')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('env_vars')
    .upsert(
      {
        project_id: id,
        user_id: user.id,
        key,
        value: String(value),
        is_secret: is_secret ?? true,
      },
      { onConflict: 'project_id,key' }
    )
    .select('id, key, is_secret')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (project.coolify_uuid) {
    try {
      const coolify = getCoolifyClient();
      await coolify.setEnvVars(project.coolify_uuid, { [key]: String(value) });
    } catch (err) {
      console.warn('[Env] Coolify sync failed:', err);
    }
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Environment variable saved',
      variable: data,
    },
    { status: 201 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const { id } = await params;
  const key = new URL(request.url).searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('env_vars')
    .delete()
    .eq('project_id', id)
    .eq('user_id', user.id)
    .eq('key', key);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Environment variable deleted' }, { status: 200 });
}
