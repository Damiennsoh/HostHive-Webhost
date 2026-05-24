import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * 
 * Expected body: { email: string, password: string }
 * Returns: { user, token, expiresAt }
 */
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

    // TODO: Replace with actual Supabase authentication
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // For now, return mock response
    const mockUser = {
      id: 'user_001',
      email,
      name: 'John Developer',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    };

    return NextResponse.json(
      {
        success: true,
        user: mockUser,
        token: 'mock_jwt_token_' + Date.now(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
