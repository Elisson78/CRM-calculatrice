require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function fixStripeCustomers() {
  console.log('🔧 CORREÇÃO DOS CUSTOMERS STRIPE\n');

  try {
    // Verificar configuração
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não encontrada');
    }

    // Inicializar Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });

    // Conectar ao banco
    console.log('1️⃣ Conectando ao banco de dados...');
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Buscar empresas com customer_id inválido
    console.log('2️⃣ Buscando empresas com problemas...');
    const empresas = await pool.query(
      'SELECT id, nom, email, stripe_customer_id FROM entreprises WHERE stripe_customer_id IS NOT NULL'
    );

    console.log(`   Encontradas ${empresas.rows.length} empresas com customer_id`);

    for (const empresa of empresas.rows) {
      console.log(`\n📋 Processando: ${empresa.nom} (${empresa.email})`);
      console.log(`   Customer atual: ${empresa.stripe_customer_id}`);

      try {
        // Verificar se customer existe
        const customer = await stripe.customers.retrieve(empresa.stripe_customer_id);
        console.log(`   ✅ Customer válido encontrado`);
      } catch (error) {
        if (error.code === 'resource_missing') {
          console.log(`   ❌ Customer não encontrado, criando novo...`);
          
          // Criar novo customer
          const newCustomer = await stripe.customers.create({
            email: empresa.email,
            name: empresa.nom,
            metadata: {
              entreprise_id: empresa.id
            }
          });

          // Atualizar no banco
          await pool.query(
            'UPDATE entreprises SET stripe_customer_id = $1 WHERE id = $2',
            [newCustomer.id, empresa.id]
          );

          console.log(`   ✅ Novo customer criado: ${newCustomer.id}`);
        } else {
          throw error;
        }
      }
    }

    // Testar portal com customer válido
    console.log('\n3️⃣ Testando portal com customer válido...');
    const empresaTeste = await pool.query(
      'SELECT stripe_customer_id FROM entreprises WHERE stripe_customer_id IS NOT NULL LIMIT 1'
    );

    if (empresaTeste.rows.length > 0) {
      const customerId = empresaTeste.rows[0].stripe_customer_id;
      console.log(`   Customer para teste: ${customerId}`);

      try {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: 'https://calculateur.moovelabs.com/dashboard/settings',
        });
        console.log(`   ✅ Portal criado com sucesso!`);
        console.log(`   ✅ URL: ${portalSession.url}`);
      } catch (error) {
        console.log(`   ❌ Erro no portal: ${error.message}`);
        
        if (error.message?.includes('customer portal')) {
          console.log('\n🔧 PROBLEMA IDENTIFICADO: Customer Portal não configurado no Stripe');
          console.log('   Acesse: https://dashboard.stripe.com/settings/billing/portal');
          console.log('   E configure o Customer Portal para permitir modificações de assinatura');
        }
      }
    }

    await pool.end();
    
    console.log('\n📋 RESUMO:');
    console.log('✅ Customers corrigidos com sucesso!');
    
  } catch (error) {
    console.error(`\n❌ ERRO: ${error.message}`);
    process.exit(1);
  }
}

fixStripeCustomers();