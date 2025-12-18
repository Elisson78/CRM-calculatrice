import { NextRequest, NextResponse } from 'next/server';

// IMPORTANTE: Esta rota deve ser removida em produção real
export async function GET(request: NextRequest) {
  // Apenas para desenvolvimento/debug
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug desabilitado em produção' }, { status: 403 });
  }

  try {
    const stripeConfig = {
      secret_key: process.env.STRIPE_SECRET_KEY ? 
        `${process.env.STRIPE_SECRET_KEY.substring(0, 12)}***${process.env.STRIPE_SECRET_KEY.slice(-4)}` : 
        'NÃO DEFINIDO',
      publishable_key: process.env.STRIPE_PUBLISHABLE_KEY ? 
        `${process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 12)}***${process.env.STRIPE_PUBLISHABLE_KEY.slice(-4)}` : 
        'NÃO DEFINIDO',
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET ? 
        `${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 12)}***` : 
        'NÃO DEFINIDO',
      price_basic: process.env.STRIPE_PRICE_ID_BASIC || 'NÃO DEFINIDO',
      price_pro: process.env.STRIPE_PRICE_ID_PRO || 'NÃO DEFINIDO',
      price_enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'NÃO DEFINIDO',
      node_env: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: 'debug_info',
      stripe_config: stripeConfig,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao gerar debug info', details: error.message },
      { status: 500 }
    );
  }
}