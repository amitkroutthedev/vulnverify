import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await pool.query(
    `SELECT id, owner, repo, is_private, last_scanned_at, created_at
     FROM connected_repos
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return Response.json({ repos: result.rows });
}
