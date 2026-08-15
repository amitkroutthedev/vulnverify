# Clariseque

**From Data to Decisiveness: AI-Driven Vulnerability Intelligence.**

In an era of endless CVEs and constant security noise, Clariseque transforms dense technical data into clear, prioritized insights—empowering security professionals to stop triaging and start securing. Built with Next.js 16, React 19, and Google's Gemini AI.

## Features

- **AI-Powered Analysis** - Uses Google Gemini 2.5 Flash to analyze vulnerabilities and provide plain-language explanations
- **Tech Stack Awareness** - Provide your specific tech stack to receive tailored security assessments
- **Conversational Interface** - Ask questions in natural language about CVEs and security issues
- **Chat History** - Persistent chat storage with PostgreSQL for reviewing past security analyses
- **User Authentication** - Secure authentication powered by Clerk

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **AI**: Google Gemini 2.5 Flash via Vercel AI SDK
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **Icons**: Lucide React

## Application Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER JOURNEY                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │     │    Sign In   │     │  Dashboard   │     │   OpenChat   │
│    Page      │────▶│    (Clerk)   │────▶│              │────▶│  Tech Stack  │
│      /       │     │              │     │  /dashboard  │     │  /openchat   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                │                      │
                                                │                      │
                                                ▼                      ▼
                                         ┌──────────────┐     ┌──────────────┐
                                         │   History    │     │    Chat      │
                                         │   /history   │────▶│    /chat     │
                                         └──────────────┘     └──────┬───────┘
                                                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CHAT FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │  /api/chat   │     │   Gemini     │     │  Streaming   │
│   Message    │────▶│   (POST)     │────▶│   2.5 Flash  │────▶│   Response   │
└──────────────┘     └──────┬───────┘     └──────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │   Database   │
                    │              │
                    │ ┌──────────┐ │
                    │ │  users   │ │
                    │ └──────────┘ │
                    │ ┌──────────┐ │
                    │ │  chats   │ │
                    │ └──────────┘ │
                    │ ┌──────────┐ │
                    │ │ messages │ │
                    │ └──────────┘ │
                    └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Request    │     │  Middleware  │     │    Clerk     │     │  Protected   │
│   to Route   │────▶│  (proxy.ts)  │────▶│   Verify     │────▶│    Route     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                │ (if not authenticated)
                                                ▼
                                         ┌──────────────┐
                                         │   Redirect   │
                                         │   to Login   │
                                         └──────────────┘
```

### Flow Description

1. **User Journey**: Users land on the homepage, sign in via Clerk, access the dashboard, and can start new security audits or view chat history.

2. **Chat Flow**: When a user sends a message, it's processed by the `/api/chat` endpoint, saved to PostgreSQL, sent to Google Gemini AI with tech stack context, and streamed back to the user.

3. **Authentication**: All protected routes (`/dashboard`, `/chat`, `/openchat`, `/history`) pass through Clerk middleware. Unauthenticated users are redirected to login.

## License

Private

---

Made in India

Phase 1 — v1 product

VCS provider abstraction — add provider column to connected_repos; build lib/vcs/github.ts behind a VcsProvider interface (not GitLab/Bitbucket yet, just the seam).
GitHub App + Octokit — register the App, lib/vcs/github.ts, app/api/github/install/route.ts, app/api/github/webhook/route.ts, app/repos/page.tsx.
Job queue + worker skeleton — Inngest + standalone worker/ service on Railway.
Scanners — osv-scanner + gitleaks in worker/src/scan.ts; fetch tarball, scan, discard source (non-negotiable).
Normalize findings — worker/src/normalize.ts writes into repo_findings + repo_scan_runs.
Enrich via cve_cache — reuse the existing getOrFetchCve from Phase 0.
Close the AI-triage schema gap + structured triage — migration adding priority/rationale/dev-vs-prod/reachability/remediation columns to repo_findings; lib/triage.ts with generateObject + Zod.
Project chat — chats.repo_id FK; branch generateChatResponse to ground on that repo's findings when set.
Validation checkpoint — test against 10–20 real repos, confirm triage quality + willingness to pay, before touching billing.
Metering — extend usage_records with scan-count/AI-token tracking.
Quotas — enforce plan limits at the API boundary.
Plan tiers — lib/plans.ts (Free/Pro).
Razorpay billing — lib/billing/ behind a BillingProvider interface, using the already-live subscriptions table.