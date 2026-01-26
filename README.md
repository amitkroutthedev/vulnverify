# VulnVerify

An AI-powered vulnerability management platform that transforms complex CVE data into clear, actionable security insights. Built with Next.js 16, React 19, and Google's Gemini AI.

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
