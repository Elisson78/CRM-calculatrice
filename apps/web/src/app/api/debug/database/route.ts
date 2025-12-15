import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test basic connection
    const result = await query('SELECT NOW() as timestamp, version() as version') as Array<{timestamp: string, version: string}>;
    
    // Test tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('entreprises', 'categories_meubles', 'meubles')
      ORDER BY table_name
    `) as Array<{table_name: string}>;
    
    // Count records
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM entreprises) as entreprises,
        (SELECT COUNT(*) FROM categories_meubles) as categories,
        (SELECT COUNT(*) FROM meubles) as meubles
    `) as Array<{entreprises: number, categories: number, meubles: number}>;
    
    // Check specific company
    const company = await query(
      'SELECT nom, slug, actif FROM entreprises WHERE slug = $1',
      ['calculateur-demenagement']
    ) as Array<{nom: string, slug: string, actif: boolean}>;
    
    return NextResponse.json({
      status: 'connected',
      timestamp: result[0]?.timestamp,
      database_version: result[0]?.version,
      tables_found: tables.map(t => t.table_name),
      statistics: stats[0],
      target_company: company[0] || 'not found',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_exists: !!process.env.DATABASE_URL,
        DATABASE_URL_preview: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.replace(/:[^@]+@/, ':***@') : 'not set'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}