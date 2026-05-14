import { create } from 'zustand';
import { Email, EmailAccount, EmailLabel, EmailFolder, AISummary, AIDraft } from '@/lib/types';
import { DemoProvider, demoAccounts, demoLabels } from '@/lib/providers/demo';

const provider = new DemoProvider();

interface EmailState {
  emails: Email[];
  selectedEmail: Email | null;
  accounts: EmailAccount[];
  activeAccountId: string | null;
  labels: EmailLabel[];
  currentFolder: EmailFolder;
  searchQuery: string;
  isLoading: boolean;
  isSidebarOpen: boolean;
  isComposeOpen: boolean;
  composeMode: 'new' | 'reply' | 'forward';
  replyToEmail: Email | null;
  aiSummary: AISummary | null;
  aiDrafts: AIDraft | null;
  aiLoading: boolean;
  fetchEmails: () => Promise<void>;
  selectEmail: (email: Email | null) => void;
  setFolder: (folder: EmailFolder) => void;
  setSearch: (query: string) => void;
  setActiveAccount: (id: string | null) => void;
  toggleSidebar: () => void;
  openCompose: (mode: 'new' | 'reply' | 'forward', email?: Email) => void;
  closeCompose: () => void;
  toggleStar: (id: string) => void;
  toggleRead: (id: string) => void;
  archiveEmail: (id: string) => void;
  deleteEmail: (id: string) => void;
  sendEmail: (to: string, subject: string, body: string) => Promise<void>;
  generateSummary: (email: Email) => Promise<void>;
  generateDrafts: (email: Email) => Promise<void>;
  clearAI: () => void;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  emails: [],
  selectedEmail: null,
  accounts: demoAccounts,
  activeAccountId: null,
  labels: demoLabels,
  currentFolder: 'inbox',
  searchQuery: '',
  isLoading: false,
  isSidebarOpen: false,
  isComposeOpen: false,
  composeMode: 'new',
  replyToEmail: null,
  aiSummary: null,
  aiDrafts: null,
  aiLoading: false,

  fetchEmails: async () => {
    set({ isLoading: true });
    const { currentFolder, activeAccountId, searchQuery } = get();
    const emails = await provider.getMessages({
      folder: currentFolder,
      accountId: activeAccountId || undefined,
      search: searchQuery || undefined,
    });
    set({ emails, isLoading: false });
  },

  selectEmail: (email) => {
    if (email && !email.read) {
      provider.toggleRead(email.id, true);
      email.read = true;
    }
    set({ selectedEmail: email, aiSummary: null, aiDrafts: null });
  },

  setFolder: (folder) => {
    set({ currentFolder: folder, selectedEmail: null });
    get().fetchEmails();
  },

  setSearch: (query) => {
    set({ searchQuery: query });
    get().fetchEmails();
  },

  setActiveAccount: (id) => {
    set({ activeAccountId: id, selectedEmail: null });
    get().fetchEmails();
  },

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

  openCompose: (mode, email) => set({ isComposeOpen: true, composeMode: mode, replyToEmail: email || null }),
  closeCompose: () => set({ isComposeOpen: false, replyToEmail: null }),

  toggleStar: async (id) => {
    const email = get().emails.find((e) => e.id === id);
    if (email) {
      await provider.toggleStar(id, !email.starred);
      set((s) => ({
        emails: s.emails.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)),
        selectedEmail: s.selectedEmail?.id === id ? { ...s.selectedEmail, starred: !s.selectedEmail.starred } : s.selectedEmail,
      }));
    }
  },

  toggleRead: async (id) => {
    const email = get().emails.find((e) => e.id === id);
    if (email) {
      await provider.toggleRead(id, !email.read);
      set((s) => ({
        emails: s.emails.map((e) => (e.id === id ? { ...e, read: !e.read } : e)),
      }));
    }
  },

  archiveEmail: async (id) => {
    await provider.moveMessage(id, 'archive');
    set((s) => ({
      emails: s.emails.filter((e) => e.id !== id),
      selectedEmail: s.selectedEmail?.id === id ? null : s.selectedEmail,
    }));
  },

  deleteEmail: async (id) => {
    await provider.deleteMessage(id);
    set((s) => ({
      emails: s.emails.filter((e) => e.id !== id),
      selectedEmail: s.selectedEmail?.id === id ? null : s.selectedEmail,
    }));
  },

  sendEmail: async (to, subject, body) => {
    await provider.sendMessage({
      to: [{ name: to, email: to }],
      subject,
      body,
    });
    get().closeCompose();
  },

  generateSummary: async (email) => {
    set({ aiLoading: true });
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: email.subject, body: email.body, from: email.from.name }),
      });
      const data = await res.json();
      set({ aiSummary: { emailId: email.id, ...data }, aiLoading: false });
    } catch {
      set({
        aiSummary: {
          emailId: email.id,
          summary: email.aiSummary || 'AI summary generation simulated. Connect an Anthropic API key for live summaries.',
          actionItems: ['Review the email content', 'Respond if action is needed'],
          sentiment: 'neutral',
          generatedAt: new Date().toISOString(),
        },
        aiLoading: false,
      });
    }
  },

  generateDrafts: async (email) => {
    set({ aiLoading: true });
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: email.subject, body: email.body, from: email.from.name }),
      });
      const data = await res.json();
      set({ aiDrafts: { emailId: email.id, ...data }, aiLoading: false });
    } catch {
      set({
        aiDrafts: {
          emailId: email.id,
          drafts: [
            { tone: 'professional', body: `Dear ${email.from.name},\n\nThank you for your email. I've reviewed the details and will follow up with my thoughts shortly.\n\nBest regards,\nAlex` },
            { tone: 'casual', body: `Hey ${email.from.name}!\n\nThanks for sending this over. Looks great — let me take a closer look and get back to you.\n\nCheers!` },
            { tone: 'concise', body: `Hi ${email.from.name},\n\nReceived, thanks. Will review and respond by EOD.\n\nAlex` },
          ],
          generatedAt: new Date().toISOString(),
        },
        aiLoading: false,
      });
    }
  },

  clearAI: () => set({ aiSummary: null, aiDrafts: null }),
}));
