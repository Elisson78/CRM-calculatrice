const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
  console.log('🚀 Criando produtos e planos no Stripe...\n');

  try {
    // Produto 1: Basic Plan
    console.log('📦 Criando produto Basic...');
    const basicProduct = await stripe.products.create({
      name: 'Moovelabs Basic',
      description: 'Plano básico para pequenas empresas de mudança',
      metadata: {
        plan: 'basic'
      }
    });

    const basicPrice = await stripe.prices.create({
      unit_amount: 2900, // 29 CHF em centavos
      currency: 'chf',
      recurring: { interval: 'month' },
      product: basicProduct.id,
      metadata: {
        plan: 'basic'
      }
    });

    console.log(`✅ Basic criado: ${basicPrice.id}\n`);

    // Produto 2: Pro Plan
    console.log('📦 Criando produto Pro...');
    const proProduct = await stripe.products.create({
      name: 'Moovelabs Pro',
      description: 'Plano profissional com recursos avançados',
      metadata: {
        plan: 'pro'
      }
    });

    const proPrice = await stripe.prices.create({
      unit_amount: 7900, // 79 CHF em centavos
      currency: 'chf',
      recurring: { interval: 'month' },
      product: proProduct.id,
      metadata: {
        plan: 'pro'
      }
    });

    console.log(`✅ Pro criado: ${proPrice.id}\n`);

    // Produto 3: Enterprise Plan
    console.log('📦 Criando produto Enterprise...');
    const enterpriseProduct = await stripe.products.create({
      name: 'Moovelabs Enterprise',
      description: 'Plano empresarial com suporte dedicado',
      metadata: {
        plan: 'enterprise'
      }
    });

    const enterprisePrice = await stripe.prices.create({
      unit_amount: 19900, // 199 CHF em centavos
      currency: 'chf',
      recurring: { interval: 'month' },
      product: enterpriseProduct.id,
      metadata: {
        plan: 'enterprise'
      }
    });

    console.log(`✅ Enterprise criado: ${enterprisePrice.id}\n`);

    // Resultados
    console.log('🎉 PRODUTOS CRIADOS COM SUCESSO!\n');
    console.log('📋 COPIE ESTES PRICE IDs PARA O SEU .env.local:\n');
    console.log(`STRIPE_PRICE_ID_BASIC=${basicPrice.id}`);
    console.log(`STRIPE_PRICE_ID_PRO=${proPrice.id}`);
    console.log(`STRIPE_PRICE_ID_ENTERPRISE=${enterprisePrice.id}`);
    console.log('\n📊 PRODUTOS NO STRIPE DASHBOARD:');
    console.log(`https://dashboard.stripe.com/products/${basicProduct.id}`);
    console.log(`https://dashboard.stripe.com/products/${proProduct.id}`);
    console.log(`https://dashboard.stripe.com/products/${enterpriseProduct.id}`);

  } catch (error) {
    console.error('❌ Erro ao criar produtos:', error.message);
    process.exit(1);
  }
}

createStripeProducts();