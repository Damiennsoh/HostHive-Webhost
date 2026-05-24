import { NextRequest, NextResponse } from 'next/server';
import { mockProjects } from '@/lib/mock-data';

/**
 * GET /api/projects/[id]
 * Get a specific project by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //   .from('projects')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    const project = mockProjects.find((p) => p.id === id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project }, { status: 200 });
  } catch (error) {
    console.error('[Get Project Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Replace with actual Supabase update
    // const { data, error } = await supabase
    //   .from('projects')
    //   .update(body)
    //   .eq('id', id);

    const project = mockProjects.find((p) => p.id === id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updatedProject = {
      ...project,
      ...body,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, project: updatedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Update Project Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual Supabase delete
    // const { error } = await supabase
    //   .from('projects')
    //   .delete()
    //   .eq('id', id);

    return NextResponse.json(
      { success: true, message: 'Project deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Delete Project Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
