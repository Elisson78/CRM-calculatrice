/**
 * Script para criar usuários de teste
 * Usage: node scripts/create-test-users.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crm_demenagement',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function createTestUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Criando usuários de teste...\n');
    
    // Senhas padrão para todos os usuários
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    // 1. Usuário Admin
    const adminEmail = 'admin@moovelabs.com';
    const adminResult = await client.query(
      `INSERT INTO users (email, password_hash, role, nom, prenom, email_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (email) 
       DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING *`,
      [adminEmail, hashedPassword, 'admin', 'Admin', 'Moovelabs']
    );
    console.log('✅ Admin criado/atualizado:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${defaultPassword}\n`);
    
    // 2. Usuário Empresa
    const empresaEmail = 'empresa@test.com';
    const empresaResult = await client.query(
      `INSERT INTO users (email, password_hash, role, nom, prenom, email_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (email) 
       DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING *`,
      [empresaEmail, hashedPassword, 'entreprise', 'Test', 'Empresa']
    );
    
    // Criar empresa associada
    if (empresaResult.rows[0]) {
      await client.query(
        `INSERT INTO entreprises (user_id, nom, email, telephone, slug, actif)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (slug) DO NOTHING`,
        [empresaResult.rows[0].id, 'Empresa Teste', empresaEmail, '+41 21 123 45 67', 'empresa-teste']
      );
    }
    console.log('✅ Empresa criada/atualizada:');
    console.log(`   Email: ${empresaEmail}`);
    console.log(`   Senha: ${defaultPassword}\n`);
    
    // 3. Usuário Cliente
    const clienteEmail = 'cliente@test.com';
    await client.query(
      `INSERT INTO users (email, password_hash, role, nom, prenom, email_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (email) 
       DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING *`,
      [clienteEmail, hashedPassword, 'client', 'Test', 'Cliente']
    );
    console.log('✅ Cliente criado/atualizado:');
    console.log(`   Email: ${clienteEmail}`);
    console.log(`   Senha: ${defaultPassword}\n`);
    
    console.log('🎉 Usuários de teste criados com sucesso!');
    console.log('\n📋 Resumo das credenciais:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ADMIN:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${defaultPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏢 EMPRESA:');
    console.log(`   Email: ${empresaEmail}`);
    console.log(`   Senha: ${defaultPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 CLIENTE:');
    console.log(`   Email: ${clienteEmail}`);
    console.log(`   Senha: ${defaultPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUsers();



