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
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_password,
      smtp_secure,
      use_custom_smtp,
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
        smtp_host = COALESCE($10, smtp_host),
        smtp_port = COALESCE($11, smtp_port),
        smtp_user = COALESCE($12, smtp_user),
        smtp_password = COALESCE($13, smtp_password),
        smtp_secure = COALESCE($14, smtp_secure),
        use_custom_smtp = COALESCE($15, use_custom_smtp),
        updated_at = NOW()
      WHERE id = $16`,
      [
        nom, email, telephone, adresse,
        couleur_primaire, couleur_secondaire, couleur_accent,
        titre_calculatrice, message_formulaire,
        smtp_host, smtp_port, smtp_user, smtp_password, smtp_secure, use_custom_smtp,
        id
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






