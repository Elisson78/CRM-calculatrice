import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // TODO: Reativar autenticação após teste
    // Verificar autenticação e role admin
    const token = request.cookies.get('auth-token')?.value;
    
    // Temporariamente permitir acesso sem token para teste
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        if (decoded.role !== 'admin') {
          return NextResponse.json(
            { error: 'Acesso negado' }, 
            { status: 403 }
          );
        }
      } catch (jwtError) {
        // Token inválido, mas permite continuar para teste
        console.warn('Token inválido, permitindo acesso para teste:', jwtError);
      }
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