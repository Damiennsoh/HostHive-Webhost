# Vercel environment variables

The app crashes on Vercel if Supabase keys are missing. `.env.local` is **not** deployed — add these in the Vercel dashboard.

## Required (Production + Preview)

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** (e.g. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → **anon** `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → **service_role** key (secret — server only) |

## Recommended

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_MOCK_AUTH` | `false` |
| `NEXT_PUBLIC_APP_URL` | `https://hosthive-webhost.vercel.app` |
| `BASE_DOMAIN` | `hosthive.app` |

## Steps

1. [Vercel Dashboard](https://vercel.com) → your **HostHive-Webhost** project  
2. **Settings** → **Environment Variables**  
3. Add each variable above for **Production**, **Preview**, and **Development**  
4. **Deployments** → ⋮ on latest deployment → **Redeploy** (required after adding env vars)

## Database

Run `supabase/RUN_IN_SUPABASE.sql` in the Supabase SQL Editor before testing login.

## Verify

After redeploy, open the site — you should **not** see:

`Supabase URL or anon key is not configured`

Public pages (`/`, `/pricing`, `/docs`) should load; `/login` should accept registered users.

## Supabase Auth URLs (fix login 400 / callback 500)

In Supabase → **Authentication** → **URL Configuration**:

| Field | Value |
|-------|--------|
| **Site URL** | `https://hosthive-webhost.vercel.app` |
| **Redirect URLs** | `https://hosthive-webhost.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |

Optional for faster testing: **Authentication** → **Providers** → **Email** → turn off **Confirm email** so users can sign in right after signup.
