import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { subject, body, from } = await req.json();

    // If Anthropic key is configured, use it
    if (process.env.ANTHROPIC_API_KEY) {
      const { generateText } = await import('ai');
      const { createAnthropic } = await import('@ai-sdk/anthropic');
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const { text } = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: 'You are an email assistant. Return JSON only with keys: summary (2-3 sentences), actionItems (array of strings), sentiment (positive/neutral/negative/urgent).',
        prompt: `Summarize this email:\nFrom: ${from}\nSubject: ${subject}\n\n${body}`,
      });

      const parsed = JSON.parse(text);
      return NextResponse.json({ ...parsed, generatedAt: new Date().toISOString() });
    }

    // Fallback demo response
    const words = body.split(/\s+/).length;
    const hasDeadline = /deadline|eod|by friday|urgent|asap/i.test(body);
    return NextResponse.json({
      summary: `${from} sent an email about "${subject}". ${words > 50 ? 'This is a detailed message covering multiple points.' : 'This is a brief message.'} ${hasDeadline ? 'Contains time-sensitive action items.' : ''}`,
      actionItems: hasDeadline ? ['Review and respond promptly', 'Check deadline requirements'] : ['Review the email', 'Respond if needed'],
      sentiment: hasDeadline ? 'urgent' : 'neutral',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
