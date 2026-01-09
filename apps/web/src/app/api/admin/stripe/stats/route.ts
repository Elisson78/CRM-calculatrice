export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier autenticação e role admin
    const session = await getCurrentSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const stripe = getStripe();

    // Buscar estatísticas do Stripe
    const [customers, subscriptions] = await Promise.all([
      stripe.customers.list({ limit: 100 }),
      stripe.subscriptions.list({
        status: 'active',
        limit: 100
      }),
    ]);

    // Calcular receita mensal das assinaturas ativas
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
      totalCustomers: customers.data.length,
      activeSubscriptions: subscriptions.data.length,
      monthlyRevenue,
      totalProducts: 3, // Nossos 3 planos
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar stats Stripe:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}