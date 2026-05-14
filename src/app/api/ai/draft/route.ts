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
        system: 'You are an email assistant. Return JSON only with key "drafts": array of 3 objects, each with "tone" (professional/casual/concise) and "body" (reply text).',
        prompt: `Generate 3 reply drafts for:\nFrom: ${from}\nSubject: ${subject}\n\n${body}`,
      });

      const parsed = JSON.parse(text);
      return NextResponse.json({ ...parsed, generatedAt: new Date().toISOString() });
    }

    return NextResponse.json({
      drafts: [
        { tone: 'professional', body: `Dear ${from},\n\nThank you for your email regarding "${subject}". I've carefully reviewed the details and appreciate you bringing this to my attention.\n\nI'll follow up with my comprehensive thoughts by end of day.\n\nBest regards,\nAlex` },
        { tone: 'casual', body: `Hey ${from}!\n\nThanks for sending this over — really appreciate it! I'll take a look and get back to you soon.\n\nCheers! 👍` },
        { tone: 'concise', body: `Hi ${from},\n\nReceived, thanks. Will review and respond shortly.\n\nAlex` },
      ],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate drafts' }, { status: 500 });
  }
}
