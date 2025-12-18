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
    console.log('🔧 API PATCH entreprise - ID:', id);
    
    const body = await request.json();
    console.log('📦 Body reçu:', body);
    
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
      logo_size,
    } = body;
    
    console.log('📝 Champs extraits:', {
      nom, email, telephone, adresse,
      couleur_primaire, couleur_secondaire, couleur_accent,
      titre_calculatrice, logo_size, use_custom_smtp
    });
    
    const result = await query(
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
        logo_size = COALESCE($16, logo_size),
        updated_at = NOW()
      WHERE id = $17`,
      [
        nom, email, telephone, adresse,
        couleur_primaire, couleur_secondaire, couleur_accent,
        titre_calculatrice, message_formulaire,
        smtp_host, smtp_port, smtp_user, smtp_password, smtp_secure, use_custom_smtp,
        logo_size,
        id
      ]
    );
    
    // Sincronizar email do usuário se o email da empresa foi alterado
    if (email) {
      console.log('📧 Sincronizando email do usuário vinculado...');
      
      const syncResult = await query(
        `UPDATE users 
         SET email = $1, updated_at = NOW() 
         WHERE id = (
           SELECT user_id 
           FROM entreprises 
           WHERE id = $2 AND user_id IS NOT NULL
         )`,
        [email, id]
      );
      
      console.log('✅ Email do usuário sincronizado automaticamente');
    }
    
    console.log('✅ Update réussi');
    return NextResponse.json({ 
      success: true, 
      message: 'Entreprise mise à jour avec succès (email sincronizado automaticamente)'
    });
    
  } catch (error) {
    console.error('Erreur PATCH entreprise:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur', 
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}









