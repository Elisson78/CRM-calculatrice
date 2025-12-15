import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT NOW() as timestamp') as Array<{timestamp: string}>;
    
    return NextResponse.json({
      status: 'connected',
      timestamp: result[0]?.timestamp,
      database_url: process.env.DATABASE_URL ? 'configured' : 'not configured'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}