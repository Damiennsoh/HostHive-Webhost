import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getCoolifyClient } from '@/lib/coolify-client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDeployEmail } from '@/lib/resend';
import { rateLimit } from '@/lib/rate-limit';

const pushPayloadSchema = z.object({
  repository: z.object({ html_url: z.string().url() }),
  ref: z.string().min(1),
  after: z.string().min(1),
  head_commit: z
    .object({
      message: z.string(),
      author: z.object({ name: z.string() }),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`webhook:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  if (process.env.GITHUB_WEBHOOK_SECRET) {
    const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');

    if (signature !== digest) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const event = req.headers.get('x-github-event');
  if (event !== 'push') {
    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
  }

  const parsed = pushPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid push payload' }, { status: 400 });
  }

  const { repository, ref, after: commitSha, head_commit } = parsed.data;
  const branch = ref.replace('refs/heads/', '');
  const repoUrl = repository.html_url;

  const supabase = createAdminClient();
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, profiles(email)')
    .eq('git_repo_url', repoUrl)
    .eq('git_branch', branch)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (!project.coolify_uuid) {
    return NextResponse.json({ error: 'Project not linked to Coolify' }, { status: 422 });
  }

  const profileEmail = (project.profiles as { email: string } | null)?.email;

  try {
    const coolify = getCoolifyClient();
    const deployment = await coolify.deployProject(project.coolify_uuid, {
      commit_sha: commitSha,
    });

    const { data: dbDeploy, error: dbError } = await supabase
      .from('deployments')
      .insert({
        project_id: project.id,
        user_id: project.user_id,
        coolify_deploy_id: deployment.uuid,
        status: 'queued',
        trigger: 'github_push',
        commit_sha: commitSha,
        commit_message: head_commit?.message ?? null,
        commit_author: head_commit?.author?.name ?? null,
        branch,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    await supabase.from('projects').update({ status: 'deploying' }).eq('id', project.id);

    return NextResponse.json({
      success: true,
      deploymentId: dbDeploy?.id,
      coolifyId: deployment.uuid,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Deployment failed';
    console.error('[Webhook] Deployment trigger failed:', err);

    if (profileEmail) {
      await sendDeployEmail('deploy_failed', {
        to: profileEmail,
        projectName: project.name,
        errorMessage: message,
        commitMessage: head_commit?.message,
        branchName: branch,
      });
    }

    return NextResponse.json({ error: 'Deployment failed' }, { status: 500 });
  }
}
