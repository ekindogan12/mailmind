import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // We expect a generic JSON payload here for inbound emails.
    // If using Resend or SendGrid Inbound Parse, you may need to parse formData.
    // For simplicity and immediate compatibility with testing, we'll parse JSON.
    const body = await req.json();

    const from = body.from || body.sender || '';
    const to = body.to || '';
    const subject = body.subject || '(No Subject)';
    const emailBody = body.text || body.body || '';

    // Phase 2 Filter: Ignore no-reply emails
    const lowerFrom = from.toLowerCase();
    if (lowerFrom.includes('noreply') || lowerFrom.includes('no-reply') || lowerFrom.includes('do-not-reply')) {
      return NextResponse.json({ status: 'ignored', reason: 'no-reply address' });
    }

    // Default account for webhook received emails
    let account = await db.account.findFirst();
    if (!account) {
      account = await db.account.create({
        data: {
          email: 'inbound@mailmind.app',
          name: 'MailMind Inbound',
          provider: 'webhook',
          color: '#7c5cfc',
        }
      });
    }

    // Save to DB
    const newEmail = await db.email.create({
      data: {
        accountId: account.id,
        threadId: `t-${Date.now()}`,
        from: JSON.stringify({ name: from.split('<')[0].trim() || from, email: from }),
        to: JSON.stringify([{ name: to.split('<')[0].trim() || to, email: to }]),
        subject,
        snippet: emailBody.substring(0, 100).replace(/\n/g, ' '),
        body: emailBody,
        date: new Date().toISOString(),
        labels: JSON.stringify(['inbox']),
        attachments: JSON.stringify([]),
        folder: 'inbox',
      }
    });

    return NextResponse.json({ status: 'success', id: newEmail.id });
  } catch (error) {
    console.error('Inbound webhook error:', error);
    return NextResponse.json({ error: 'Failed to process inbound email' }, { status: 500 });
  }
}
