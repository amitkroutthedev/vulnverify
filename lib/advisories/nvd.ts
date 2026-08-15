export interface NvdCveRecord {
  id: string;
  descriptions?: { lang: string; value: string }[];
  metrics?: Record<string, { cvssData: { baseScore: number; baseSeverity?: string } }[]>;
  references?: { url: string }[];
}

// NVD CVE API v2.0. Unauthenticated requests are rate-limited to 5 per
// rolling 30s window, so this must always be called behind the cve_cache
// cache-first lookup in lib/advisories/cache.ts, never directly per-message.
export async function fetchNvdCve(cveId: string): Promise<NvdCveRecord | null> {
  const res = await fetch(
    `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveId)}`,
    {
      headers: process.env.NVD_API_KEY
        ? { apiKey: process.env.NVD_API_KEY }
        : undefined,
    }
  );

  if (!res.ok) {
    throw new Error(`NVD lookup failed for ${cveId}: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const vuln = data.vulnerabilities?.[0]?.cve;
  return vuln ?? null;
}
