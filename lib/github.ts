import crypto from 'crypto';
import { z } from 'zod';

export const GitHubTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
});

export type GitHubTokenResponse = z.infer<typeof GitHubTokenSchema>;

export const GitHubRepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  html_url: z.string().url(),
  description: z.string().nullable(),
  default_branch: z.string(),
  updated_at: z.string(),
});

export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;

export async function exchangeCodeForToken(code: string): Promise<GitHubTokenResponse> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GitHub credentials not configured');
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub token exchange failed: ${error}`);
  }

  const data = await res.json();
  return GitHubTokenSchema.parse(data);
}

export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch GitHub repos: ${error}`);
  }

  const data = await res.json();
  return z.array(GitHubRepoSchema).parse(data);
}

export function validateGitHubWebhook(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function fetchGitHubUser(token: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch GitHub user: ${error}`);
  }

  return res.json();
}
