const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupWebhook() {
  console.log('🪝 Configurando webhook do Stripe...\n');

  try {
    // Lista webhooks existentes
    const existingWebhooks = await stripe.webhookEndpoints.list();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const webhookUrl = `${appUrl}/api/stripe/webhook`;

    console.log(`📍 URL do webhook: ${webhookUrl}\n`);

    // Verificar se já existe um webhook para essa URL
    const existingWebhook = existingWebhooks.data.find(
      webhook => webhook.url === webhookUrl
    );

    if (existingWebhook) {
      console.log('⚠️  Webhook já existe:', existingWebhook.id);
      console.log(`🔑 Secret: ${existingWebhook.secret}`);
      console.log('\n📝 Adicione ao seu .env.local:');
      console.log(`STRIPE_WEBHOOK_SECRET=${existingWebhook.secret}`);
      return;
    }

    // Criar novo webhook
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ],
      description: 'Moovelabs CRM Webhook'
    });

    console.log('✅ Webhook criado com sucesso!');
    console.log(`🆔 ID: ${webhook.id}`);
    console.log(`🔑 Secret: ${webhook.secret}`);
    console.log(`📍 URL: ${webhook.url}`);
    console.log('\n📝 Adicione ao seu .env.local:');
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    console.log('\n🌐 Para testar localmente, use:');
    console.log('npm install -g stripe-cli');
    console.log('stripe listen --forward-to localhost:3000/api/stripe/webhook');
    
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.message);
    process.exit(1);
  }
}

setupWebhook();