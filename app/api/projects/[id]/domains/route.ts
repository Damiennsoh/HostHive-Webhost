import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { getDnsRecordsForDomain } from '@/lib/dns-config';
import { APP_DOMAIN } from '@/lib/brand';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const { id } = await params;

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, domains: data ?? [] }, { status: 200 });
}

const addDomainSchema = z.object({
  domain_name: z.string().min(3),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const { id } = await params;
  const body = await request.json();
  const parsed = addDomainSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid domain name is required' }, { status: 400 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const domain = parsed.data.domain_name.toLowerCase();
  const cnameTarget = `${project.slug}.${APP_DOMAIN}`;
  const dnsRecords = getDnsRecordsForDomain(domain, project.slug);

  const { data, error } = await supabase
    .from('custom_domains')
    .insert({
      project_id: id,
      user_id: user.id,
      domain,
      record_type: 'CNAME',
      cname_target: cnameTarget,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('projects').update({ custom_domain: domain }).eq('id', id);

  return NextResponse.json({ success: true, domain: data, dnsRecords }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { user, supabase } = auth;
  const { id } = await params;
  const domainId = new URL(request.url).searchParams.get('domainId');

  if (!domainId) {
    return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('custom_domains')
    .delete()
    .eq('id', domainId)
    .eq('project_id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Domain removed' }, { status: 200 });
}
