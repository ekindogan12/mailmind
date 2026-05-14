import { EmailProvider, EmailQuery, Email, EmailDraft, EmailFolder, EmailLabel } from '../types';

export class DbProvider implements EmailProvider {
  name = 'DbProvider';

  async connect(credentials: Record<string, string>): Promise<void> {
    // No-op for DB
  }

  async disconnect(): Promise<void> {
    // No-op
  }

  async getMessages(query: EmailQuery): Promise<Email[]> {
    const params = new URLSearchParams();
    if (query.folder) params.append('folder', query.folder);
    if (query.search) params.append('search', query.search);
    
    const res = await fetch(`/api/emails?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch emails');
    return res.json();
  }

  async getMessage(id: string): Promise<Email> {
    throw new Error('Method not implemented.');
  }

  async sendMessage(draft: EmailDraft): Promise<void> {
    await fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: draft.to[0]?.email || 'unknown',
        subject: draft.subject,
        body: draft.body,
      }),
    });
  }

  async moveMessage(id: string, folder: EmailFolder): Promise<void> {
    await fetch(`/api/emails/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });
  }

  async deleteMessage(id: string): Promise<void> {
    await fetch(`/api/emails/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleRead(id: string, read: boolean): Promise<void> {
    await fetch(`/api/emails/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
  }

  async toggleStar(id: string, starred: boolean): Promise<void> {
    await fetch(`/api/emails/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred }),
    });
  }

  async searchMessages(query: string): Promise<Email[]> {
    return this.getMessages({ search: query });
  }

  async getLabels(): Promise<EmailLabel[]> {
    return [];
  }

  async applyLabel(messageId: string, labelId: string): Promise<void> {}
  async removeLabel(messageId: string, labelId: string): Promise<void> {}
}

export const dbProvider = new DbProvider();
