import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const POLL_INTERVAL_MS = 5000;

async function claimNextJob() {
  const result = await pool.query(`
    UPDATE repo_scan_runs
    SET status = 'running', started_at = NOW()
    WHERE id = (
      SELECT id FROM repo_scan_runs
      WHERE status = 'queued'
      ORDER BY started_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, repo_id
  `);
  return result.rows[0] ?? null;
}

async function processJob(job: { id: string; repo_id: string }) {
  try {
    console.log(`[worker] Starting scan ${job.id} for repo ${job.repo_id}`);

    // P1.4/P1.5 go here: fetch tarball, run osv-scanner + gitleaks,
    // normalize into repo_findings, discard extracted source.

    await pool.query(
      `UPDATE repo_scan_runs SET status = 'completed', finished_at = NOW() WHERE id = $1`,
      [job.id]
    );
  } catch (err: any) {
    console.error(`[worker] Scan ${job.id} failed:`, err);
    await pool.query(
      `UPDATE repo_scan_runs SET status = 'failed', finished_at = NOW(), error = $2 WHERE id = $1`,
      [job.id, err?.message ?? 'Unknown error']
    );
  }
}

async function loop() {
  const job = await claimNextJob();
  if (job) {
    await processJob(job);
    setImmediate(loop);
  } else {
    setTimeout(loop, POLL_INTERVAL_MS);
  }
}

loop();
console.log('[worker] Started, polling for scan jobs...');
