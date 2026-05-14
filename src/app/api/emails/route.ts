import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // This route will connect to the database in production.
  // For now, returns empty since emails come from DemoProvider on the client.
  return NextResponse.json([]);
}
