import { NextRequest, NextResponse } from 'next/server';
import { mockDeployments } from '@/lib/mock-data';

/**
 * GET /api/deployments/[id]
 * Get a specific deployment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual Supabase query
    // const { data } = await supabase
    //   .from('deployments')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    const deployment = mockDeployments.find((d) => d.id === id);

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, deployment },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Get Deployment Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/deployments/[id]/logs
 * Stream deployment logs
 * 
 * Note: In production, this should stream from Coolify or deployment container
 */
export async function GET_LOGS(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Stream logs from Coolify API or Docker
    // const coolifyResponse = await fetch(`${COOLIFY_URL}/api/v1/deployments/${id}/logs`, {
    //   headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` },
    // });

    const deployment = mockDeployments.find((d) => d.id === id);

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        logs: {
          build: deployment.build_logs.split('\n'),
          deployment: deployment.deployment_logs.split('\n'),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Get Deployment Logs Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/deployments/[id]/cancel
 * Cancel a deployment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Call Coolify API to cancel deployment
    // const coolifyResponse = await fetch(`${COOLIFY_URL}/api/v1/deployments/${id}/cancel`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` },
    // });

    return NextResponse.json(
      { success: true, message: 'Deployment cancellation requested' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cancel Deployment Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
