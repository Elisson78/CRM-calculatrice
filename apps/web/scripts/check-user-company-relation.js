/**
 * Script para verificar relação entre usuários e empresas
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

async function checkUserCompanyRelation() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando relação entre usuários e empresas...\n');
    
    // Verificar empresa MG TRANSPORT
    const empresa = await client.query(`
      SELECT * FROM entreprises 
      WHERE nom = 'MG TRANSPORT'
    `);
    
    if (empresa.rows.length === 0) {
      console.log('❌ Empresa MG TRANSPORT não encontrada');
      return;
    }
    
    const empresaData = empresa.rows[0];
    console.log('🏢 Empresa MG TRANSPORT:');
    console.log(`   ID: ${empresaData.id}`);
    console.log(`   Email: ${empresaData.email}`);
    console.log(`   User ID: ${empresaData.user_id || 'NÃO DEFINIDO'}`);
    
    // Buscar usuário vinculado à empresa
    if (empresaData.user_id) {
      const user = await client.query(`
        SELECT * FROM users 
        WHERE id = $1
      `, [empresaData.user_id]);
      
      if (user.rows.length > 0) {
        const userData = user.rows[0];
        console.log('\n👤 Usuário vinculado à empresa:');
        console.log(`   ID: ${userData.id}`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Nome: ${userData.nom} ${userData.prenom || ''}`);
        console.log(`   Role: ${userData.role}`);
        
        // Verificar se email do usuário = email da empresa
        const emailsIguais = userData.email === empresaData.email;
        console.log(`\n🔗 Sincronização de emails:`);
        console.log(`   Email usuário: ${userData.email}`);
        console.log(`   Email empresa: ${empresaData.email}`);
        console.log(`   Iguais: ${emailsIguais ? '✅ SIM' : '❌ NÃO'}`);
        
        if (!emailsIguais) {
          console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
          console.log('   O email do usuário não está sincronizado com o email da empresa!');
          console.log('   Isso pode causar:');
          console.log('   - Problemas de login (usuário tenta fazer login com email da empresa)');
          console.log('   - Emails de notificação enviados para endereço errado');
        }
      } else {
        console.log('\n❌ Usuário vinculado não encontrado!');
      }
    } else {
      console.log('\n❌ Empresa não tem usuário vinculado!');
    }
    
    // Verificar se há usuário com o email da empresa
    const userWithCompanyEmail = await client.query(`
      SELECT * FROM users 
      WHERE email = $1
    `, [empresaData.email]);
    
    if (userWithCompanyEmail.rows.length > 0) {
      console.log('\n🔍 Usuário encontrado com email da empresa:');
      const user = userWithCompanyEmail.rows[0];
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nome: ${user.nom} ${user.prenom || ''}`);
      console.log(`   Vinculado à empresa: ${user.id === empresaData.user_id ? '✅ SIM' : '❌ NÃO'}`);
      
      if (user.id !== empresaData.user_id) {
        console.log('\n⚠️  PROBLEMA DETECTADO:');
        console.log('   Existe um usuário com o email da empresa, mas não está vinculado!');
      }
    }
    
    // Buscar todos os usuários relacionados a empresas
    console.log('\n📊 Todos os usuários-empresa:');
    const allUserCompanies = await client.query(`
      SELECT 
        u.email as user_email,
        e.email as company_email,
        e.nom as company_name,
        u.role,
        u.id as user_id,
        e.user_id as linked_user_id,
        (u.email = e.email) as emails_match
      FROM users u
      RIGHT JOIN entreprises e ON u.id = e.user_id
      ORDER BY e.nom
    `);
    
    allUserCompanies.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.company_name}`);
      console.log(`      User email: ${row.user_email || 'SEM USUÁRIO'}`);
      console.log(`      Company email: ${row.company_email}`);
      console.log(`      Emails coincidem: ${row.emails_match ? '✅ SIM' : '❌ NÃO'}`);
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUserCompanyRelation();