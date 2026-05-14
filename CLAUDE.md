# CLAUDE.md — MailMind AI Email Client

## Project Overview
MailMind is an AI-first universal email client built as a mobile-ready PWA. It supports Gmail, Office 365, and IMAP (Yahoo, AOL) with unified inbox, AI-powered summaries, smart reply drafts, and email prioritization.

## Architecture
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Vanilla CSS with custom properties, glassmorphism, dark-mode-first
- **State**: Zustand stores (email, account, AI, UI)
- **AI**: Vercel AI SDK + Anthropic Claude for summarization, drafting, prioritization
- **PWA**: Service worker, web manifest, offline support
- **Deployment**: Vercel (Hobby tier)

## Agent OS Methodology
This project follows the Agent OS pattern with clearly defined:
- **Agents**: Autonomous AI workers (SummaryAgent, DraftAgent, PriorityAgent, ClassifyAgent)
- **Skills**: Reusable capabilities (email-fetch, email-send, ai-summarize, etc.)
- **Hooks**: Event-driven triggers (onEmailReceived, onEmailOpened, onReplyStarted)
- **Plugins**: Provider integrations (gmail-plugin, outlook-plugin, imap-plugin, ai-engine-plugin)

## Project Structure
```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/ai/             # AI endpoint routes
│   ├── api/email/          # Email CRUD routes
│   └── api/auth/           # OAuth routes
├── components/             # React UI components
├── lib/
│   ├── providers/          # Email provider adapters (Gmail, Outlook, IMAP, Demo)
│   ├── ai/                 # AI agents and orchestrator
│   └── utils/              # Shared utilities
└── store/                  # Zustand state stores
```

## Conventions
1. **TypeScript strict mode** — All code must be typed
2. **Server-first** — API keys and provider credentials stay server-side
3. **Mobile-first CSS** — All styles start from mobile, scale up with media queries
4. **Component isolation** — Each component gets its own directory with `.tsx` + `.css`
5. **AI responses cached** — Avoid redundant API calls
6. **Demo mode default** — App runs with demo data when no credentials configured

## Key Commands
```bash
npm run dev       # Start development server
npm run build     # Production build
npm run test      # Run Vitest tests
npm run lint      # ESLint check
```

## Environment Variables
```
ANTHROPIC_API_KEY=        # Claude API key for AI features
GOOGLE_CLIENT_ID=         # Gmail OAuth client ID
GOOGLE_CLIENT_SECRET=     # Gmail OAuth client secret
MICROSOFT_CLIENT_ID=      # O365 OAuth client ID
MICROSOFT_CLIENT_SECRET=  # O365 OAuth client secret
NEXTAUTH_SECRET=          # NextAuth session secret
NEXTAUTH_URL=             # App URL
```

## Multi-Agent Workflow
1. Email arrives → `onEmailReceived` hook fires
2. `PriorityAgent` scores importance (1-5)
3. `ClassifyAgent` suggests labels
4. User opens email → `onEmailOpened` hook fires
5. `SummaryAgent` generates 2-3 sentence digest
6. User clicks reply → `onReplyStarted` hook fires
7. `DraftAgent` generates 3 smart reply options
8. `OrchestratorAgent` coordinates all agent activity, manages queue + cache
