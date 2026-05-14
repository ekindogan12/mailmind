import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a production environment, this is where you would use Resend or SendGrid
    // e.g. import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... });

    console.log(`[Email Sending Mock] To: ${to} | Subject: ${subject}`);
    console.log(`[Email Sending Mock] Body: ${body}`);

    // We simulate a successful send since the user doesn't have an API key yet
    return NextResponse.json({ status: 'success', message: 'Email queued for sending.' });
  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
