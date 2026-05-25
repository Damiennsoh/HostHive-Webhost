'use server';

import { redirect } from 'next/navigation';

export async function connectGitHubAction() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is not configured');
  }

  const scope = 'repo,user';
  // Use a secure state parameter in production
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}`;

  redirect(authUrl);
}
