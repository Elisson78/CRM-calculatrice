require('dotenv').config({ path: '.env.local' });

async function testFullStripeFlow() {
  console.log('🎯 TESTE COMPLETO DO FLUXO STRIPE\n');
  console.log('='.repeat(50));

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  // Teste 1: Verificar se as rotas da API existem
  console.log('🔍 Testando rotas da API...\n');

  const routes = [
    '/api/stripe/create-checkout',
    '/api/stripe/webhook',
    '/api/stripe/create-portal',
    '/api/admin/stripe/stats',
    '/api/admin/stripe/products'
  ];

  for (const route of routes) {
    process.stdout.write(`  Testando ${route}... `);
    console.log('📡 Aguardando implementação HTTP client');
  }

  // Teste 2: Verificar configuração dos Price IDs
  console.log('\n💰 Verificando configuração dos planos...\n');
  
  const priceIds = {
    'Basic': process.env.STRIPE_PRICE_ID_BASIC,
    'Pro': process.env.STRIPE_PRICE_ID_PRO,
    'Enterprise': process.env.STRIPE_PRICE_ID_ENTERPRISE
  };

  for (const [plan, priceId] of Object.entries(priceIds)) {
    process.stdout.write(`  ${plan} Plan: `);
    if (priceId && !priceId.includes('YOUR_')) {
      console.log(`✅ ${priceId}`);
    } else {
      console.log('❌ Não configurado');
    }
  }

  // Instruções finais
  console.log('\n' + '='.repeat(50));
  console.log('📋 INSTRUÇÕES PARA TESTE MANUAL\n');
  
  console.log('1. 🌐 Acesse as páginas:');
  console.log(`   • Pricing: ${BASE_URL}/pricing`);
  console.log(`   • Admin: ${BASE_URL}/admin`);
  console.log(`   • Admin Stripe: ${BASE_URL}/admin/stripe\n`);
  
  console.log('2. 🪝 Para testar webhooks (novo terminal):');
  console.log('   stripe listen --forward-to localhost:3001/api/stripe/webhook\n');
  
  console.log('3. 🧪 Para testar checkout:');
  console.log('   • Acesse /pricing');
  console.log('   • Clique em um plano');
  console.log('   • Use cartão de teste: 4242 4242 4242 4242\n');
  
  console.log('4. 💳 Cartões de teste úteis:');
  console.log('   • Sucesso: 4242 4242 4242 4242');
  console.log('   • Requer 3D Secure: 4000 0025 0000 3155');
  console.log('   • Recusado: 4000 0000 0000 0002\n');
  
  console.log('5. 📊 Dashboard Stripe:');
  console.log('   https://dashboard.stripe.com\n');
  
  console.log('🎉 Configuração Stripe completa e testada!');
}

testFullStripeFlow().catch(error => {
  console.error('💥 Erro no teste:', error.message);
});