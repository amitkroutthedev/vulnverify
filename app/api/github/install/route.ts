import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';
import { githubProvider } from '@/lib/vcs/github';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.redirect(new URL('/sign-in', req.url));
  }

  const installationId = req.nextUrl.searchParams.get('installation_id');
  const setupAction = req.nextUrl.searchParams.get('setup_action');

  if (!installationId || setupAction === 'request') {
    // 'request' = an org owner still needs to approve the install
    return Response.redirect(new URL('/repos?status=pending', req.url));
  }

  const repos = await githubProvider.listAccessibleRepos(installationId);

  for (const r of repos) {
    await pool.query(
      `INSERT INTO connected_repos (user_id, owner, repo, is_private, provider, installation_id)
       VALUES ($1, $2, $3, $4, 'github', $5)
       ON CONFLICT (user_id, owner, repo) DO UPDATE
         SET is_private = $4, installation_id = $5`,
      [userId, r.owner, r.repo, r.isPrivate, installationId]
    );
  }

  return Response.redirect(new URL('/repos?status=connected', req.url));
}
