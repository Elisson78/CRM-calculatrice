import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entrepriseId = searchParams.get('entrepriseId');
    
    if (!entrepriseId) {
      return NextResponse.json(
        { error: 'ID entreprise requis' },
        { status: 400 }
      );
    }
    
    // Agréger les données des clients à partir des devis
    const clients = await query(
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
      [entrepriseId]
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




