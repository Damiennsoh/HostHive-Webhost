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
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, project: data }, { status: 200 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const { id } = await params;
  const body = await request.json();

  const allowedFields = [
    'name',
    'git_branch',
    'build_command',
    'start_command',
    'custom_domain',
    'is_public',
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, project: data }, { status: 200 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const { id } = await params;

  const { data: project } = await supabase
    .from('projects')
    .select('coolify_uuid')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (project.coolify_uuid) {
    try {
      const coolify = getCoolifyClient();
      await coolify.deleteProject(project.coolify_uuid);
    } catch (err) {
      console.warn('[Delete Project] Coolify cleanup failed:', err);
    }
  }

  const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Project deleted' }, { status: 200 });
}
