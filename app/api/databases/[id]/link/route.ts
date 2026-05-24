import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { injectDatabaseEnvForProject } from '@/lib/inject-database-env';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  if (auth.isDemo) {
    return NextResponse.json({ error: 'Not available in demo mode' }, { status: 403 });
  }

  const { user, supabase } = auth;
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { project_id } = (await request.json()) as { project_id: string };

  if (!project_id) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  const { data: db } = await supabase
    .from('managed_databases')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!db) {
    return NextResponse.json({ error: 'Database not found' }, { status: 404 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  await injectDatabaseEnvForProject(supabase, user.id, project_id, db);

  const { data: updated } = await supabase
    .from('managed_databases')
    .select('*, projects(name, slug)')
    .eq('id', id)
    .single();

  return NextResponse.json({
    success: true,
    database: updated,
    message: `${db.env_var_key} injected into project environment`,
  });
}
