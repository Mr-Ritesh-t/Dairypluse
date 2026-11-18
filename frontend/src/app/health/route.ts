import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'DairyPulse Cloud API',
    version: '1.0.0',
    database: 'Supabase PostgreSQL',
    timestamp: new Date().toISOString(),
  });
}
