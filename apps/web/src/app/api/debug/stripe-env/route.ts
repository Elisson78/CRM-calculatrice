import { NextResponse } from 'next/server';

export async function GET() {
  // Debug endpoint para verificar variáveis Stripe em produção
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    stripe: {
      secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      secretKeyStart: process.env.STRIPE_SECRET_KEY?.substring(0, 20) || 'NOT_SET',
      secretKeyEnd: process.env.STRIPE_SECRET_KEY?.slice(-10) || 'NOT_SET',
      publishableKeyLength: process.env.STRIPE_PUBLISHABLE_KEY?.length || 0,
      publishableKeyStart: process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 20) || 'NOT_SET',
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
      webhookSecretStart: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 15) || 'NOT_SET',
      priceBasic: process.env.STRIPE_PRICE_ID_BASIC || 'NOT_SET',
      pricePro: process.env.STRIPE_PRICE_ID_PRO || 'NOT_SET',
      priceEnterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'NOT_SET'
    },
    expectedLengths: {
      secretKey: 108,
      publishableKey: 108,
      webhookSecret: 'varies'
    }
  });
}