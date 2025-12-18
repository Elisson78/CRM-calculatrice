/**
 * Script para testar envio de email de devis
 * Usage: node scripts/test-devis-email.js
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

// Importar função de email
const { sendDevisEmails } = require('../src/lib/email');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crm_demenagement',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const pool = new Pool(config);

async function testDevisEmail() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Teste de envio de email de devis...\n');
    
    // Buscar a empresa MG TRANSPORT
    const empresa = await client.query(`
      SELECT * FROM entreprises 
      WHERE nom = 'MG TRANSPORT' 
      LIMIT 1
    `);
    
    if (empresa.rows.length === 0) {
      console.log('❌ Empresa MG TRANSPORT não encontrada');
      return;
    }
    
    const empresaData = empresa.rows[0];
    console.log('🏢 Empresa encontrada:', empresaData.nom);
    console.log('📧 SMTP configurado:', empresaData.use_custom_smtp ? 'Sim' : 'Não');
    
    // Dados de teste para o email
    const emailData = {
      clientNom: 'Cliente Teste',
      clientEmail: 'teste@example.com',
      clientTelephone: '+33123456789',
      adresseDepart: 'Paris, France',
      adresseArrivee: 'Lyon, France',
      dateDemenagement: '2025-01-15',
      volumeTotal: 25.5,
      nombreMeubles: 15,
      meubles: [
        {
          nom: 'Canapé 3 places',
          categorie: 'Salon',
          quantite: 1,
          volume: 2.5
        },
        {
          nom: 'Lit double',
          categorie: 'Chambre',
          quantite: 1,
          volume: 3.0
        },
        {
          nom: 'Table à manger',
          categorie: 'Salle à manger',
          quantite: 1,
          volume: 1.8
        }
      ],
      entreprise: {
        nom: empresaData.nom,
        email: empresaData.email,
        telephone: empresaData.telephone,
        smtp_host: empresaData.smtp_host,
        smtp_port: empresaData.smtp_port,
        smtp_user: empresaData.smtp_user,
        smtp_password: empresaData.smtp_password,
        smtp_secure: empresaData.smtp_secure,
        use_custom_smtp: empresaData.use_custom_smtp
      }
    };
    
    console.log('\n📊 Dados do teste:');
    console.log(`   Cliente: ${emailData.clientNom} (${emailData.clientEmail})`);
    console.log(`   Volume: ${emailData.volumeTotal} m³`);
    console.log(`   Meubles: ${emailData.nombreMeubles}`);
    console.log(`   Email empresa será enviado para: ${
      empresaData.use_custom_smtp && empresaData.smtp_user 
        ? empresaData.smtp_user 
        : empresaData.email
    }`);
    
    console.log('\n🚀 Iniciando envio de emails...\n');
    
    // Enviar emails
    const result = await sendDevisEmails(emailData);
    
    console.log('\n📊 Resultado do envio:');
    console.log(`   Cliente: ${result.clientSent ? '✅ Enviado' : '❌ Falhou'}`);
    console.log(`   Empresa: ${result.entrepriseSent ? '✅ Enviado' : '❌ Falhou'}`);
    
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testDevisEmail();