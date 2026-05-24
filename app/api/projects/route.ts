import { NextRequest, NextResponse } from 'next/server';
import { mockProjects } from '@/lib/mock-data';

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session/token
    // TODO: Replace with actual Supabase query
    // const { data } = await supabase
    //   .from('projects')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, projects: mockProjects }, { status: 200 });
  } catch (error) {
    console.error('[Get Projects Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Create a new project
 * 
 * Expected body: {
 *   name: string,
 *   description?: string,
 *   repository_url: string,
 *   repository_branch: string,
 *   project_type: string,
 *   build_command?: string,
 *   start_command?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      repository_url,
      repository_branch,
      project_type,
      build_command,
      start_command,
    } = body;

    if (!name || !repository_url || !repository_branch || !project_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Supabase insert
    // const { data, error } = await supabase
    //   .from('projects')
    //   .insert({
    //     user_id: userId,
    //     name,
    //     description,
    //     repository_url,
    //     repository_branch,
    //     project_type,
    //     build_command,
    //     start_command,
    //     status: 'active',
    //     environment_variables: {},
    //   });

    const newProject = {
      id: 'proj_' + Date.now(),
      user_id: 'user_001',
      name,
      description,
      repository_url,
      repository_branch,
      project_type,
      status: 'active',
      domain: `${name.toLowerCase().replace(/\s+/g, '-')}.hosthive.app`,
      environment_variables: {},
      build_command,
      start_command,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, project: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Create Project Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
