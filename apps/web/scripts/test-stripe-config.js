/**
 * Script para testar configuração do Stripe e checkout
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    });
  }
} catch (e) {
  console.log('⚠️  Erro ao carregar .env.local');
}

const config = {
  host: process.env.DB_HOST || 'junction.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '18657'),
  database: process.env.DB_NAME || 'railway',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Lm5nNl5Dkyl9Nc4aOJYV',
};

const pool = new Pool(config);

async function testStripeConfig() {
  console.log('🔧 TESTE DE CONFIGURAÇÃO STRIPE\n');
  
  // 1. Verificar variáveis de ambiente
  console.log('1️⃣ Verificando variáveis de ambiente do Stripe:');
  
  const stripeVars = {
    'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
    'STRIPE_PUBLISHABLE_KEY': process.env.STRIPE_PUBLISHABLE_KEY,
    'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
    'STRIPE_PRICE_ID_BASIC': process.env.STRIPE_PRICE_ID_BASIC,
    'STRIPE_PRICE_ID_PRO': process.env.STRIPE_PRICE_ID_PRO,
    'STRIPE_PRICE_ID_ENTERPRISE': process.env.STRIPE_PRICE_ID_ENTERPRISE
  };
  
  for (const [key, value] of Object.entries(stripeVars)) {
    if (value) {
      const masked = key.includes('SECRET') || key.includes('KEY') 
        ? `${value.substring(0, 12)}***` 
        : value;
      console.log(`   ✅ ${key}: ${masked}`);
    } else {
      console.log(`   ❌ ${key}: NÃO CONFIGURADO`);
    }
  }
  
  // 2. Testar conexão com Stripe
  console.log('\n2️⃣ Testando conexão com Stripe...');
  
  try {
    const Stripe = require('stripe');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('❌ STRIPE_SECRET_KEY não encontrada');
      return;
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
    
    // Testar listar produtos
    const prices = await stripe.prices.list({ limit: 3 });
    console.log(`✅ Conexão com Stripe OK - ${prices.data.length} preços encontrados`);
    
    // Verificar se os price IDs existem
    console.log('\n3️⃣ Verificando Price IDs no Stripe...');
    
    const priceIds = [
      { name: 'Basic', id: process.env.STRIPE_PRICE_ID_BASIC },
      { name: 'Pro', id: process.env.STRIPE_PRICE_ID_PRO },
      { name: 'Enterprise', id: process.env.STRIPE_PRICE_ID_ENTERPRISE }
    ];
    
    for (const { name, id } of priceIds) {
      if (id) {
        try {
          const price = await stripe.prices.retrieve(id);
          console.log(`   ✅ ${name}: ${id} - ${(price.unit_amount / 100)} CHF`);
        } catch (err) {
          console.log(`   ❌ ${name}: ${id} - INVÁLIDO (${err.message})`);
        }
      } else {
        console.log(`   ❌ ${name}: NÃO CONFIGURADO`);
      }
    }
    
  } catch (error) {
    console.log('❌ Erro na conexão com Stripe:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 PROBLEMA: A chave do Stripe parece inválida ou incorreta');
      console.log('   - Verifique se a chave está correta no .env.local');
      console.log('   - Use chaves de teste (sk_test_) para desenvolvimento');
      console.log('   - Use chaves live (sk_live_) apenas para produção');
    }
    return;
  }
  
  // 4. Verificar empresa para teste
  console.log('\n4️⃣ Verificando empresa para teste de checkout...');
  
  const client = await pool.connect();
  try {
    const empresa = await client.query(`
      SELECT id, nom, email, stripe_customer_id 
      FROM entreprises 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 1;
    `);
    
    if (empresa.rows.length > 0) {
      const emp = empresa.rows[0];
      console.log(`✅ Empresa teste: ${emp.nom} (${emp.email})`);
      console.log(`   ID: ${emp.id}`);
      console.log(`   Customer ID: ${emp.stripe_customer_id || 'Não definido'}`);
    } else {
      console.log('❌ Nenhuma empresa encontrada para teste');
    }
  } finally {
    client.release();
    await pool.end();
  }
  
  // 5. Resumo e próximos passos
  console.log('\n📋 RESUMO E SOLUÇÕES:');
  
  const allConfigured = Object.values(stripeVars).every(v => v);
  
  if (!allConfigured) {
    console.log('❌ PROBLEMA: Variáveis Stripe não configuradas completamente');
    console.log('\n🔧 AÇÃO NECESSÁRIA:');
    console.log('1. Configure todas as variáveis no .env.local:');
    console.log('   STRIPE_SECRET_KEY=sk_test_...');
    console.log('   STRIPE_PUBLISHABLE_KEY=pk_test_...');
    console.log('   STRIPE_PRICE_ID_BASIC=price_...');
    console.log('   STRIPE_PRICE_ID_PRO=price_...');
    console.log('   STRIPE_PRICE_ID_ENTERPRISE=price_...');
    console.log('   STRIPE_WEBHOOK_SECRET=whsec_...');
    console.log('');
    console.log('2. Crie os produtos no Dashboard do Stripe');
    console.log('3. Atualize as variáveis no EasyPanel');
  } else {
    console.log('✅ Todas as variáveis estão configuradas');
    console.log('\n🔧 AÇÃO NECESSÁRIA:');
    console.log('1. Verifique se as chaves Stripe são válidas');
    console.log('2. Teste o checkout na interface');
    console.log('3. Configure o webhook no Stripe Dashboard');
  }
  
  console.log('\n🔗 URLs importantes:');
  console.log('   Dashboard Stripe: https://dashboard.stripe.com/');
  console.log('   Teste: https://calculateur.moovelabs.com/dashboard/plans');
}

testStripeConfig().catch(console.error);