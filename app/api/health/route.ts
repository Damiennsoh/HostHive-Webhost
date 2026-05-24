import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 * Returns status of all critical services
 */
export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        api: 'ok',
        database: 'ok', // TODO: Check actual database connection
        redis: 'ok', // TODO: Check actual redis connection
        coolify: 'ok', // TODO: Check actual Coolify connection
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('[Health Check Error]', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
