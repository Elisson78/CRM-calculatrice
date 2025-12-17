import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET - Liste des meubles avec catégorie
export async function GET() {
  try {
    const meubles = await query(
      `SELECT 
        m.id, m.nom, m.categorie_id, m.volume_m3, m.poids_kg,
        m.image_url, m.ordre, m.actif,
        c.nom as categorie_nom
      FROM meubles m
      LEFT JOIN categories_meubles c ON m.categorie_id = c.id
      ORDER BY c.ordre, m.ordre, m.nom`
    );
    
    return NextResponse.json({ meubles });
    
  } catch (error) {
    console.error('Erreur meubles:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un meuble
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, categorie_id, volume_m3, poids_kg, image_url } = body;
    
    if (!nom || !categorie_id || !volume_m3) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }
    
    const result = await queryOne(
      `INSERT INTO meubles (nom, categorie_id, volume_m3, poids_kg, image_url, actif)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [nom, categorie_id, volume_m3, poids_kg || null, image_url || null]
    );
    
    return NextResponse.json({ meuble: result });
    
  } catch (error) {
    console.error('Erreur création meuble:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}







