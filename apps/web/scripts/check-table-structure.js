/**
 * Script para verificar estrutura da tabela devis_meubles
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
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crm_demenagement',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const pool = new Pool(config);

async function checkTableStructure() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando estrutura da tabela entreprises...\n');
    
    // Verificar se a tabela existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'entreprises'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela entreprises não existe!');
      return;
    }
    
    console.log('✅ Tabela entreprises existe');
    
    // Verificar estrutura da tabela
    const columns = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'entreprises'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estrutura da tabela entreprises:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}${
        col.character_maximum_length ? `(${col.character_maximum_length})` : ''
      }${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${
        col.column_default ? ` DEFAULT ${col.column_default}` : ''
      }`);
    });
    
    // Verificar constraints
    const constraints = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu 
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'entreprises';
    `);
    
    if (constraints.rows.length > 0) {
      console.log('\n🔗 Constraints:');
      constraints.rows.forEach(constraint => {
        console.log(`   ${constraint.constraint_type}: ${constraint.constraint_name}`);
        console.log(`      Column: ${constraint.column_name}`);
        if (constraint.foreign_table_name) {
          console.log(`      References: ${constraint.foreign_table_name}(${constraint.foreign_column_name})`);
        }
      });
    }
    
    // Verificar alguns registros existentes
    const sampleData = await client.query(`
      SELECT * FROM entreprises 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    if (sampleData.rows.length > 0) {
      console.log('\n📊 Dados de exemplo:');
      sampleData.rows.forEach((row, index) => {
        console.log(`   Registro ${index + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`);
        });
        console.log();
      });
    } else {
      console.log('\n📊 Nenhum registro encontrado na tabela');
    }
    
    // Verificar campos relacionados a planos/pagamentos
    const planFields = columns.rows.filter(col => 
      col.column_name.includes('plan') || 
      col.column_name.includes('subscription') || 
      col.column_name.includes('stripe')
    );
    
    console.log('\n💳 CAMPOS RELACIONADOS A PAGAMENTOS/PLANOS:');
    if (planFields.length > 0) {
      planFields.forEach(col => {
        console.log(`✅ ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ Nenhum campo relacionado a planos/pagamentos encontrado');
      console.log('\n📝 CAMPOS QUE PRECISAM SER ADICIONADOS:');
      console.log('   - plan_type (varchar) - Tipo do plano (basic, pro, enterprise)');
      console.log('   - stripe_customer_id (varchar) - ID do cliente no Stripe');
      console.log('   - stripe_subscription_id (varchar) - ID da assinatura no Stripe');
      console.log('   - subscription_status (varchar) - Status da assinatura');
      console.log('   - subscription_expires_at (timestamp) - Data de expiração');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTableStructure();