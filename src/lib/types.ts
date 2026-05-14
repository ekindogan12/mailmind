// ============================================================
// MailMind — Email Types & Interfaces
// ============================================================

export interface EmailAccount {
  id: string;
  email: string;
  name: string;
  provider: 'gmail' | 'outlook' | 'imap' | 'demo';
  avatar?: string;
  color: string;
  unreadCount: number;
  connected: boolean;
}

export interface EmailLabel {
  id: string;
  name: string;
  color: string;
  count: number;
  icon?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface Email {
  id: string;
  accountId: string;
  threadId: string;
  from: EmailContact;
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  subject: string;
  snippet: string;
  body: string;
  bodyHtml?: string;
  date: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  folder: string;
  attachments: EmailAttachment[];
  priority: EmailPriority;
  aiSummary?: string;
  aiCategory?: string;
  threadMessages?: Email[];
}

export interface EmailContact {
  name: string;
  email: string;
  avatar?: string;
}

export interface EmailDraft {
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  subject: string;
  body: string;
  replyToId?: string;
  forwardFromId?: string;
  attachments?: File[];
}

export type EmailPriority = 1 | 2 | 3 | 4 | 5;

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash' | 'spam' | 'starred';

export interface EmailQuery {
  folder?: EmailFolder;
  accountId?: string;
  search?: string;
  label?: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

// AI Types
export interface AISummary {
  emailId: string;
  summary: string;
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  generatedAt: string;
}

export interface AIDraft {
  emailId: string;
  drafts: {
    tone: 'positive' | 'negative';
    body: string;
  }[];
  generatedAt: string;
}

export interface AIPriority {
  emailId: string;
  score: EmailPriority;
  category: 'urgent' | 'important' | 'normal' | 'low' | 'newsletter';
  reason: string;
}

// Provider Interface
export interface EmailProvider {
  name: string;
  connect(credentials: Record<string, string>): Promise<void>;
  disconnect(): Promise<void>;
  getMessages(query: EmailQuery): Promise<Email[]>;
  getMessage(id: string): Promise<Email>;
  sendMessage(draft: EmailDraft): Promise<void>;
  moveMessage(id: string, folder: EmailFolder): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  toggleRead(id: string, read: boolean): Promise<void>;
  toggleStar(id: string, starred: boolean): Promise<void>;
  searchMessages(query: string): Promise<Email[]>;
  getLabels(): Promise<EmailLabel[]>;
  applyLabel(messageId: string, labelId: string): Promise<void>;
  removeLabel(messageId: string, labelId: string): Promise<void>;
}
