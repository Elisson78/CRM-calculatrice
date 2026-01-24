import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Authentifier l'utilisateur
    const result = await authenticateUser(email, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const { user, token } = result;

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
    });

    // Définir le cookie avec configuration pour production
    const isProduction = process.env.NODE_ENV === 'production';

    // DEBUG: Force permissive cookies for local network testing (192.168.x.x)
    // We disable 'secure' if not in production to allow HTTP over IP.
    // We remove 'domain' to allow cookies on any host (localhost or IP).
    const cookieDomain = process.env.COOKIE_DOMAIN;

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // false in dev
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
      // Only set domain if explicitly configured in env, otherwise default to host (safest)
      ...(isProduction && cookieDomain ? { domain: cookieDomain } : {}),
    };

    console.log('Login successful for:', email);
    console.log('Setting cookie with options:', JSON.stringify(cookieOptions));

    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);

    return response;

  } catch (error) {
    console.error('Erreur login:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}









