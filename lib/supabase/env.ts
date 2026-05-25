/** Shared Supabase env validation (client + server). */

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  return { url, anonKey, serviceRoleKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) return false;
  if (url.includes('your-project')) return false;
  if (anonKey.includes('replace-with')) return false;
  return url.startsWith('https://') && anonKey.startsWith('eyJ');
}

export function supabaseConfigErrorMessage(): string {
  return (
    'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
    '(Vercel: Project → Settings → Environment Variables, then redeploy).'
  );
}
