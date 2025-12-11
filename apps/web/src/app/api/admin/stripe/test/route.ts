import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando conexão Stripe...');
    
    // Testar conexão básica
    const account = await stripe.accounts.retrieve();
    console.log('✅ Conectado à conta:', account.email || account.id);

    // Buscar estatísticas básicas
    const [customers, subscriptions, products] = await Promise.all([
      stripe.customers.list({ limit: 10 }),
      stripe.subscriptions.list({ 
        status: 'active',
        limit: 10 
      }),
      stripe.products.list({ limit: 10 })
    ]);

    console.log('📊 Customers:', customers.data.length);
    console.log('📊 Subscriptions:', subscriptions.data.length);
    console.log('📊 Products:', products.data.length);

    // Calcular receita mensal
    let monthlyRevenue = 0;
    for (const subscription of subscriptions.data) {
      if (subscription.items && subscription.items.data.length > 0) {
        const price = subscription.items.data[0].price;
        if (price.recurring?.interval === 'month' && price.unit_amount) {
          monthlyRevenue += price.unit_amount;
        }
      }
    }

    const stats = {
      account: account.email || account.id,
      totalCustomers: customers.data.length,
      activeSubscriptions: subscriptions.data.length,
      monthlyRevenue,
      totalProducts: products.data.length,
      stripeConnected: true,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ Erro ao conectar com Stripe:', error);
    return NextResponse.json({
      error: 'Erro ao conectar com Stripe',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stripeConnected: false,
    }, { status: 500 });
  }
}