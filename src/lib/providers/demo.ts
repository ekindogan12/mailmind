import { Email, EmailAccount, EmailLabel, EmailProvider, EmailQuery, EmailDraft, EmailFolder } from '../types';
import { demoEmails, demoAccounts, demoLabels } from './demo-data';

export class DemoProvider implements EmailProvider {
  name = 'demo';
  private emails: Email[] = [...demoEmails];
  private labels: EmailLabel[] = [...demoLabels];

  async connect(): Promise<void> { }
  async disconnect(): Promise<void> { }

  async getMessages(query: EmailQuery): Promise<Email[]> {
    let filtered = [...this.emails];
    if (query.folder) filtered = filtered.filter(e => e.folder === query.folder);
    if (query.accountId) filtered = filtered.filter(e => e.accountId === query.accountId);
    if (query.unreadOnly) filtered = filtered.filter(e => !e.read);
    if (query.label) filtered = filtered.filter(e => e.labels.includes(query.label!));
    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.subject.toLowerCase().includes(q) ||
        e.snippet.toLowerCase().includes(q) ||
        e.from.name.toLowerCase().includes(q) ||
        e.from.email.toLowerCase().includes(q)
      );
    }
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const page = query.page || 0;
    const limit = query.limit || 50;
    return filtered.slice(page * limit, (page + 1) * limit);
  }

  async getMessage(id: string): Promise<Email> {
    const email = this.emails.find(e => e.id === id);
    if (!email) throw new Error('Email not found');
    return email;
  }

  async sendMessage(draft: EmailDraft): Promise<void> {
    const newEmail: Email = {
      id: `sent-${Date.now()}`, accountId: 'demo-1', threadId: `thread-${Date.now()}`,
      from: { name: 'You', email: 'you@mailmind.demo' },
      to: draft.to, subject: draft.subject, snippet: draft.body.slice(0, 100),
      body: draft.body, date: new Date().toISOString(), read: true, starred: false,
      labels: [], folder: 'sent', attachments: [], priority: 3,
    };
    this.emails.unshift(newEmail);
  }

  async moveMessage(id: string, folder: EmailFolder): Promise<void> {
    const email = this.emails.find(e => e.id === id);
    if (email) email.folder = folder;
  }

  async deleteMessage(id: string): Promise<void> {
    const email = this.emails.find(e => e.id === id);
    if (email) email.folder = 'trash';
  }

  async toggleRead(id: string, read: boolean): Promise<void> {
    const email = this.emails.find(e => e.id === id);
    if (email) email.read = read;
  }

  async toggleStar(id: string, starred: boolean): Promise<void> {
    const email = this.emails.find(e => e.id === id);
    if (email) email.starred = starred;
  }

  async searchMessages(query: string): Promise<Email[]> {
    return this.getMessages({ search: query });
  }

  async getLabels(): Promise<EmailLabel[]> {
    return this.labels;
  }

  async applyLabel(messageId: string, labelId: string): Promise<void> {
    const email = this.emails.find(e => e.id === messageId);
    if (email && !email.labels.includes(labelId)) email.labels.push(labelId);
  }

  async removeLabel(messageId: string, labelId: string): Promise<void> {
    const email = this.emails.find(e => e.id === messageId);
    if (email) email.labels = email.labels.filter(l => l !== labelId);
  }
}

export { demoAccounts, demoLabels };
