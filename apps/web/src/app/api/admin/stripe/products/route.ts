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

    // Buscar produtos do Stripe
    const products = await stripe.products.list({
      expand: ['data.default_price'],
      limit: 10,
    });

    // Para cada produto, buscar os preços
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          prices: prices.data.map((price) => ({
            id: price.id,
            unit_amount: price.unit_amount || 0,
            currency: price.currency,
            recurring: price.recurring,
          })),
        };
      })
    );

    return NextResponse.json({
      products: productsWithPrices
    });
  } catch (error) {
    console.error('Erro ao buscar produtos Stripe:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}