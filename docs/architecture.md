# MailMind Architecture — One-Page Overview

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    MailMind PWA Client                        │
│              (Next.js 14 + App Router + PWA)                 │
├──────────────┬───────────────┬───────────────┬───────────────┤
│   Sidebar    │  Email List   │ Email Detail  │ Compose Modal │
│  • Folders   │  • Search     │  • Thread     │  • New/Reply  │
│  • Labels    │  • Filters    │  • AI Panel   │  • Forward    │
│  • Accounts  │  • Priority   │  • Actions    │  • Rich Edit  │
├──────────────┴───────────────┴───────────────┴───────────────┤
│                   State Management (Zustand)                  │
│         emailStore | accountStore | aiStore | uiStore         │
├──────────────────────────────────────────────────────────────┤
│                  Next.js API Routes (/api/)                   │
│    /ai/summarize  |  /ai/draft  |  /ai/prioritize            │
│    /email/*       |  /auth/*    |  /accounts/*                │
├──────────────────────────────────────────────────────────────┤
│              Provider Adapter Layer (Strategy Pattern)        │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Gmail   │ │  Outlook   │ │   IMAP   │ │     Demo     │  │
│  │ (Google  │ │ (MS Graph  │ │(imapflow)│ │ (In-memory)  │  │
│  │   API)   │ │    API)    │ │          │ │              │  │
│  └──────────┘ └────────────┘ └──────────┘ └──────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                    AI Engine (Multi-Agent)                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────┐  │
│  │ Summary   │ │  Draft    │ │ Priority  │ │  Classify   │  │
│  │  Agent    │ │  Agent    │ │  Agent    │ │   Agent     │  │
│  └───────────┘ └───────────┘ └───────────┘ └─────────────┘  │
│              Vercel AI SDK + Anthropic Claude                 │
├──────────────────────────────────────────────────────────────┤
│   PWA Layer: Service Worker + Manifest + Offline Support     │
└──────────────────────────────────────────────────────────────┘
```

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Vanilla CSS (dark glassmorphism, CSS custom properties) |
| State | Zustand |
| AI | Vercel AI SDK + Anthropic Claude 3.5 Sonnet |
| PWA | Web Manifest + Service Worker |
| Deployment | Vercel (Hobby tier) |
| Testing | Vitest + React Testing Library |

## Data Flow
1. **User opens inbox** → Zustand store calls `fetchEmails()` → Provider adapter returns emails
2. **User reads email** → `selectEmail()` marks as read → Detail panel renders
3. **AI Summary** → Frontend calls `/api/ai/summarize` → Claude API → JSON response cached in store
4. **AI Reply** → Frontend calls `/api/ai/draft` → Claude generates 3 tone variants → User picks one
5. **Compose/Send** → Provider adapter's `sendMessage()` → Email sent via SMTP/API

## Key Design Decisions
- **Provider Pattern**: Abstract `EmailProvider` interface allows swapping Gmail/Outlook/IMAP/Demo
- **AI Fallback**: All AI routes gracefully fall back to intelligent heuristics when no API key is set
- **Mobile-First**: CSS starts from 375px mobile, scales up with media queries
- **Demo-Default**: App works fully without any external API keys using in-memory demo data
- **Server-Only Secrets**: All API keys and OAuth tokens stay in Next.js server routes
