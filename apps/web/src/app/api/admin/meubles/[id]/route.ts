import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PATCH - Mettre à jour un meuble
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { nom, volume_m3, poids_kg, actif } = body;
    
    await query(
      `UPDATE meubles SET
        nom = COALESCE($1, nom),
        volume_m3 = COALESCE($2, volume_m3),
        poids_kg = COALESCE($3, poids_kg),
        actif = COALESCE($4, actif)
      WHERE id = $5`,
      [nom, volume_m3, poids_kg, actif, id]
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erreur update meuble:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un meuble
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await query('DELETE FROM meubles WHERE id = $1', [id]);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erreur delete meuble:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



