import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { query, queryOne } from '@/lib/db';
import { getPlanFromPriceId } from '@/lib/stripe';
import Stripe from 'stripe';

// Desabilitar body parser do Next.js para webhooks
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'STRIPE_WEBHOOK_SECRET não está configurada' },
        { status: 500 }
      );
    }

    // Garantir que webhookSecret é uma string para o TypeScript
    const secret: string = webhookSecret;

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } catch (err: any) {
      console.error('Erreur webhook signature:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Traiter les événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handler: Checkout Session Completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const entrepriseId = session.metadata?.entreprise_id;
  const subscriptionId = session.subscription as string;

  if (!entrepriseId || !subscriptionId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Obter subscription completa
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await updateEntrepriseSubscription(entrepriseId, subscription);
}

// Handler: Subscription Updated
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const entrepriseId = subscription.metadata?.entreprise_id;

  if (!entrepriseId) {
    // Tentar encontrar pela subscription_id
    const entreprise = await queryOne<{ id: string }>(
      'SELECT id FROM entreprises WHERE stripe_subscription_id = $1',
      [subscription.id]
    );

    if (!entreprise) {
      console.error('Entreprise not found for subscription:', subscription.id);
      return;
    }

    await updateEntrepriseSubscription(entreprise.id, subscription);
    return;
  }

  await updateEntrepriseSubscription(entrepriseId, subscription);
}

// Handler: Subscription Deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const entrepriseId = subscription.metadata?.entreprise_id;

  if (entrepriseId) {
    await query(
      `UPDATE entreprises SET
        plan = 'basic',
        subscription_status = 'canceled',
        stripe_subscription_id = NULL,
        subscription_expires_at = NULL,
        plan_active = false,
        updated_at = NOW()
      WHERE id = $1`,
      [entrepriseId]
    );
  }
}

// Handler: Invoice Payment Succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Invoice.subscription pode ser string (ID) ou Subscription expandida
  // Type assertion necessário porque a tipagem do Stripe não inclui subscription diretamente
  const subscriptionId = typeof (invoice as any).subscription === 'string' 
    ? (invoice as any).subscription as string
    : (invoice as any).subscription?.id as string | undefined;
  
  if (subscriptionId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  }
}

// Handler: Invoice Payment Failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Invoice.subscription pode ser string (ID) ou Subscription expandida
  // Type assertion necessário porque a tipagem do Stripe não inclui subscription diretamente
  const subscriptionId = typeof (invoice as any).subscription === 'string' 
    ? (invoice as any).subscription as string
    : (invoice as any).subscription?.id as string | undefined;
  
  if (subscriptionId) {
    await query(
      `UPDATE entreprises SET
        subscription_status = 'past_due',
        updated_at = NOW()
      WHERE stripe_subscription_id = $1`,
      [subscriptionId]
    );
  }
}

// Helper: Atualizar subscription da empresa
async function updateEntrepriseSubscription(
  entrepriseId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? getPlanFromPriceId(priceId) : null;

  if (!plan) {
    console.error('Plan not found for priceId:', priceId);
    return;
  }

  await query(
    `UPDATE entreprises SET
      plan = $1,
      stripe_subscription_id = $2,
      subscription_status = $3,
      subscription_expires_at = $4,
      plan_active = $5,
      updated_at = NOW()
    WHERE id = $6`,
    [
      plan,
      subscription.id,
      subscription.status,
      new Date((subscription as any).current_period_end * 1000),
      subscription.status === 'active',
      entrepriseId,
    ]
  );
}






