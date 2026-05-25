import { getRateLimit } from './redis';

const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * Universal rate limit helper.
 * Uses Redis if available, falls back to local Map for development.
 */
export async function rateLimit(key: string, limit = 30, windowMs = 60_000): Promise<boolean> {
  // 1. Try Redis first
  try {
    const { success } = await getRateLimit(key, limit, Math.floor(windowMs / 1000));
    return success;
  } catch (err) {
    console.error('[RateLimit] Redis failed, falling back to local Map:', err);
  }

  // 2. Fallback to local Map
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}
