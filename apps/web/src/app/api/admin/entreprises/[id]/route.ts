import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PATCH - Mettre à jour une entreprise (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { actif, plan } = body;
    
    await query(
      `UPDATE entreprises SET
        actif = COALESCE($1, actif),
        plan = COALESCE($2, plan),
        updated_at = NOW()
      WHERE id = $3`,
      [actif, plan, id]
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erreur admin update entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une entreprise (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await query(
      `UPDATE entreprises SET deleted_at = NOW() WHERE id = $1`,
      [id]
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erreur admin delete entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



