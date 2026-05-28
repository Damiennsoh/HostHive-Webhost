import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchGitHubUser } from '@/lib/github';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('[GitHub Callback Error]', error);
    return NextResponse.redirect(new URL(`/settings?error=${error}`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=no_code', req.url));
  }

  try {
    const { access_token } = await exchangeCodeForToken(code);
    const githubUser = await fetchGitHubUser(access_token);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    const { error: updateError } = await (supabase
      .from('profiles') as any)
      .update({
        github_id: githubUser.id.toString(),
        github_login: githubUser.login,
        github_token: access_token,
        github_avatar_url: githubUser.avatar_url,
        github_connected: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[GitHub Callback Update Error]', updateError);
      return NextResponse.redirect(new URL('/settings?error=db_update_failed', req.url));
    }

    return NextResponse.redirect(new URL('/settings?success=github_connected', req.url));
  } catch (err) {
    console.error('[GitHub Callback Exception]', err);
    return NextResponse.redirect(new URL('/settings?error=callback_failed', req.url));
  }
}
