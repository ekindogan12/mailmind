import { describe, it, expect, beforeEach } from 'vitest';
import { DemoProvider } from '@/lib/providers/demo';
import { demoEmails } from '@/lib/providers/demo-data';

describe('DemoProvider', () => {
  let provider: DemoProvider;

  beforeEach(() => {
    provider = new DemoProvider();
  });

  it('fetches inbox emails', async () => {
    const emails = await provider.getMessages({ folder: 'inbox' });
    expect(emails.length).toBeGreaterThan(0);
    expect(emails.every(e => e.folder === 'inbox')).toBe(true);
  });

  it('filters by account', async () => {
    const emails = await provider.getMessages({ folder: 'inbox', accountId: 'demo-1' });
    expect(emails.every(e => e.accountId === 'demo-1')).toBe(true);
  });

  it('searches emails by subject', async () => {
    const emails = await provider.searchMessages('Q3 Product Strategy');
    expect(emails.length).toBeGreaterThanOrEqual(1);
    expect(emails[0].subject).toContain('Q3 Product Strategy');
  });

  it('searches emails by sender name', async () => {
    const emails = await provider.searchMessages('Sarah');
    expect(emails.length).toBeGreaterThanOrEqual(1);
  });

  it('gets a single email by ID', async () => {
    const email = await provider.getMessage('e1');
    expect(email.id).toBe('e1');
    expect(email.from.name).toBe('Sarah Johnson');
  });

  it('throws for unknown email ID', async () => {
    await expect(provider.getMessage('nonexistent')).rejects.toThrow('Email not found');
  });

  it('toggles star', async () => {
    const before = await provider.getMessage('e2');
    const originalStarred = before.starred;
    await provider.toggleStar('e2', !originalStarred);
    const after = await provider.getMessage('e2');
    expect(after.starred).toBe(!originalStarred);
  });

  it('toggles read status', async () => {
    await provider.toggleRead('e1', true);
    const email = await provider.getMessage('e1');
    expect(email.read).toBe(true);
  });

  it('moves email to archive', async () => {
    await provider.moveMessage('e1', 'archive');
    const email = await provider.getMessage('e1');
    expect(email.folder).toBe('archive');
  });

  it('deletes email (moves to trash)', async () => {
    await provider.deleteMessage('e2');
    const email = await provider.getMessage('e2');
    expect(email.folder).toBe('trash');
  });

  it('applies and removes labels', async () => {
    await provider.applyLabel('e1', 'test-label');
    let email = await provider.getMessage('e1');
    expect(email.labels).toContain('test-label');

    await provider.removeLabel('e1', 'test-label');
    email = await provider.getMessage('e1');
    expect(email.labels).not.toContain('test-label');
  });

  it('returns labels list', async () => {
    const labels = await provider.getLabels();
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0]).toHaveProperty('name');
    expect(labels[0]).toHaveProperty('color');
  });

  it('sends a message', async () => {
    const before = await provider.getMessages({ folder: 'sent' });
    await provider.sendMessage({
      to: [{ name: 'Test', email: 'test@test.com' }],
      subject: 'Test Email',
      body: 'Hello world',
    });
    const after = await provider.getMessages({ folder: 'sent' });
    expect(after.length).toBe(before.length + 1);
  });

  it('sorts emails by date descending', async () => {
    const emails = await provider.getMessages({ folder: 'inbox' });
    for (let i = 1; i < emails.length; i++) {
      expect(new Date(emails[i - 1].date).getTime()).toBeGreaterThanOrEqual(
        new Date(emails[i].date).getTime()
      );
    }
  });
});

describe('Demo Data', () => {
  it('has realistic email data', () => {
    expect(demoEmails.length).toBeGreaterThanOrEqual(10);
  });

  it('includes emails from multiple accounts', () => {
    const accountIds = new Set(demoEmails.map(e => e.accountId));
    expect(accountIds.size).toBeGreaterThanOrEqual(2);
  });

  it('includes various priority levels', () => {
    const categories = new Set(demoEmails.map(e => e.aiCategory).filter(Boolean));
    expect(categories.has('urgent')).toBe(true);
    expect(categories.has('newsletter')).toBe(true);
  });

  it('includes emails with attachments', () => {
    const withAttachments = demoEmails.filter(e => e.attachments.length > 0);
    expect(withAttachments.length).toBeGreaterThan(0);
  });
});
