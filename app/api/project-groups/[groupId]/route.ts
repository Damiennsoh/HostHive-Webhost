import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { mapDbProjectGroupToUi } from '@/lib/map-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { groupId } = await params;
  const { user, supabase } = auth as { user: any, supabase: any };
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('project_groups')
    .select('*')
    .eq('id', groupId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ success: true, group: mapDbProjectGroupToUi(data) }, { status: 200 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { groupId } = await params;
  const { user, supabase } = auth as { user: any, supabase: any };
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    const { data, error } = await supabase
      .from('project_groups')
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, group: mapDbProjectGroupToUi(data) }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { groupId } = await params;
  const { user, supabase } = auth as { user: any, supabase: any };
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('project_groups')
    .delete()
    .eq('id', groupId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
