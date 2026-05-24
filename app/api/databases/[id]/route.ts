import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { deleteCoolifyDatabase } from '@/lib/coolify-databases';
import type { DatabaseType } from '@/lib/database-connection';

export async function DELETE(
  _request: NextRequest,
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

  const { data: db } = await supabase
    .from('managed_databases')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!db) {
    return NextResponse.json({ error: 'Database not found' }, { status: 404 });
  }

  if (db.coolify_uuid) {
    try {
      await deleteCoolifyDatabase(db.db_type as DatabaseType, db.coolify_uuid);
    } catch (err) {
      console.warn('[Delete database] Coolify cleanup:', err);
    }
  }

  const { error } = await supabase.from('managed_databases').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
