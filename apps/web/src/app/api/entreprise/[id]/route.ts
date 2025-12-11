import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET - Récupérer une entreprise
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const entreprise = await queryOne(
      `SELECT * FROM entreprises WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    
    if (!entreprise) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ entreprise });
    
  } catch (error) {
    console.error('Erreur GET entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une entreprise
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      nom,
      email,
      telephone,
      adresse,
      couleur_primaire,
      couleur_secondaire,
      couleur_accent,
      titre_calculatrice,
      message_formulaire,
    } = body;
    
    await query(
      `UPDATE entreprises SET
        nom = COALESCE($1, nom),
        email = COALESCE($2, email),
        telephone = COALESCE($3, telephone),
        adresse = COALESCE($4, adresse),
        couleur_primaire = COALESCE($5, couleur_primaire),
        couleur_secondaire = COALESCE($6, couleur_secondaire),
        couleur_accent = COALESCE($7, couleur_accent),
        titre_calculatrice = COALESCE($8, titre_calculatrice),
        message_formulaire = COALESCE($9, message_formulaire),
        updated_at = NOW()
      WHERE id = $10`,
      [
        nom, email, telephone, adresse,
        couleur_primaire, couleur_secondaire, couleur_accent,
        titre_calculatrice, message_formulaire, id
      ]
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erreur PATCH entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



