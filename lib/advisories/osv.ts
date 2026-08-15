export interface OsvVulnerability {
  id: string;
  summary?: string;
  details?: string;
  severity?: { type: string; score: string }[];
  references?: { type: string; url: string }[];
  aliases?: string[];
}

// OSV.dev serves a vuln by any of its known IDs/aliases, including CVE IDs.
// No API key required. Returns null if OSV has no record for this ID.
export async function fetchOsvVulnerability(id: string): Promise<OsvVulnerability | null> {
  const res = await fetch(`https://api.osv.dev/v1/vulns/${encodeURIComponent(id)}`);

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`OSV lookup failed for ${id}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
