require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function testStripePortal() {
  console.log('🔧 TESTE DO PORTAL STRIPE\n');

  try {
    // Verificar variáveis de ambiente
    console.log('1️⃣ Verificando configuração Stripe...');
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não encontrada');
    }

    // Inicializar Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });

    // Buscar empresa teste
    console.log('2️⃣ Buscando empresa teste...');
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    const result = await pool.query(
      'SELECT id, nom, email, stripe_customer_id FROM entreprises WHERE stripe_customer_id IS NOT NULL LIMIT 1'
    );

    if (result.rows.length === 0) {
      throw new Error('Nenhuma empresa com customer ID encontrada');
    }

    const empresa = result.rows[0];
    console.log(`   ✅ Empresa: ${empresa.nom} (${empresa.email})`);
    console.log(`   ✅ Customer ID: ${empresa.stripe_customer_id}`);

    // Verificar se o customer existe no Stripe
    console.log('\n3️⃣ Verificando customer no Stripe...');
    try {
      const customer = await stripe.customers.retrieve(empresa.stripe_customer_id);
      console.log(`   ✅ Customer existe: ${customer.email}`);
    } catch (error) {
      console.log(`   ❌ Erro ao buscar customer: ${error.message}`);
      throw error;
    }

    // Tentar criar sessão do portal
    console.log('\n4️⃣ Testando criação do portal...');
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: empresa.stripe_customer_id,
        return_url: 'https://calculateur.moovelabs.com/dashboard/settings',
      });
      console.log(`   ✅ Portal criado com sucesso!`);
      console.log(`   ✅ URL do portal: ${portalSession.url}`);
    } catch (error) {
      console.log(`   ❌ Erro ao criar portal: ${error.message}`);
      console.log(`   ❌ Tipo do erro: ${error.type}`);
      console.log(`   ❌ Código do erro: ${error.code}`);
      
      if (error.message?.includes('customer portal')) {
        console.log('\n🔧 SOLUÇÃO:');
        console.log('   1. Acesse https://dashboard.stripe.com/');
        console.log('   2. Vá para Settings > Billing > Customer portal');
        console.log('   3. Configure o Customer portal');
        console.log('   4. Ative o portal para produção');
      }
      
      throw error;
    }

    await pool.end();
    
    console.log('\n📋 RESUMO:');
    console.log('✅ Todas as configurações estão funcionando!');
    console.log('✅ Portal Stripe está configurado corretamente');
    
  } catch (error) {
    console.error(`\n❌ ERRO: ${error.message}`);
    console.log('\n🔧 PASSOS PARA RESOLVER:');
    console.log('1. Verifique se o Customer Portal está ativado no Stripe Dashboard');
    console.log('2. Verifique se as chaves da API estão corretas');
    console.log('3. Verifique se a empresa tem um customer_id válido');
    process.exit(1);
  }
}

testStripePortal();