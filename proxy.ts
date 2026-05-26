import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash Redis configuration for Edge Runtime rate limiting
const upstashRedis = 
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ratelimit = upstashRedis 
  ? new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10s per IP
    })
  : null;

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/projects',
  '/deployments',
  '/domains',
  '/databases',
  '/settings',
  '/account',
  '/api-keys',
  '/organizations',
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthRoute(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register';
}

/**
 * Next.js Middleware
 * Handles Auth Protection, Rate Limiting, and Cookie Management
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate limit all API routes if Upstash is configured
  if (pathname.startsWith('/api/') && ratelimit) {
    const ip = (request as any).ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const useMockOnly =
    process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' && (!supabaseUrl || !supabaseKey);

  if (useMockOnly) {
    const hasMockSession = request.cookies.get('hosthive_mock')?.value === '1';

    if (!hasMockSession && isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    if (hasMockSession && isAuthRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Handle Supabase session with error catching for invalid refresh tokens
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err: any) {
    console.warn('[Middleware] Auth session error:', err.message);
    if (err.code === 'refresh_token_not_found' || err.status === 400) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      return response;
    }
  }

  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export default middleware;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
