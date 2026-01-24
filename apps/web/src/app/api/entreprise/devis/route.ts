export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query, authenticatedQuery } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session || (!session.entrepriseId && session.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    // Fix: Force explicit filtering by entreprise_id to handle cases where RLS is bypassed (e.g. superuser)
    const devis = await authenticatedQuery(
      `SELECT 
        id, numero, client_nom, client_email, client_telephone,
        adresse_depart, adresse_arrivee, volume_total_m3, nombre_meubles,
        statut, date_demenagement, 
        montant_estime,
        COALESCE(devise, 'EUR') as devise,
        nombre_demenageurs,
        created_at
      FROM devis
      WHERE entreprise_id = $1
      ORDER BY created_at DESC`,
      [session.entrepriseId],
      {
        userId: session.userId,
        entrepriseId: session.entrepriseId,
        role: session.role
      }
    );

    console.log(`Devis encontrados (via RLS) para session ${session.entrepriseId}:`, devis.length);

    return NextResponse.json({ devis });

  } catch (error) {
    console.error('Erreur devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


