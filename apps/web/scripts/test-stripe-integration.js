const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Teste completo da integração Stripe
async function runStripeIntegrationTests() {
  console.log('🧪 EXECUTANDO TESTES DE INTEGRAÇÃO STRIPE\n');
  console.log('='.repeat(50));

  let testsRan = 0;
  let testsPassed = 0;
  let testsFailed = 0;

  // Helper para executar testes
  const runTest = async (testName, testFn) => {
    testsRan++;
    process.stdout.write(`🔄 ${testName}... `);
    
    try {
      await testFn();
      testsPassed++;
      console.log('✅ PASSOU');
    } catch (error) {
      testsFailed++;
      console.log('❌ FALHOU');
      console.log(`   Erro: ${error.message}`);
    }
  };

  // Teste 1: Verificar conectividade
  await runTest('Conectividade com Stripe API', async () => {
    const account = await stripe.accounts.retrieve();
    if (!account.id) throw new Error('Não foi possível conectar à conta Stripe');
  });

  // Teste 2: Verificar produtos criados
  await runTest('Verificar produtos Moovelabs', async () => {
    const products = await stripe.products.list({ limit: 10 });
    const moovelabsProducts = products.data.filter(p => 
      p.name.includes('Moovelabs')
    );
    
    if (moovelabsProducts.length !== 3) {
      throw new Error(`Esperado 3 produtos Moovelabs, encontrado ${moovelabsProducts.length}`);
    }

    const expectedPlans = ['Basic', 'Pro', 'Enterprise'];
    expectedPlans.forEach(plan => {
      const found = moovelabsProducts.find(p => p.name.includes(plan));
      if (!found) throw new Error(`Produto ${plan} não encontrado`);
    });
  });

  // Teste 3: Verificar preços dos produtos
  await runTest('Verificar preços dos planos', async () => {
    const prices = await stripe.prices.list({
      active: true,
      limit: 10,
      expand: ['data.product']
    });

    const expectedPriceIds = [
      process.env.STRIPE_PRICE_ID_BASIC,
      process.env.STRIPE_PRICE_ID_PRO,
      process.env.STRIPE_PRICE_ID_ENTERPRISE
    ];

    expectedPriceIds.forEach(priceId => {
      const found = prices.data.find(p => p.id === priceId);
      if (!found) throw new Error(`Price ID ${priceId} não encontrado`);
    });

    // Verificar valores esperados
    const basicPrice = prices.data.find(p => p.id === process.env.STRIPE_PRICE_ID_BASIC);
    const proPrice = prices.data.find(p => p.id === process.env.STRIPE_PRICE_ID_PRO);
    const enterprisePrice = prices.data.find(p => p.id === process.env.STRIPE_PRICE_ID_ENTERPRISE);

    if (basicPrice.unit_amount !== 2900) throw new Error('Preço Basic incorreto');
    if (proPrice.unit_amount !== 7900) throw new Error('Preço Pro incorreto');
    if (enterprisePrice.unit_amount !== 19900) throw new Error('Preço Enterprise incorreto');
  });

  // Teste 4: Criar checkout session (simulação)
  await runTest('Criar checkout session (simulação)', async () => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_BASIC,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        empresa_id: 'test-123',
        test: 'true'
      }
    });

    if (!session.id || !session.url) {
      throw new Error('Checkout session inválida');
    }
  });

  // Teste 5: Criar customer
  await runTest('Criar customer de teste', async () => {
    const customer = await stripe.customers.create({
      email: 'test@moovelabs.com',
      name: 'Test Customer',
      metadata: {
        test: 'true',
        empresa_id: 'test-123'
      }
    });

    if (!customer.id) {
      throw new Error('Não foi possível criar customer');
    }

    // Limpar customer de teste
    await stripe.customers.del(customer.id);
  });

  // Teste 6: Verificar configuração das variáveis de ambiente
  await runTest('Verificar variáveis de ambiente', async () => {
    const requiredVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PRICE_ID_BASIC',
      'STRIPE_PRICE_ID_PRO',
      'STRIPE_PRICE_ID_ENTERPRISE',
      'NEXT_PUBLIC_APP_URL'
    ];

    requiredVars.forEach(varName => {
      if (!process.env[varName] || process.env[varName].includes('YOUR_') || process.env[varName].includes('_HERE')) {
        throw new Error(`Variável ${varName} não configurada corretamente`);
      }
    });
  });

  // Teste 7: Verificar moedas e intervalos
  await runTest('Verificar configuração de moeda e intervalo', async () => {
    const prices = await stripe.prices.list({
      active: true,
      limit: 10
    });

    const moovelabsPrices = [];
    for (const price of prices.data) {
      const product = await stripe.products.retrieve(price.product);
      if (product.name.includes('Moovelabs')) {
        moovelabsPrices.push(price);
      }
    }

    moovelabsPrices.forEach(price => {
      if (price.currency !== 'chf') {
        throw new Error(`Moeda incorreta: esperado CHF, encontrado ${price.currency}`);
      }
      if (price.recurring?.interval !== 'month') {
        throw new Error(`Intervalo incorreto: esperado month, encontrado ${price.recurring?.interval}`);
      }
    });
  });

  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('='.repeat(50));
  console.log(`✅ Testes executados: ${testsRan}`);
  console.log(`🟢 Testes passou: ${testsPassed}`);
  console.log(`🔴 Testes falharam: ${testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Integração Stripe está funcionando corretamente.');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Para testar webhooks localmente:');
    console.log('   stripe listen --forward-to localhost:3000/api/stripe/webhook');
    console.log('2. Acesse http://localhost:3000/admin/stripe para ver o dashboard');
    console.log('3. Acesse http://localhost:3000/pricing para testar checkout');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM! Verifique os erros acima.');
    process.exit(1);
  }
}

// Executar testes
runStripeIntegrationTests().catch(error => {
  console.error('\n💥 ERRO CRÍTICO NO TESTE:', error.message);
  process.exit(1);
});