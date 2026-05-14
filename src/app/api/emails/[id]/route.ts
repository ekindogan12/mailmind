import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // In production, this updates the database. For demo, just acknowledge.
  return NextResponse.json({ id, updated: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // In production, this deletes from the database. For demo, just acknowledge.
  return NextResponse.json({ id, deleted: true });
}
