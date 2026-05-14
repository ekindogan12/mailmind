import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const from = body.from || body.sender || '';
    const to = body.to || '';
    const subject = body.subject || '(No Subject)';
    const emailBody = body.text || body.body || '';

    // Filter: Ignore no-reply emails
    const lowerFrom = from.toLowerCase();
    if (lowerFrom.includes('noreply') || lowerFrom.includes('no-reply') || lowerFrom.includes('do-not-reply')) {
      return NextResponse.json({ status: 'ignored', reason: 'no-reply address' });
    }

    // In production with a DB, this would save to the database.
    // For now, log and acknowledge.
    console.log(`[Inbound Webhook] From: ${from} | Subject: ${subject}`);
    console.log(`[Inbound Webhook] Body: ${emailBody}`);

    return NextResponse.json({
      status: 'success',
      email: { from, to, subject, body: emailBody },
    });
  } catch (error) {
    console.error('Inbound webhook error:', error);
    return NextResponse.json({ error: 'Failed to process inbound email' }, { status: 500 });
  }
}
