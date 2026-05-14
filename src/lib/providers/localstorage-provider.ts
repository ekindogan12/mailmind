import { EmailProvider, EmailQuery, Email, EmailDraft, EmailFolder, EmailLabel } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class LocalStorageProvider implements EmailProvider {
  name = 'LocalStorageProvider';

  private getStorage(): Email[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('mailmind_emails');
    return data ? JSON.parse(data) : [];
  }

  private setStorage(emails: Email[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mailmind_emails', JSON.stringify(emails));
    }
  }

  async connect(credentials: Record<string, string>): Promise<void> {}
  async disconnect(): Promise<void> {}

  async getMessages(query: EmailQuery): Promise<Email[]> {
    let emails = this.getStorage();
    if (query.folder) {
      if (query.folder === 'starred') emails = emails.filter(e => e.starred);
      else emails = emails.filter(e => e.folder === query.folder);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      emails = emails.filter(e => 
        e.subject.toLowerCase().includes(s) || 
        e.body.toLowerCase().includes(s) || 
        e.from.name.toLowerCase().includes(s)
      );
    }
    return emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getMessage(id: string): Promise<Email> {
    const email = this.getStorage().find(e => e.id === id);
    if (!email) throw new Error('Not found');
    return email;
  }

  async sendMessage(draft: EmailDraft): Promise<void> {
    console.log('[Simulated Send] To:', draft.to, 'Subject:', draft.subject);
    const emails = this.getStorage();
    emails.push({
      id: uuidv4(),
      accountId: 'local',
      threadId: uuidv4(),
      from: { name: 'You', email: 'you@mailmind.app' },
      to: draft.to,
      subject: draft.subject,
      snippet: draft.body.substring(0, 50),
      body: draft.body,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      labels: [],
      folder: 'sent',
      attachments: [],
      priority: 3,
    });
    this.setStorage(emails);
  }

  async moveMessage(id: string, folder: EmailFolder): Promise<void> {
    const emails = this.getStorage();
    const idx = emails.findIndex(e => e.id === id);
    if (idx !== -1) {
      emails[idx].folder = folder;
      this.setStorage(emails);
    }
  }

  async deleteMessage(id: string): Promise<void> {
    const emails = this.getStorage();
    const idx = emails.findIndex(e => e.id === id);
    if (idx !== -1) {
      emails[idx].folder = 'trash';
      this.setStorage(emails);
    }
  }

  async toggleRead(id: string, read: boolean): Promise<void> {
    const emails = this.getStorage();
    const idx = emails.findIndex(e => e.id === id);
    if (idx !== -1) {
      emails[idx].read = read;
      this.setStorage(emails);
    }
  }

  async toggleStar(id: string, starred: boolean): Promise<void> {
    const emails = this.getStorage();
    const idx = emails.findIndex(e => e.id === id);
    if (idx !== -1) {
      emails[idx].starred = starred;
      this.setStorage(emails);
    }
  }

  async searchMessages(query: string): Promise<Email[]> {
    return this.getMessages({ search: query });
  }

  async getLabels(): Promise<EmailLabel[]> { return []; }
  async applyLabel(messageId: string, labelId: string): Promise<void> {}
  async removeLabel(messageId: string, labelId: string): Promise<void> {}

  // Helper method for demo simulation
  simulateIncoming(email: Partial<Email>) {
    const emails = this.getStorage();
    emails.push({
      id: uuidv4(),
      accountId: 'local',
      threadId: uuidv4(),
      from: { name: 'Demo User', email: 'demo@example.com' },
      to: [{ name: 'Me', email: 'me@mailmind.app' }],
      subject: 'Test Email',
      snippet: '',
      body: 'Test body',
      date: new Date().toISOString(),
      read: false,
      starred: false,
      labels: [],
      folder: 'inbox',
      attachments: [],
      priority: 3,
      ...email
    } as Email);
    this.setStorage(emails);
  }
}

export const localStorageProvider = new LocalStorageProvider();
