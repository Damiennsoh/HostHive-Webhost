import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { getCoolifyClient } from '@/lib/coolify-client';
import { slugify, mapProjectTypeToRuntime } from '@/lib/project-utils';
import { createDemoDbProject, getDemoDbProjects } from '@/lib/demo-api';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.isDemo) {
    return NextResponse.json({ success: true, projects: getDemoDbProjects() }, { status: 200 });
  }

  const { user, supabase } = auth;
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  try {
    const body = await request.json();
    const {
      name,
      repository_url,
      repository_branch,
      project_type,
      build_command,
      start_command,
      source,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const slug = slugify(name);
    const isUpload = source === 'upload' || project_type === 'static';
    const repoUrl = repository_url ?? (isUpload ? 'upload://local' : '');
    const branch = repository_branch ?? 'main';
    const type = project_type ?? (isUpload ? 'static' : 'node');

    if (!isUpload && !repoUrl) {
      return NextResponse.json({ error: 'Missing repository URL' }, { status: 400 });
    }

    if (auth.isDemo) {
      const project = createDemoDbProject({
        name,
        slug,
        repository_url: repoUrl,
        repository_branch: branch,
        project_type: type,
        source: isUpload ? 'upload' : 'github',
      });
      return NextResponse.json({ success: true, project }, { status: 201 });
    }

    const { user, supabase } = auth;
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const runtime = mapProjectTypeToRuntime(type);
    const baseDomain = process.env.BASE_DOMAIN ?? 'hosthive.app';
    const assignedDomain = `${slug}.${baseDomain}`;

    let coolifyUuid: string | null = null;

    try {
      const coolify = getCoolifyClient();
      const coolifyProject = await coolify.createProject({
        name,
        git_repo: repoUrl,
        branch,
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
        git_repo_url: repoUrl,
        git_branch: branch,
        build_command: build_command ?? null,
        start_command: start_command ?? null,
        runtime,
        framework: type,
        assigned_domain: assignedDomain,
        status: 'inactive',
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
