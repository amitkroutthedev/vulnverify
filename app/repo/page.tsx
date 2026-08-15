"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface ConnectedRepo {
  id: string;
  owner: string;
  repo: string;
  is_private: boolean;
  last_scanned_at: string | null;
  created_at: string;
}

const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;

export default function ReposPage() {
  const [repos, setRepos] = useState<ConnectedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    fetch("/api/repos")
      .then((res) => res.json())
      .then((data) => setRepos(data.repos || []))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-base font-medium text-gray-900">Clariseque</span>
        </Link>
        <UserButton />
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-normal text-gray-900">Connected Repositories</h1>
          <a
            href={`https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`}
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Connect GitHub
          </a>
        </div>

        {status === "pending" && (
          <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Installation request sent — waiting on org owner approval.
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : repos.length === 0 ? (
          <div className="rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No repositories connected yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {repos.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">{r.owner}/{r.repo}</p>
                  <p className="text-xs text-gray-500">
                    {r.is_private ? "Private" : "Public"} ·{" "}
                    {r.last_scanned_at
                      ? `Last scanned ${new Date(r.last_scanned_at).toLocaleDateString()}`
                      : "Never scanned"}
                  </p>
                </div>
                <button
                  disabled
                  title="Scanning isn't wired up yet — next Phase 1 milestone"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                >
                  Scan
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
