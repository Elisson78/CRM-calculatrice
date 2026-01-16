import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

// GET - Obter todos os detalhes de uma empresa (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const entreprise = await queryOne(
      `SELECT * FROM entreprises WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!entreprise) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ entreprise });
  } catch (error) {
    console.error('Erreur admin get empresa:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Mettre à jour uma empresa (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Lista de campos que podem ser atualizados
    const {
      nom, email, telephone, adresse,
      actif, plan,
      couleur_primaire, couleur_secondaire, couleur_accent,
      logo_url, logo_data, logo_size,
      smtp_host, smtp_port, smtp_user, smtp_password, smtp_secure, use_custom_smtp,
      email_notification, email_notification_1, email_notification_2, email_notification_3
    } = body;

    // Construção dinâmica da query para evitar COALESCE com valores nulos intencionais se necessário
    // Mas para simplificar e manter o padrão do projeto, usaremos COALESCE
    await query(
      `UPDATE entreprises SET
        nom = COALESCE($1, nom),
        email = COALESCE($2, email),
        telephone = COALESCE($3, telephone),
        adresse = COALESCE($4, adresse),
        actif = CASE WHEN $5 IS NOT NULL THEN $5 ELSE actif END,
        plan = COALESCE($6, plan),
        couleur_primaire = COALESCE($7, couleur_primaire),
        couleur_secondaire = COALESCE($8, couleur_secondaire),
        couleur_accent = COALESCE($9, couleur_accent),
        logo_url = COALESCE($10, logo_url),
        logo_data = COALESCE($11, logo_data),
        logo_size = COALESCE($12, logo_size),
        smtp_host = COALESCE($13, smtp_host),
        smtp_port = COALESCE($14, smtp_port),
        smtp_user = COALESCE($15, smtp_user),
        smtp_password = COALESCE($16, smtp_password),
        smtp_secure = CASE WHEN $17 IS NOT NULL THEN $17 ELSE smtp_secure END,
        use_custom_smtp = CASE WHEN $18 IS NOT NULL THEN $18 ELSE use_custom_smtp END,
        email_notification = COALESCE($19, email_notification),
        email_notification_1 = COALESCE($20, email_notification_1),
        email_notification_2 = COALESCE($21, email_notification_2),
        email_notification_3 = COALESCE($22, email_notification_3),
        updated_at = NOW()
      WHERE id = $23`,
      [
        nom === undefined ? null : nom,
        email === undefined ? null : email,
        telephone === undefined ? null : telephone,
        adresse === undefined ? null : adresse,
        actif === undefined ? null : actif,
        plan === undefined ? null : plan,
        couleur_primaire === undefined ? null : couleur_primaire,
        couleur_secondaire === undefined ? null : couleur_secondaire,
        couleur_accent === undefined ? null : couleur_accent,
        logo_url === undefined ? null : logo_url,
        logo_data === undefined ? null : logo_data,
        logo_size === undefined ? null : logo_size,
        smtp_host === undefined ? null : smtp_host,
        smtp_port === undefined ? null : smtp_port,
        smtp_user === undefined ? null : smtp_user,
        smtp_password === undefined ? null : smtp_password,
        smtp_secure === undefined ? null : smtp_secure,
        use_custom_smtp === undefined ? null : use_custom_smtp,
        email_notification === undefined ? null : email_notification,
        email_notification_1 === undefined ? null : email_notification_1,
        email_notification_2 === undefined ? null : email_notification_2,
        email_notification_3 === undefined ? null : email_notification_3,
        id
      ]
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

// DELETE - Supprimer uma empresa (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const { id } = await params;

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
