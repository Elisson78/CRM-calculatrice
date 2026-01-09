import { NextResponse } from 'next/server';
import { query, authenticatedQuery } from '@/lib/db';

export async function GET() {
  try {
    const entreprises = await authenticatedQuery(
      `SELECT 
        e.id, e.nom, e.email, e.slug, e.actif, e.plan, e.created_at,
        (SELECT COUNT(*) FROM devis d WHERE d.entreprise_id = e.id) as total_devis
       FROM entreprises e
       WHERE e.deleted_at IS NULL
       ORDER BY e.created_at DESC`,
      [],
      { role: 'admin' }
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









