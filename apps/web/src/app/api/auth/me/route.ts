import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, findUserById, AUTH_COOKIE_NAME } from '@/lib/auth';
import { queryOne } from '@/lib/db';

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
    
    const user = await findUserById(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Si c'est une entreprise, récupérer les infos de l'entreprise
    let entreprise = null;
    if (user.role === 'entreprise') {
      entreprise = await queryOne(
        'SELECT id, nom, slug, logo_url, couleur_primaire, couleur_secondaire FROM entreprises WHERE user_id = $1',
        [user.id]
      );
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        avatar_url: user.avatar_url,
      },
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






