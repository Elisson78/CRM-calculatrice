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
    
    // Query com tratamento de campos opcionais (caso a migration não tenha sido executada)
    // Usando try-catch para campos que podem não existir
    let devis;
    try {
      devis = await query(
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
        [entrepriseId]
      );
    } catch (error: any) {
      // Se os campos não existem, tentar sem eles
      if (error.message?.includes('column') && (error.message?.includes('montant_estime') || error.message?.includes('nombre_demenageurs'))) {
        console.log('Campos opcionais não encontrados, usando query básica');
        devis = await query(
          `SELECT 
            id, numero, client_nom, client_email, client_telephone,
            adresse_depart, adresse_arrivee, volume_total_m3, nombre_meubles,
            statut, date_demenagement, created_at
          FROM devis
          WHERE entreprise_id = $1
          ORDER BY created_at DESC`,
          [entrepriseId]
        );
        // Adicionar campos vazios para compatibilidade
        devis = devis.map((d: any) => ({
          ...d,
          montant_estime: null,
          devise: 'EUR',
          nombre_demenageurs: null,
        }));
      } else {
        throw error;
      }
    }
    
    console.log(`Devis encontrados para entreprise ${entrepriseId}:`, devis.length);
    
    return NextResponse.json({ devis });
    
  } catch (error) {
    console.error('Erreur devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


