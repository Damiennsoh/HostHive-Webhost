import { Resend } from 'resend';
import { createElement } from 'react';
import { DeploySuccessEmail } from '@/emails/deploy-success';
import { DeployFailedEmail } from '@/emails/deploy-failed';
import { UptimeAlertEmail } from '@/emails/uptime-alert';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hosthive.app';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export type EmailType =
  | 'deploy_success'
  | 'deploy_failed'
  | 'uptime_alert'
  | 'downtime_alert'
  | 'welcome';

export interface DeployEmailPayload {
  to: string;
  projectName: string;
  projectUrl?: string;
  branchName?: string;
  commitSha?: string;
  commitMessage?: string;
  deployDuration?: string;
  errorMessage?: string;
  dashboardUrl?: string;
}

export async function sendDeployEmail(
  type: EmailType,
  payload: DeployEmailPayload
): Promise<{ id: string } | null> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not configured — skipping email');
    return null;
  }

  const resend = getResend();
  if (!resend) return null;

  try {
    const dashboardUrl = payload.dashboardUrl ?? `${APP_URL}/dashboard`;
    let subject: string;
    let react: React.ReactElement;

    switch (type) {
      case 'deploy_success':
        subject = `Deployment successful — ${payload.projectName}`;
        react = createElement(DeploySuccessEmail, { ...payload, dashboardUrl });
        break;
      case 'deploy_failed':
        subject = `Deployment failed — ${payload.projectName}`;
        react = createElement(DeployFailedEmail, { ...payload, dashboardUrl });
        break;
      case 'uptime_alert':
      case 'downtime_alert':
        subject = `Uptime alert — ${payload.projectName} is down`;
        react = createElement(UptimeAlertEmail, { ...payload, dashboardUrl });
        break;
      default:
        return null;
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: payload.to,
      subject,
      react,
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    console.error('[Resend] Failed to send email:', err);
    return null;
  }
}
