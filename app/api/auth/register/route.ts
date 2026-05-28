import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Auto-confirm user in development if session is missing but registration succeeded
    if (data.user && !data.session) {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.updateUserById(data.user.id, { email_confirm: true });
        
        // After confirmation, we can try to sign in to get a session
        const login = await supabase.auth.signInWithPassword({ email, password });
        if (!login.error && login.data.session) {
          data.session = login.data.session;
        }
      } catch (adminErr) {
        console.error('[Admin Auto-Confirm Signup Error]', adminErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        hasSession: !!data.session,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name,
          avatar_url: data.user?.user_metadata?.avatar_url,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Auth Register Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
