import Stripe from 'stripe';

// Configuração dos planos (não depende do Stripe SDK)
export const STRIPE_PLANS = {
  basic: {
    priceId: process.env.STRIPE_PRICE_ID_BASIC || 'price_basic_monthly',
    name: 'Basic',
    price: 29, // CHF
    interval: 'month' as const,
    features: [
      'Calculatrice de volume',
      'Até 50 devis/mês',
      'Suporte par email',
      'Dashboard básico',
    ],
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_monthly',
    name: 'Pro',
    price: 79, // CHF
    interval: 'month' as const,
    features: [
      'Tout du plan Basic',
      'Devis illimités',
      'Statistiques avancées',
      'Support prioritaire',
      'Logo personnalisé',
      'Domaines personnalisés',
    ],
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise_monthly',
    name: 'Enterprise',
    price: 199, // CHF
    interval: 'month' as const,
    features: [
      'Tout du plan Pro',
      'API personnalisée',
      'Support dédié 24/7',
      'Formation équipe',
      'SLA garanti',
      'Contrat personnalisé',
    ],
  },
};

// Helper para obter o priceId do plano
export function getPriceIdForPlan(plan: 'basic' | 'pro' | 'enterprise'): string {
  return STRIPE_PLANS[plan].priceId;
}

// Helper para obter o plano do priceId
export function getPlanFromPriceId(priceId: string): 'basic' | 'pro' | 'enterprise' | null {
  for (const [plan, config] of Object.entries(STRIPE_PLANS)) {
    if (config.priceId === priceId) {
      return plan as 'basic' | 'pro' | 'enterprise';
    }
  }
  return null;
}

// Inicializar Stripe (lazy initialization - só quando necessário)
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não está configurada');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Nota: Use getStripe() para inicializar o Stripe
// Isso garante que a chave só seja lida quando necessário


// Helper para criar ou obter customer
export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<string> {
  const stripe = getStripe();
  
  // Buscar customer existente
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Criar novo customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });

  return customer.id;
}






