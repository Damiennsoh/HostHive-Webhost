import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // Handle "Email not confirmed" by auto-confirming in development if service role key is available
    if (error && (error.message.toLowerCase().includes('email not confirmed') || error.status === 400)) {
      try {
        const admin = createAdminClient();
        // Try to find the user and update their email_confirmed_at
        const { data: users, error: listError } = await admin.auth.admin.listUsers();
        const user = users?.users.find(u => u.email === email);
        
        if (user) {
          await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
          // Try signing in again after auto-confirmation
          const retry = await supabase.auth.signInWithPassword({ email, password });
          data = retry.data;
          error = retry.error;
        }
      } catch (adminErr) {
        console.error('[Admin Auto-Confirm Error]', adminErr);
        // Fall back to original error if admin confirmation fails
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
