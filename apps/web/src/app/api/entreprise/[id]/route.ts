import { NextRequest, NextResponse } from 'next/server';
import { query, authenticatedQuery, authenticatedQueryOne } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';

// GET - Récupérer une entreprise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const entreprise = await authenticatedQueryOne<any>(
      `SELECT * FROM entreprises WHERE id = $1 AND deleted_at IS NULL`,
      [id],
      session
    );

    if (!entreprise) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Masquer le mot de passe SMTP pour la sécurité
    if (entreprise.smtp_password) {
      entreprise.smtp_password = '********';
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log('🔧 API PATCH entreprise - ID:', id, 'Session:', session.entrepriseId);

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
      logo_size,
      email_notification_1,
      email_notification_2,
      email_notification_3,
    } = body;

    // Criptografar senha SMTP se fornecida e não for a máscara
    let finalSmtpPassword = smtp_password;
    if (smtp_password && smtp_password !== '********') {
      finalSmtpPassword = encrypt(smtp_password);
    }

    const result = await authenticatedQueryOne(
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
        smtp_password = CASE WHEN $13 = '********' THEN smtp_password ELSE COALESCE($13, smtp_password) END,
        smtp_secure = COALESCE($14, smtp_secure),
        use_custom_smtp = COALESCE($15, use_custom_smtp),
        logo_size = COALESCE($16, logo_size),
        email_notification_1 = COALESCE($17, email_notification_1),
        email_notification_2 = COALESCE($18, email_notification_2),
        email_notification_3 = COALESCE($19, email_notification_3),
        updated_at = NOW()
      WHERE id = $20
      RETURNING id`,
      [
        nom, email, telephone, adresse,
        couleur_primaire, couleur_secondaire, couleur_accent,
        titre_calculatrice, message_formulaire,
        smtp_host, smtp_port, smtp_user, finalSmtpPassword, smtp_secure, use_custom_smtp,
        logo_size,
        email_notification_1, email_notification_2, email_notification_3,
        id
      ],
      session
    );

    if (!result) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Sincronizar email do usuário se o email da empresa foi alterado
    if (email) {
      await authenticatedQuery(
        `UPDATE users 
         SET email = $1, updated_at = NOW() 
         WHERE id = (
           SELECT user_id 
           FROM entreprises 
           WHERE id = $2 AND user_id IS NOT NULL
         )`,
        [email, id],
        session
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Entreprise mise à jour avec succès'
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









