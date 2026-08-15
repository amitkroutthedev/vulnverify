import { pool } from "@/lib/db"
import { fetchOsvVulnerability } from "./osv"
import { fetchNvdCve } from "./nvd"

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function getOrFetchCve(cveId: string) {
    const cached = await pool.query(
        `SELECT data, fetched_at FROM cve_cache WHERE cve_id = $1`,
        [cveId]
    )
    if (cached.rows[0] && Date.now() - new Date(cached.rows[0].fetched_at).getTime() < CACHE_TTL_MS) {
        return cached.rows[0].data;
    }

    const osv = await fetchOsvVulnerability(cveId);
    const nvd = osv ? null : await fetchNvdCve(cveId)
    const data = osv ?? nvd;

     if (data) {
    await pool.query(
      `INSERT INTO cve_cache (cve_id, data, fetched_at) VALUES ($1, $2, NOW())
       ON CONFLICT (cve_id) DO UPDATE SET data = $2, fetched_at = NOW()`,
      [cveId, data]
    );
  }
  return data; // null if neither source has it — chat prompt must say "no data found", not invent one
  
} 