import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'inbox';
    const search = searchParams.get('search');

    let whereClause: any = { folder };

    if (search) {
      whereClause.OR = [
        { subject: { contains: search } },
        { body: { contains: search } },
        { from: { contains: search } },
      ];
    }

    if (folder === 'starred') {
      whereClause = { starred: true };
    }

    const emails = await db.email.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const formattedEmails = emails.map(e => ({
      ...e,
      from: JSON.parse(e.from),
      to: JSON.parse(e.to),
      labels: JSON.parse(e.labels),
      attachments: JSON.parse(e.attachments),
      aiSummary: e.aiSummary ? JSON.parse(e.aiSummary) : undefined,
      aiDrafts: e.aiDrafts ? JSON.parse(e.aiDrafts) : undefined,
    }));

    return NextResponse.json(formattedEmails);
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}
