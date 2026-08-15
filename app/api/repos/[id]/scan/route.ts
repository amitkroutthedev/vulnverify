import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: repoId } = await params;

  const repoCheck = await pool.query(
    `SELECT id FROM connected_repos WHERE id = $1 AND user_id = $2`,
    [repoId, userId]
  );
  if (repoCheck.rows.length === 0) {
    return Response.json({ error: 'Repo not found' }, { status: 404 });
  }

  const result = await pool.query(
    `INSERT INTO repo_scan_runs (repo_id, status) VALUES ($1, 'queued') RETURNING id, status, started_at`,
    [repoId]
  );

  return Response.json({ scan: result.rows[0] });
}
