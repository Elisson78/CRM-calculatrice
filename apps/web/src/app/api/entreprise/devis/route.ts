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

    // Com RLS, não precisamos filtrar manualmente por entreprise_id se o contexto estiver setado.
    // O authenticatedQuery cuidará de executar o SET LOCAL app.current_entreprise_id
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
      ORDER BY created_at DESC`,
      [],
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


