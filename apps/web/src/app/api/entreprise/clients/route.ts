export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authenticatedQuery } from '@/lib/db';
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

    const { searchParams } = new URL(request.url);
    // Prioritizar o entrepriseId da sessão, a menos que seja admin
    let entrepriseId = session.entrepriseId;

    // Se for admin, permitir visualizar via query param
    if (session.role === 'admin') {
      const paramEntrepriseId = searchParams.get('entrepriseId');
      if (paramEntrepriseId) {
        entrepriseId = paramEntrepriseId;
      }
    }

    if (!entrepriseId) {
      return NextResponse.json(
        { error: 'ID entreprise requis' },
        { status: 400 }
      );
    }

    // Agréger les données des clients à partir des devis
    // Utilização de authenticatedQuery garante o isolamento via RLS
    const clients = await authenticatedQuery(
      `SELECT 
        client_email as id,
        MAX(client_nom) as nom,
        client_email as email,
        MAX(client_telephone) as telephone,
        COUNT(*) as total_devis,
        MAX(created_at) as dernier_devis,
        SUM(volume_total_m3) as volume_total
      FROM devis
      WHERE entreprise_id = $1
      GROUP BY client_email
      ORDER BY MAX(created_at) DESC`,
      [entrepriseId],
      {
        userId: session.userId,
        entrepriseId: entrepriseId,
        role: session.role
      }
    );

    return NextResponse.json({ clients });

  } catch (error) {
    console.error('Erreur clients:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}









