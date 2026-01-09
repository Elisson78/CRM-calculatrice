export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let entreprise: { stripe_customer_id: string | null } | null = null;

  try {
    // Verificar autenticação
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'entreprise') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    // Obter a empresa
    entreprise = await queryOne<{
      stripe_customer_id: string | null;
    }>(
      'SELECT stripe_customer_id FROM entreprises WHERE user_id = $1',
      [payload.userId]
    );

    if (!entreprise || !entreprise.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Aucune subscription trouvée' },
        { status: 404 }
      );
    }

    // Obter URL base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';

    // Criar sessão do Customer Portal
    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: entreprise.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/settings`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });

  } catch (error: any) {
    console.error('Erreur portal Stripe:', error);
    console.error('Type d\'erreur:', error.type);
    console.error('Code d\'erreur:', error.code);
    console.error('Message détaillé:', error.message);

    let errorMessage = 'Erreur lors de la création du portal';

    if (error.type === 'StripeInvalidRequestError') {
      if (error.message?.includes('customer portal')) {
        errorMessage = 'Le portail client Stripe n\'est pas configuré. Veuillez contacter le support.';
      } else if (error.message?.includes('customer')) {
        errorMessage = 'Client Stripe introuvable ou invalide.';
      } else {
        errorMessage = `Erreur Stripe: ${error.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        debug: {
          hasCustomerId: !!entreprise?.stripe_customer_id,
          customerId: entreprise?.stripe_customer_id?.slice(0, 8) + '...' || 'N/A',
          errorType: error.type,
          errorCode: error.code
        }
      },
      { status: 500 }
    );
  }
}







