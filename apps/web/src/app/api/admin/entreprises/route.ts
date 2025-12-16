import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const entreprises = await query(
      `SELECT id, nom, email, slug, actif, plan, created_at
       FROM entreprises
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`
    );
    
    return NextResponse.json({ entreprises });
    
  } catch (error) {
    console.error('Erreur admin entreprises:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}






