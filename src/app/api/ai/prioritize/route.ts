import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { subject, body, from } = await req.json();

    if (process.env.ANTHROPIC_API_KEY) {
      const { generateText } = await import('ai');
      const { createAnthropic } = await import('@ai-sdk/anthropic');
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const { text } = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: 'Return JSON with: score (1-5 number, 1=highest priority), category (urgent/important/normal/low/newsletter), reason (one sentence).',
        prompt: `Prioritize this email:\nFrom: ${from}\nSubject: ${subject}\n\n${body}`,
      });

      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    }

    // Smart fallback
    const urgentKeywords = /urgent|critical|asap|deadline|immediately|blocking/i;
    const importantKeywords = /review|approval|sign-off|required|mandatory|important/i;
    const newsletterKeywords = /newsletter|unsubscribe|digest|weekly|notification/i;

    let score = 3, category = 'normal', reason = 'Standard email requiring normal attention.';
    if (urgentKeywords.test(subject + body)) {
      score = 1; category = 'urgent'; reason = 'Contains urgent language requiring immediate attention.';
    } else if (importantKeywords.test(subject + body)) {
      score = 2; category = 'important'; reason = 'Contains items requiring review or approval.';
    } else if (newsletterKeywords.test(subject + body)) {
      score = 5; category = 'newsletter'; reason = 'Automated newsletter or notification.';
    }

    return NextResponse.json({ score, category, reason });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to prioritize' }, { status: 500 });
  }
}
