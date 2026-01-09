export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, findUserById, AUTH_COOKIE_NAME } from '@/lib/auth';
import { authenticatedQueryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Usamos authenticatedQueryOne para garantir que o RLS seja aplicado mesmo aqui
    const user = await authenticatedQueryOne<any>(
      'SELECT id, email, nom, prenom, role, avatar_url FROM users WHERE id = $1',
      [payload.userId],
      payload
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Si c'est une entreprise, récupérer les infos de l'entreprise com RLS
    let entreprise = null;
    if (user.role === 'entreprise') {
      entreprise = await authenticatedQueryOne(
        'SELECT id, nom, slug, logo_url, logo_size, couleur_primaire, couleur_secondaire FROM entreprises WHERE user_id = $1',
        [user.id],
        payload
      );
    }

    return NextResponse.json({
      user,
      entreprise,
    });

  } catch (error) {
    console.error('Erreur /auth/me:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}









