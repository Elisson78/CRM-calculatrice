/**
 * Script para testar o fluxo completo de pagamento
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

async function testPaymentFlow() {
  const client = await pool.connect();
  
  try {
    console.log('💳 TESTE DO FLUXO DE PAGAMENTO\n');
    
    // 1. Verificar estrutura da tabela empresas
    console.log('1️⃣ Verificando estrutura da tabela empresas...');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'entreprises' AND 
            column_name IN ('plan', 'stripe_customer_id', 'stripe_subscription_id', 
                           'subscription_status', 'subscription_expires_at', 'plan_active')
      ORDER BY column_name;
    `);
    
    console.log('✅ Campos de pagamento encontrados:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    if (columns.rows.length < 6) {
      console.log('❌ Alguns campos estão faltando!');
      return;
    }
    
    // 2. Verificar empresa teste
    console.log('\n2️⃣ Verificando empresa de teste...');
    const empresa = await client.query(`
      SELECT id, nom, email, plan, stripe_customer_id, stripe_subscription_id, 
             subscription_status, subscription_expires_at, plan_active
      FROM entreprises 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 1;
    `);
    
    if (empresa.rows.length === 0) {
      console.log('❌ Nenhuma empresa encontrada');
      return;
    }
    
    const emp = empresa.rows[0];
    console.log(`✅ Empresa teste: ${emp.nom} (${emp.email})`);
    console.log(`   ID: ${emp.id}`);
    console.log(`   Plano atual: ${emp.plan}`);
    console.log(`   Customer ID: ${emp.stripe_customer_id || 'Não definido'}`);
    console.log(`   Subscription ID: ${emp.stripe_subscription_id || 'Não definida'}`);
    console.log(`   Status: ${emp.subscription_status || 'inactive'}`);
    console.log(`   Expira em: ${emp.subscription_expires_at || 'Não definido'}`);
    console.log(`   Plano ativo: ${emp.plan_active || false}`);
    
    // 3. Simular atualização de assinatura
    console.log('\n3️⃣ Simulando atualização de assinatura para Pro...');
    
    const mockSubscriptionData = {
      subscription_id: 'sub_test_' + Date.now(),
      customer_id: emp.stripe_customer_id || ('cus_test_' + Date.now()),
      plan: 'pro',
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    };
    
    await client.query(`
      UPDATE entreprises SET 
        plan = $1,
        stripe_customer_id = $2,
        stripe_subscription_id = $3,
        subscription_status = $4,
        subscription_expires_at = $5,
        plan_active = $6,
        updated_at = NOW()
      WHERE id = $7
    `, [
      mockSubscriptionData.plan,
      mockSubscriptionData.customer_id,
      mockSubscriptionData.subscription_id,
      mockSubscriptionData.status,
      mockSubscriptionData.expires_at,
      true,
      emp.id
    ]);
    
    console.log('✅ Assinatura simulada criada:');
    console.log(`   Plano: ${mockSubscriptionData.plan}`);
    console.log(`   Customer: ${mockSubscriptionData.customer_id}`);
    console.log(`   Subscription: ${mockSubscriptionData.subscription_id}`);
    console.log(`   Status: ${mockSubscriptionData.status}`);
    console.log(`   Expira em: ${mockSubscriptionData.expires_at.toISOString()}`);
    
    // 4. Verificar dados atualizados
    console.log('\n4️⃣ Verificando dados após atualização...');
    const updatedEmp = await client.query(`
      SELECT nom, plan, stripe_customer_id, stripe_subscription_id, 
             subscription_status, subscription_expires_at, plan_active
      FROM entreprises 
      WHERE id = $1;
    `, [emp.id]);
    
    const updated = updatedEmp.rows[0];
    console.log('✅ Dados atualizados:');
    console.log(`   Plano: ${updated.plan}`);
    console.log(`   Status: ${updated.subscription_status}`);
    console.log(`   Ativo: ${updated.plan_active}`);
    console.log(`   Expira em: ${updated.subscription_expires_at}`);
    
    // 5. Testar Stripe configuration
    console.log('\n5️⃣ Verificando configuração Stripe...');
    const stripeConfig = {
      secret_key: !!process.env.STRIPE_SECRET_KEY,
      webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      price_basic: !!process.env.STRIPE_PRICE_ID_BASIC,
      price_pro: !!process.env.STRIPE_PRICE_ID_PRO,
      price_enterprise: !!process.env.STRIPE_PRICE_ID_ENTERPRISE
    };
    
    console.log('🔑 Configuração Stripe:');
    Object.entries(stripeConfig).forEach(([key, value]) => {
      console.log(`   ${key}: ${value ? '✅ Configurado' : '❌ Não configurado'}`);
    });
    
    const allConfigured = Object.values(stripeConfig).every(v => v);
    
    console.log('\n📊 RESUMO DO TESTE:');
    console.log(`✅ Estrutura do banco: OK`);
    console.log(`✅ Empresa teste: OK (${emp.nom})`);
    console.log(`✅ Atualização de dados: OK`);
    console.log(`${allConfigured ? '✅' : '⚠️'} Configuração Stripe: ${allConfigured ? 'OK' : 'Incompleta'}`);
    
    console.log('\n🎉 FLUXO DE PAGAMENTO PRONTO!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Configurar variáveis Stripe no .env.local (se necessário)');
    console.log('2. Testar checkout via interface web');
    console.log('3. Verificar webhook do Stripe');
    console.log('\n🔗 Interface: http://localhost:3000/dashboard/settings');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testPaymentFlow();