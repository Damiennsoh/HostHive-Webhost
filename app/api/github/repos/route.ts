import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { fetchUserRepos } from '@/lib/github';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('github_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.github_token) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
    }

    const repositories = await fetchUserRepos(profile.github_token);
    return NextResponse.json({ success: true, repositories });
  } catch (err) {
    console.error('[Fetch Repos API Error]', err);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
