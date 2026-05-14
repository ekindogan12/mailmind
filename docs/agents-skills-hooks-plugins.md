# MailMind — Agents, Skills, Hooks & Plugins

## Agents

| Agent | File | Role | Input | Output |
|-------|------|------|-------|--------|
| **SummaryAgent** | `api/ai/summarize` | Distills email into 2-3 sentence digest + action items | Email subject, body, sender | `{ summary, actionItems[], sentiment }` |
| **DraftAgent** | `api/ai/draft` | Generates 3 contextual reply suggestions | Email subject, body, sender | `{ drafts[]: { tone, body } }` |
| **PriorityAgent** | `api/ai/prioritize` | Scores email importance 1-5, categorizes | Email subject, body, sender | `{ score, category, reason }` |
| **ClassifyAgent** | Architecture (planned) | Auto-suggests labels/folders for emails | Email content + existing labels | `{ suggestedLabels[], confidence }` |
| **OrchestratorAgent** | `store/useEmailStore` | Coordinates agent workflows, manages cache | User actions | Dispatches to appropriate agent |

## Skills

| Skill | Description | Used By |
|-------|-------------|---------|
| `email-fetch` | Retrieves emails from any connected provider with filtering | EmailList, SearchBar |
| `email-send` | Sends emails via the active provider's transport | ComposeModal |
| `email-search` | Full-text search across subject, body, sender | SearchBar |
| `email-archive` | Moves email to archive folder | EmailDetail actions |
| `email-delete` | Moves email to trash | EmailDetail actions |
| `email-star` | Toggles star/bookmark on email | EmailList, EmailDetail |
| `email-read` | Marks email as read/unread | EmailList (auto on open) |
| `ai-summarize` | Invokes SummaryAgent for email digest | AI Panel (Summary tab) |
| `ai-draft` | Invokes DraftAgent for reply suggestions | AI Panel (Smart Reply tab) |
| `ai-prioritize` | Invokes PriorityAgent for importance scoring | Email list badges |
| `label-apply` | Applies a label to an email | Label manager |
| `label-remove` | Removes a label from an email | Label manager |
| `account-switch` | Switches active email account for filtering | Sidebar account section |

## Hooks (Event-Driven Triggers)

| Hook | Trigger Event | Action | Effect |
|------|---------------|--------|--------|
| `onEmailReceived` | New email arrives in inbox | Auto-run PriorityAgent + ClassifyAgent | Email gets priority badge + label suggestion |
| `onEmailOpened` | User clicks to read email | Mark as read + pre-load SummaryAgent | Summary available instantly in AI panel |
| `onReplyStarted` | User clicks Reply button | Trigger DraftAgent | 3 reply drafts ready in compose modal |
| `onFolderChanged` | User switches folder view | Fetch emails for new folder | Email list updates |
| `onSearchExecuted` | User types in search bar | Debounced search across providers | Filtered email list |
| `onAccountSwitched` | User picks different account | Re-fetch emails for account | Filtered to account's emails |
| `onLabelApplied` | User assigns label to email | Update provider + train ClassifyAgent | Improved future classification |
| `onComposeSubmitted` | User sends email | Send via provider adapter | Email appears in Sent folder |

## Plugins (Provider Integrations)

| Plugin | Provider | Auth Method | Status |
|--------|----------|-------------|--------|
| `gmail-plugin` | Gmail (Google) | OAuth 2.0 (Google APIs) | Architecture ready, needs OAuth credentials |
| `outlook-plugin` | Office 365 (Microsoft) | OAuth 2.0 (MS Graph API) | Architecture ready, needs Azure AD app |
| `imap-plugin` | Yahoo, AOL, generic | IMAP/SMTP (imapflow) | Architecture ready, needs server credentials |
| `demo-plugin` | Demo (in-memory) | None | ✅ Fully functional |
| `ai-engine-plugin` | Anthropic Claude | API Key | ✅ Functional (with fallback to heuristics) |

## Agent Interaction Flow

```
User Action          Hook Fired           Agent(s) Invoked        Result
─────────────        ──────────           ────────────────        ──────
Open Inbox      →    onFolderChanged   →  (fetch emails)       →  Email list rendered
Click Email     →    onEmailOpened     →  SummaryAgent          →  Summary in AI panel
Click Reply     →    onReplyStarted    →  DraftAgent            →  3 draft options shown
Send Email      →    onComposeSubmitted → (provider.send)       →  Email sent
New Email       →    onEmailReceived   →  PriorityAgent +       →  Badge + label
                                          ClassifyAgent             suggestion
```
