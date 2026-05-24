import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { getCoolifyClient } from '@/lib/coolify-client';
import { slugify, mapProjectTypeToRuntime } from '@/lib/project-utils';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, projects: data ?? [] }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;

  try {
    const body = await request.json();
    const {
      name,
      repository_url,
      repository_branch,
      project_type,
      build_command,
      start_command,
    } = body;

    if (!name || !repository_url || !repository_branch || !project_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = slugify(name);
    const runtime = mapProjectTypeToRuntime(project_type);
    const baseDomain = process.env.BASE_DOMAIN ?? 'hosthive.app';
    const assignedDomain = `${slug}.${baseDomain}`;

    let coolifyUuid: string | null = null;

    try {
      const coolify = getCoolifyClient();
      const coolifyProject = await coolify.createProject({
        name,
        git_repo: repository_url,
        branch: repository_branch,
        build_command,
        start_command,
        runtime,
      });
      coolifyUuid = coolifyProject.uuid;
    } catch (coolifyErr) {
      console.warn('[Create Project] Coolify unavailable:', coolifyErr);
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        slug,
        coolify_uuid: coolifyUuid,
        git_repo_url: repository_url,
        git_branch: repository_branch,
        build_command: build_command ?? null,
        start_command: start_command ?? null,
        runtime,
        framework: project_type,
        assigned_domain: assignedDomain,
        status: coolifyUuid ? 'inactive' : 'inactive',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: data }, { status: 201 });
  } catch (error) {
    console.error('[Create Project Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
