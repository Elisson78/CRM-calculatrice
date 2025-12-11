import { NextRequest, NextResponse } from 'next/server';
import { createEntrepriseWithUser, findUserByEmail, generateToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, entrepriseNom, telephone } = body;
    
    // Validation
    if (!email || !password || !entrepriseNom) {
      return NextResponse.json(
        { error: 'Email, mot de passe et nom de l\'entreprise sont requis' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }
    
    // Créer l'utilisateur et l'entreprise
    const result = await createEntrepriseWithUser(email, password, entrepriseNom, telephone);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }
    
    // Générer le token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: 'entreprise',
      entrepriseId: result.entrepriseId,
    });
    
    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        nom: result.user.nom,
        role: result.user.role,
      },
      entrepriseId: result.entrepriseId,
    });
    
    // Définir le cookie avec configuration pour production
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
      ...(isProduction && { domain: '.moovelabs.com' }),
    });
    
    return response;
    
  } catch (error) {
    console.error('Erreur register:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}



