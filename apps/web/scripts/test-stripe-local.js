const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripeLocal() {
  console.log('🧪 Testando integração Stripe local...\n');

  try {
    // Testar conexão com Stripe
    console.log('🔌 Testando conexão com Stripe...');
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Conectado à conta: ${account.email || account.id}\n`);

    // Listar produtos
    console.log('📦 Produtos disponíveis:');
    const products = await stripe.products.list({ limit: 10 });
    products.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.id})`);
    });
    console.log('');

    // Listar preços dos produtos Moovelabs
    console.log('💰 Preços dos planos Moovelabs:');
    const prices = await stripe.prices.list({ 
      active: true,
      limit: 10,
      expand: ['data.product']
    });
    
    const moovelabsPrices = prices.data.filter(price => 
      price.product && typeof price.product === 'object' && 
      price.product.name && price.product.name.includes('Moovelabs')
    );

    moovelabsPrices.forEach((price) => {
      const productName = price.product && typeof price.product === 'object' 
        ? price.product.name 
        : 'Produto desconhecido';
      const amount = price.unit_amount ? (price.unit_amount / 100) : 0;
      const currency = price.currency.toUpperCase();
      const interval = price.recurring?.interval || 'único';
      
      console.log(`  - ${productName}: ${amount} ${currency}/${interval} (${price.id})`);
    });
    console.log('');

    // Verificar customers
    console.log('👥 Customers:');
    const customers = await stripe.customers.list({ limit: 5 });
    console.log(`Total: ${customers.data.length} customers`);
    customers.data.forEach((customer) => {
      console.log(`  - ${customer.email || 'Sem email'} (${customer.id})`);
    });
    console.log('');

    // Instruções para webhook local
    console.log('🪝 Para testar webhooks localmente:');
    console.log('1. Instale o Stripe CLI:');
    console.log('   npm install -g stripe-cli');
    console.log('   # ou baixe de: https://github.com/stripe/stripe-cli');
    console.log('');
    console.log('2. Faça login no Stripe CLI:');
    console.log('   stripe login');
    console.log('');
    console.log('3. Inicie o túnel para webhooks:');
    console.log('   stripe listen --forward-to localhost:3000/api/stripe/webhook');
    console.log('');
    console.log('4. O comando acima fornecerá um webhook secret (whsec_...)');
    console.log('   Adicione esse secret ao seu .env.local como STRIPE_WEBHOOK_SECRET');
    console.log('');
    console.log('5. Para testar um evento:');
    console.log('   stripe trigger checkout.session.completed');
    console.log('');

    console.log('🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  }
}

testStripeLocal();