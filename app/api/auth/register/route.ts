import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/register
 * Register a new user
 * 
 * Expected body: { email: string, password: string, name: string }
 * Returns: { user, token, expiresAt }
 */
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

    // TODO: Replace with actual Supabase authentication
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    //   options: {
    //     data: { name }
    //   }
    // });

    const mockUser = {
      id: 'user_' + Date.now(),
      email,
      name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    return NextResponse.json(
      {
        success: true,
        user: mockUser,
        token: 'mock_jwt_token_' + Date.now(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Auth Register Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
