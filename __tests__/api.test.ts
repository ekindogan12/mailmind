import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3000';

describe('AI API Routes', () => {
  it('POST /api/ai/summarize returns summary', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Q3 Strategy Review',
        body: 'Please review the Q3 strategy document by Friday deadline.',
        from: 'Sarah Johnson',
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('actionItems');
    expect(data).toHaveProperty('sentiment');
    expect(typeof data.summary).toBe('string');
    expect(Array.isArray(data.actionItems)).toBe(true);
  });

  it('POST /api/ai/draft returns 3 drafts', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Meeting Tomorrow',
        body: 'Can we reschedule our meeting to 3pm?',
        from: 'David',
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('drafts');
    expect(data.drafts.length).toBe(3);
    expect(data.drafts[0]).toHaveProperty('tone');
    expect(data.drafts[0]).toHaveProperty('body');
  });

  it('POST /api/ai/prioritize returns score', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/prioritize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'URGENT: Server is down',
        body: 'Critical production issue needs immediate attention.',
        from: 'Ops Team',
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('score');
    expect(data).toHaveProperty('category');
    expect(data.score).toBe(1); // Should detect urgent
    expect(data.category).toBe('urgent');
  });
});
