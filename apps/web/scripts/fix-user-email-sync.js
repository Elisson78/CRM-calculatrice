/**
 * Script para sincronizar email do usuário com email da empresa
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

async function fixUserEmailSync() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Sincronizando emails usuário-empresa...\n');
    
    // Buscar empresa MG TRANSPORT
    const empresa = await client.query(`
      SELECT id, user_id, email, nom 
      FROM entreprises 
      WHERE nom = 'MG TRANSPORT'
    `);
    
    if (empresa.rows.length === 0) {
      console.log('❌ Empresa MG TRANSPORT não encontrada');
      return;
    }
    
    const empresaData = empresa.rows[0];
    console.log('🏢 Empresa encontrada:');
    console.log(`   Nome: ${empresaData.nom}`);
    console.log(`   Email atual: ${empresaData.email}`);
    console.log(`   User ID: ${empresaData.user_id}`);
    
    if (!empresaData.user_id) {
      console.log('❌ Empresa não tem usuário vinculado');
      return;
    }
    
    // Buscar usuário atual
    const userBefore = await client.query(`
      SELECT id, email, nom FROM users 
      WHERE id = $1
    `, [empresaData.user_id]);
    
    if (userBefore.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    const userBeforeData = userBefore.rows[0];
    console.log(`\n👤 Usuário antes da sincronização:`);
    console.log(`   Email: ${userBeforeData.email}`);
    console.log(`   Nome: ${userBeforeData.nom}`);
    
    // Verificar se já está sincronizado
    if (userBeforeData.email === empresaData.email) {
      console.log('\n✅ Emails já estão sincronizados!');
      return;
    }
    
    // Atualizar email do usuário
    console.log(`\n🔄 Atualizando email do usuário...`);
    console.log(`   De: ${userBeforeData.email}`);
    console.log(`   Para: ${empresaData.email}`);
    
    const updateResult = await client.query(`
      UPDATE users 
      SET email = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, nom
    `, [empresaData.email, empresaData.user_id]);
    
    if (updateResult.rowCount > 0) {
      console.log('\n✅ Email sincronizado com sucesso!');
      
      const userAfter = updateResult.rows[0];
      console.log(`\n👤 Usuário após sincronização:`);
      console.log(`   ID: ${userAfter.id}`);
      console.log(`   Email: ${userAfter.email}`);
      console.log(`   Nome: ${userAfter.nom}`);
      
      console.log(`\n🎯 RESULTADO:`);
      console.log(`   ✅ Login: Agora funciona com "${empresaData.email}"`);
      console.log(`   ✅ Emails de devis: Continuam chegando em "${empresaData.email}"`);
      console.log(`   ✅ Sincronização: Usuario e empresa com mesmo email`);
      
    } else {
      console.log('\n❌ Falha ao atualizar email do usuário');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixUserEmailSync();