import { NextRequest, NextResponse } from 'next/server';
import { mockDomains } from '@/lib/mock-data';

/**
 * GET /api/projects/[id]/domains
 * Get all domains for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual Supabase query
    // const { data } = await supabase
    //   .from('domains')
    //   .select('*')
    //   .eq('project_id', id);

    const domains = mockDomains.filter((d) => d.projectId === id);

    return NextResponse.json(
      { success: true, domains },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Get Domains Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/domains
 * Add a custom domain to a project
 * 
 * Expected body: {
 *   domain_name: string,
 *   is_custom: boolean
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { domain_name, is_custom } = body;

    if (!domain_name) {
      return NextResponse.json(
        { error: 'Domain name is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate with Traefik/Coolify for SSL provisioning
    // TODO: Integrate with Let's Encrypt for automatic SSL certificates
    // const sslCert = is_custom
    //   ? await requestLetsEncryptCertificate(domain_name)
    //   : null;

    const newDomain = {
      id: 'domain_' + Date.now(),
      projectId: id,
      domain: domain_name,
      status: is_custom ? 'pending' : 'active',
      ssl_certificate_status: is_custom ? 'pending' : 'active',
      verified: !is_custom,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, domain: newDomain },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Create Domain Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]/domains/[domainId]
 * Remove a domain from a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const domainId = url.searchParams.get('domainId');

    if (!domainId) {
      return NextResponse.json(
        { error: 'Domain ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Supabase delete
    // const { error } = await supabase
    //   .from('domains')
    //   .delete()
    //   .eq('id', domainId);

    return NextResponse.json(
      { success: true, message: 'Domain removed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Delete Domain Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
