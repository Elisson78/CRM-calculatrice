import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const categories = await query(
      `SELECT id, nom, icone, ordre
       FROM categories_meubles
       ORDER BY ordre, nom`
    );
    
    return NextResponse.json({ categories });
    
  } catch (error) {
    console.error('Erreur categories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}







