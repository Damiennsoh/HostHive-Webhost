import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

/**
 * For Next.js Edge Runtime (Middleware), use Upstash Redis (REST-based).
 * For Node.js Runtime (API routes, Background jobs), use Local Redis (TCP-based).
 */

const isEdge = process.env.NEXT_RUNTIME === 'edge';

// 1. Upstash Redis (for Edge/Serverless)
export const upstashRedis = 
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// 2. Local Redis (for Node.js dev/prod)
export const redis = !isEdge
  ? new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })
  : null;

/**
 * Universal rate limit helper that works in both Edge and Node.js
 */
export async function getRateLimit(key: string, limit = 10, windowSeconds = 10) {
  if (upstashRedis) {
    // We'll use @upstash/ratelimit in middleware directly for efficiency,
    // but this is a generic fallback.
    const count = await upstashRedis.incr(key);
    if (count === 1) await upstashRedis.expire(key, windowSeconds);
    return { success: count <= limit, remaining: Math.max(0, limit - count) };
  }

  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return { success: count <= limit, remaining: Math.max(0, limit - count) };
  }

  // Fallback for local development without any Redis
  console.warn('[Redis] No Redis client available, rate limiting disabled.');
  return { success: true, remaining: 999 };
}
