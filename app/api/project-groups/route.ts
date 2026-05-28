import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { mapDbProjectGroupToUi } from '@/lib/map-db';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth as { user: any, supabase: any };
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('project_groups')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const groups = (data ?? []).map(mapDbProjectGroupToUi);

  return NextResponse.json({ success: true, groups }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const { user, supabase } = auth as { user: any, supabase: any };
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('project_groups')
      .insert({
        user_id: user.id,
        name,
        description: description ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, group: mapDbProjectGroupToUi(data) }, { status: 201 });
  } catch (error) {
    console.error('[Create Project Group Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
