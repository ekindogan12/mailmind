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
        system: 'You are an email assistant. Return JSON only with key "drafts": array of 10 objects. The first 5 objects must have "tone": "positive" and a "body" (reply text). The next 5 objects must have "tone": "negative" and a "body". Provide varied, realistic responses.',
        prompt: `Generate 10 reply drafts (5 positive, 5 negative) for:\nFrom: ${from}\nSubject: ${subject}\n\n${body}`,
      });

      const parsed = JSON.parse(text);
      return NextResponse.json({ ...parsed, generatedAt: new Date().toISOString() });
    }

    // Fallback logic if no API key is provided
    return NextResponse.json({
      drafts: [
        { tone: 'positive', body: `Hi ${from},\n\nThank you for reaching out! Yes, we can definitely move forward with this. Let me know the next steps.\n\nBest,\nAlex` },
        { tone: 'positive', body: `Dear ${from},\n\nThis sounds great. I fully approve and look forward to seeing the results.\n\nBest regards,\nAlex` },
        { tone: 'positive', body: `Hello ${from},\n\nI agree with your proposal. Let's proceed as planned.\n\nThanks,\nAlex` },
        { tone: 'positive', body: `Hi ${from},\n\nThanks for the update. Everything looks perfectly aligned with our goals.\n\nCheers,\nAlex` },
        { tone: 'positive', body: `Dear ${from},\n\nI'm very happy with this direction. You have my full support.\n\nAlex` },
        { tone: 'negative', body: `Hi ${from},\n\nThanks for reaching out. Unfortunately, we cannot proceed with this at the moment due to other priorities.\n\nBest,\nAlex` },
        { tone: 'negative', body: `Dear ${from},\n\nI have reviewed the proposal and it does not align with our current strategy. We will have to pass.\n\nRegards,\nAlex` },
        { tone: 'negative', body: `Hello ${from},\n\nI disagree with this approach. We need to rethink the strategy entirely.\n\nThanks,\nAlex` },
        { tone: 'negative', body: `Hi ${from},\n\nThere are several issues with this document. Please hold off on any action until we discuss further.\n\nAlex` },
        { tone: 'negative', body: `Dear ${from},\n\nWe cannot approve this request at this time. Let's regroup next quarter.\n\nBest,\nAlex` },
      ],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate drafts' }, { status: 500 });
  }
}
