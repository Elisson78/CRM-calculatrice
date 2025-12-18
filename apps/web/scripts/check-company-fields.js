/**
 * Script para verificar todos os campos salvos na empresa
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

async function checkCompanyFields() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Verificando campos salvos na empresa MG TRANSPORT...\n');
    
    // Buscar empresa completa
    const empresa = await client.query(`
      SELECT * FROM entreprises 
      WHERE nom = 'MG TRANSPORT'
    `);
    
    if (empresa.rows.length === 0) {
      console.log('❌ Empresa MG TRANSPORT não encontrada');
      return;
    }
    
    const empresaData = empresa.rows[0];
    
    console.log('🏢 EMPRESA MG TRANSPORT - Todos os campos:');
    console.log('=' * 50);
    
    // Informações básicas
    console.log('\n📋 INFORMAÇÕES BÁSICAS:');
    console.log(`   ID: ${empresaData.id}`);
    console.log(`   Nome: ${empresaData.nom || 'NÃO PREENCHIDO'}`);
    console.log(`   Email: ${empresaData.email || 'NÃO PREENCHIDO'}`);
    console.log(`   Telefone: ${empresaData.telephone || 'NÃO PREENCHIDO'}`);
    console.log(`   Endereço: ${empresaData.adresse || 'NÃO PREENCHIDO'}`);
    console.log(`   Slug: ${empresaData.slug || 'NÃO PREENCHIDO'}`);
    
    // Configurações visuais
    console.log('\n🎨 PERSONALIZAÇÃO:');
    console.log(`   Cor primária: ${empresaData.couleur_primaire || 'NÃO PREENCHIDO'}`);
    console.log(`   Cor secundária: ${empresaData.couleur_secondaire || 'NÃO PREENCHIDO'}`);
    console.log(`   Cor accent: ${empresaData.couleur_accent || 'NÃO PREENCHIDO'}`);
    console.log(`   Título calculatrice: ${empresaData.titre_calculatrice || 'NÃO PREENCHIDO'}`);
    console.log(`   Mensagem formulário: ${empresaData.message_formulaire || 'NÃO PREENCHIDO'}`);
    
    // Logo
    console.log('\n🖼️ LOGO:');
    console.log(`   Logo URL: ${empresaData.logo_url || 'NÃO PREENCHIDO'}`);
    console.log(`   Logo size: ${empresaData.logo_size || 'NÃO PREENCHIDO'}`);
    console.log(`   Logo data: ${empresaData.logo_data ? 'PRESENTE' : 'NÃO PREENCHIDO'}`);
    
    // SMTP
    console.log('\n📧 CONFIGURAÇÃO SMTP:');
    console.log(`   Usar SMTP custom: ${empresaData.use_custom_smtp ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   SMTP Host: ${empresaData.smtp_host || 'NÃO PREENCHIDO'}`);
    console.log(`   SMTP Port: ${empresaData.smtp_port || 'NÃO PREENCHIDO'}`);
    console.log(`   SMTP User: ${empresaData.smtp_user || 'NÃO PREENCHIDO'}`);
    console.log(`   SMTP Password: ${empresaData.smtp_password ? '***DEFINIDA***' : 'NÃO PREENCHIDO'}`);
    console.log(`   SMTP Secure: ${empresaData.smtp_secure ? '✅ SIM' : '❌ NÃO'}`);
    
    // Status e datas
    console.log('\n🔧 STATUS E DATAS:');
    console.log(`   Ativo: ${empresaData.actif ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   User ID: ${empresaData.user_id || 'NÃO VINCULADO'}`);
    console.log(`   Criado em: ${new Date(empresaData.created_at).toLocaleString('pt-BR')}`);
    console.log(`   Atualizado em: ${new Date(empresaData.updated_at).toLocaleString('pt-BR')}`);
    console.log(`   Deletado em: ${empresaData.deleted_at || 'NÃO DELETADO'}`);
    
    // Verificar quais campos estão preenchidos
    const camposPreenchidos = Object.entries(empresaData)
      .filter(([key, value]) => value !== null && value !== '' && value !== undefined)
      .length;
    
    const totalCampos = Object.keys(empresaData).length;
    
    console.log('\n📊 RESUMO:');
    console.log(`   Campos preenchidos: ${camposPreenchidos}/${totalCampos}`);
    console.log(`   Completude: ${Math.round((camposPreenchidos/totalCampos) * 100)}%`);
    
    // Campos vazios
    const camposVazios = Object.entries(empresaData)
      .filter(([key, value]) => value === null || value === '' || value === undefined)
      .map(([key, value]) => key);
    
    if (camposVazios.length > 0) {
      console.log('\n⚠️  CAMPOS NÃO PREENCHIDOS:');
      camposVazios.forEach(campo => {
        console.log(`   - ${campo}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkCompanyFields();