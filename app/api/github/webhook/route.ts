import { pool } from '@/lib/db';
import { githubProvider } from '@/lib/vcs/github';

export async function POST(req: Request) {
  const signature = req.headers.get('x-hub-signature-256');
  const rawBody = await req.text();

  if (!signature || !githubProvider.verifyWebhookSignature(rawBody, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = req.headers.get('x-github-event');
  const payload = JSON.parse(rawBody);

  if (event === 'installation' && payload.action === 'deleted') {
    await pool.query(`DELETE FROM connected_repos WHERE installation_id = $1`, [
      String(payload.installation.id),
    ]);
  }

  // installation_repositories (repos added/removed from an existing install)
  // is a Phase-2 follow-up once push-triggered re-scanning matters.

  return Response.json({ received: true });
}
