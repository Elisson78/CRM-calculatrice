/**
 * Script para verificar configuração SMTP das empresas
 * Usage: node scripts/check-smtp-config.js
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
    console.log('✅ Variables d\'environnement chargées depuis .env.local');
  }
} catch (e) {
  console.log('⚠️  Pas de fichier .env.local trouvé');
}

// Configuration base de dados
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crm_demenagement',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const pool = new Pool(config);

async function checkSMTPConfig() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 Verificando configuração SMTP das empresas...\n');
    
    // Buscar todas as empresas com suas configurações SMTP
    const result = await client.query(`
      SELECT 
        id,
        nom,
        email,
        use_custom_smtp,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_secure,
        created_at
      FROM entreprises 
      ORDER BY created_at DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhuma empresa encontrada!');
      return;
    }
    
    console.log(`📊 Total de empresas: ${result.rows.length}\n`);
    
    result.rows.forEach((empresa, index) => {
      console.log(`🏢 Empresa ${index + 1}: ${empresa.nom}`);
      console.log(`   ID: ${empresa.id}`);
      console.log(`   Email padrão: ${empresa.email}`);
      console.log(`   Usa SMTP personalizado: ${empresa.use_custom_smtp ? '✅ SIM' : '❌ NÃO'}`);
      
      if (empresa.use_custom_smtp) {
        console.log(`   📧 Configuração SMTP:`);
        console.log(`      - Host: ${empresa.smtp_host || 'NÃO CONFIGURADO'}`);
        console.log(`      - Porta: ${empresa.smtp_port || 'NÃO CONFIGURADO'}`);
        console.log(`      - Usuário: ${empresa.smtp_user || 'NÃO CONFIGURADO'}`);
        console.log(`      - Conexão segura: ${empresa.smtp_secure ? '✅ SIM (TLS/SSL)' : '❌ NÃO'}`);
        
        // Verificar se todos os campos obrigatórios estão preenchidos
        const camposObrigatorios = [empresa.smtp_host, empresa.smtp_user, empresa.smtp_port];
        const configuracaoCompleta = camposObrigatorios.every(campo => campo !== null && campo !== '');
        
        console.log(`   🔧 Configuração completa: ${configuracaoCompleta ? '✅ SIM' : '❌ NÃO - Faltam campos'}`);
        
        if (!configuracaoCompleta) {
          console.log(`   ⚠️  Campos faltando:`);
          if (!empresa.smtp_host) console.log(`      - Host SMTP`);
          if (!empresa.smtp_user) console.log(`      - Usuário SMTP`);
          if (!empresa.smtp_port) console.log(`      - Porta SMTP`);
        }
      }
      
      console.log(`   📅 Criada em: ${new Date(empresa.created_at).toLocaleString('pt-BR')}\n`);
    });
    
    // Buscar empresa específica (MG TRANSPORT / Essence de Lavie)
    const empresaEssence = result.rows.find(e => 
      e.nom.toLowerCase().includes('transport') || 
      e.smtp_user === 'contato@essence-delavie.ch'
    );
    
    if (empresaEssence) {
      console.log(`🎯 EMPRESA TESTADA (${empresaEssence.nom}):`);
      console.log(`   Email de destino dos devis: ${
        empresaEssence.use_custom_smtp && empresaEssence.smtp_user 
          ? empresaEssence.smtp_user 
          : empresaEssence.email
      }`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSMTPConfig();