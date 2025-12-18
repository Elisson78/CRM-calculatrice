/**
 * Script para verificar o devis recém criado
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

async function checkRecentDevis() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Verificando devis recente e status de emails...\n');
    
    // Buscar o devis mais recente
    const devis = await client.query(`
      SELECT 
        d.*,
        e.nom as entreprise_nom,
        e.smtp_user
      FROM devis d
      JOIN entreprises e ON d.entreprise_id = e.id
      WHERE d.numero = 'DEV-2025-00025'
      ORDER BY d.created_at DESC
      LIMIT 1
    `);
    
    if (devis.rows.length === 0) {
      console.log('❌ Devis DEV-2025-00025 não encontrado');
      return;
    }
    
    const devisData = devis.rows[0];
    
    console.log('🎯 Devis encontrado:');
    console.log(`   ID: ${devisData.id}`);
    console.log(`   Número: ${devisData.numero}`);
    console.log(`   Cliente: ${devisData.client_nom} (${devisData.client_email})`);
    console.log(`   Empresa: ${devisData.entreprise_nom}`);
    console.log(`   Volume: ${devisData.volume_total_m3} m³`);
    console.log(`   Criado em: ${new Date(devisData.created_at).toLocaleString('pt-BR')}`);
    
    console.log('\n📧 Status de emails:');
    console.log(`   Email cliente enviado: ${devisData.email_client_envoye ? '✅ SIM' : '❌ NÃO'}`);
    if (devisData.email_client_envoye) {
      console.log(`   Data envio cliente: ${new Date(devisData.email_client_date).toLocaleString('pt-BR')}`);
    }
    
    console.log(`   Email empresa enviado: ${devisData.email_entreprise_envoye ? '✅ SIM' : '❌ NÃO'}`);
    if (devisData.email_entreprise_envoye) {
      console.log(`   Data envio empresa: ${new Date(devisData.email_entreprise_date).toLocaleString('pt-BR')}`);
      console.log(`   Enviado para: ${devisData.smtp_user} (SMTP configurado)`);
    }
    
    // Verificar móveis do devis
    const meubles = await client.query(`
      SELECT * FROM devis_meubles
      WHERE devis_id = $1
      ORDER BY created_at
    `, [devisData.id]);
    
    console.log(`\n🛋️ Móveis (${meubles.rows.length}):`)
    meubles.rows.forEach((meuble, index) => {
      console.log(`   ${index + 1}. ${meuble.meuble_nom}`);
      console.log(`      Categoria: ${meuble.meuble_categorie}`);
      console.log(`      Quantidade: ${meuble.quantite}`);
      console.log(`      Volume: ${meuble.volume_unitaire_m3} m³`);
    });
    
    // Status final
    console.log('\n🏁 RESUMO FINAL:');
    const emailsEnviados = devisData.email_client_envoye && devisData.email_entreprise_envoye;
    console.log(`   Sistema funcionando: ${emailsEnviados ? '✅ 100% FUNCIONAL' : '⚠️ Problemas pendentes'}`);
    
    if (emailsEnviados) {
      console.log('   📧 Cliente recebeu confirmação');
      console.log(`   📧 Empresa recebeu notificação em: ${devisData.smtp_user}`);
      console.log('   🎉 SISTEMA DE EMAIL COMPLETO E FUNCIONAL!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRecentDevis();