import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updateData: any = {};

    if (body.hasOwnProperty('read')) updateData.read = body.read;
    if (body.hasOwnProperty('starred')) updateData.starred = body.starred;
    if (body.hasOwnProperty('folder')) updateData.folder = body.folder;

    const email = await db.email.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(email);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.email.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
  }
}
