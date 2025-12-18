/**
 * Script para atualizar a senha SMTP da empresa MG TRANSPORT
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

async function updateSMTPPassword() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Atualizando senha SMTP para MG TRANSPORT...\n');
    
    // Buscar a empresa
    const empresa = await client.query(`
      SELECT id, nom, smtp_user, smtp_password FROM entreprises 
      WHERE nom = 'MG TRANSPORT' 
      LIMIT 1
    `);
    
    if (empresa.rows.length === 0) {
      console.log('❌ Empresa MG TRANSPORT não encontrada');
      return;
    }
    
    const empresaData = empresa.rows[0];
    console.log('🏢 Empresa encontrada:', empresaData.nom);
    console.log('📧 SMTP User:', empresaData.smtp_user);
    console.log('🔑 Senha atual:', empresaData.smtp_password ? '***MASCARADA***' : 'NÃO DEFINIDA');
    
    // Atualizar a senha
    const novaSenha = 'Bradok41@!';
    
    const result = await client.query(
      `UPDATE entreprises 
       SET smtp_password = $1 
       WHERE id = $2 
       RETURNING id, nom`,
      [novaSenha, empresaData.id]
    );
    
    if (result.rowCount > 0) {
      console.log('\n✅ Senha SMTP atualizada com sucesso!');
      console.log('🎯 Empresa:', result.rows[0].nom);
      console.log('🔑 Nova senha definida');
      
      // Verificar a atualização
      const verificacao = await client.query(
        `SELECT smtp_user, smtp_password FROM entreprises WHERE id = $1`,
        [empresaData.id]
      );
      
      console.log('\n🔍 Verificação:');
      console.log('📧 SMTP User:', verificacao.rows[0].smtp_user);
      console.log('🔑 Senha salva:', verificacao.rows[0].smtp_password === novaSenha ? '✅ CORRETA' : '❌ ERRO');
      
    } else {
      console.log('❌ Erro ao atualizar a senha');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updateSMTPPassword();