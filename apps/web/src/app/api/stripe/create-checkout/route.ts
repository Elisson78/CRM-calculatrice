export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPriceIdForPlan, getOrCreateStripeCustomer } from '@/lib/stripe';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { plan, priceId } = body;

    if (!plan && !priceId) {
      return NextResponse.json(
        { error: 'Plan ou priceId requis' },
        { status: 400 }
      );
    }

    // Obter a empresa
    const entreprise = await queryOne<{
      id: string;
      nom: string;
      email: string;
      stripe_customer_id: string | null;
      subscription_status: string | null;
      stripe_subscription_id: string | null;
      plan: string | null;
    }>(
      'SELECT id, nom, email, stripe_customer_id, subscription_status, stripe_subscription_id, plan FROM entreprises WHERE user_id = $1',
      [payload.userId]
    );

    if (!entreprise) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Obter o priceId
    const finalPriceId = priceId || getPriceIdForPlan(plan as 'basic' | 'pro' | 'enterprise');

    // Criar ou obter customer no Stripe
    let customerId = entreprise.stripe_customer_id;
    if (!customerId) {
      customerId = await getOrCreateStripeCustomer(
        entreprise.email,
        entreprise.nom,
        { entreprise_id: entreprise.id }
      );

      // Salvar customer_id no banco
      await query(
        'UPDATE entreprises SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, entreprise.id]
      );
    }

    // Obter URL base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';

    // Verificar se a empresa já tem uma assinatura ativa
    if (entreprise.subscription_status === 'active' && entreprise.stripe_subscription_id) {
      return NextResponse.json(
        {
          error: 'Vous avez déjà un abonnement actif. Utilisez le portail de facturation pour modifier votre plan.',
          usePortal: true,
          redirectToPortal: true
        },
        { status: 400 }
      );
    }

    // Criar sessão de checkout
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        entreprise_id: entreprise.id,
        plan: plan || 'unknown',
      },
      subscription_data: {
        metadata: {
          entreprise_id: entreprise.id,
          plan: plan || 'unknown',
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error: any) {
    console.error('Erreur checkout Stripe:', error);
    console.error('Type d\'erreur:', error.type);
    console.error('Code d\'erreur:', error.code);
    console.error('🔧 DEBUG - Variáveis Stripe:');
    console.error('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ?
      `${process.env.STRIPE_SECRET_KEY.substring(0, 12)}***${process.env.STRIPE_SECRET_KEY.slice(-4)}` : 'NÃO DEFINIDO');
    console.error('STRIPE_PRICE_ID_BASIC:', process.env.STRIPE_PRICE_ID_BASIC || 'NÃO DEFINIDO');
    console.error('NODE_ENV:', process.env.NODE_ENV);

    let errorMessage = 'Erreur lors de la création du checkout';

    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Configuration Stripe invalide. Vérifiez les clés API.';
    } else if (error.message?.includes('price')) {
      errorMessage = 'ID de prix Stripe invalide. Vérifiez la configuration des plans.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        debug: {
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
          secretKeyEnd: process.env.STRIPE_SECRET_KEY?.slice(-4) || 'N/A',
          priceId: process.env.STRIPE_PRICE_ID_BASIC || 'N/A',
          errorType: error.type
        }
      },
      { status: 500 }
    );
  }
}







