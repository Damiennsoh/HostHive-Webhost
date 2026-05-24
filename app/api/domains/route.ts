import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { getDnsRecordsForDomain } from '@/lib/dns-config';
import { APP_DOMAIN } from '@/lib/brand';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.isDemo) {
    const { mockDomains, mockProjects } = await import('@/lib/mock-data');
    const domains = mockDomains.map((d) => {
      const project = mockProjects.find((p) => p.id === d.projectId);
      return {
        id: d.id,
        domain: d.domain,
        cname_target: `${project?.slug ?? 'app'}.hosthive.app`,
        verification_status: d.status === 'active' ? 'verified' : 'pending',
        ssl_status: d.ssl ? 'active' : 'pending',
        project_id: d.projectId,
        projects: project ? { name: project.name, slug: project.slug } : null,
      };
    });
    return NextResponse.json({ success: true, domains }, { status: 200 });
  }

  const { user, supabase } = auth;
  if (!supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('custom_domains')
    .select('*, projects(name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, domains: data ?? [] }, { status: 200 });
}

const addDomainSchema = z.object({
  project_id: z.string().uuid(),
  domain: z.string().min(3),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const body = await request.json();
  const parsed = addDomainSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { project_id, domain } = parsed.data;

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, name')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const cnameTarget = `${project.slug}.${APP_DOMAIN}`;
  const dnsRecords = getDnsRecordsForDomain(domain, project.slug);

  const { data, error } = await supabase
    .from('custom_domains')
    .insert({
      project_id,
      user_id: user.id,
      domain: domain.toLowerCase(),
      record_type: 'CNAME',
      cname_target: cnameTarget,
      verification_status: 'pending',
      ssl_status: 'pending',
    })
    .select('*, projects(name, slug)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from('projects')
    .update({ custom_domain: domain.toLowerCase() })
    .eq('id', project_id);

  return NextResponse.json(
    { success: true, domain: data, dnsRecords },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const domainId = new URL(request.url).searchParams.get('id');

  if (!domainId) {
    return NextResponse.json({ error: 'Domain id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('custom_domains')
    .delete()
    .eq('id', domainId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
