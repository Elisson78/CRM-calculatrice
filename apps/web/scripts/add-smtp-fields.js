/**
 * Script para adicionar campos SMTP usando a lib do projeto
 */

// Simular ambiente Node.js para Next.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const { query } = require('../src/lib/db');

async function addSMTPFields() {
  try {
    console.log('🚀 Adicionando campos SMTP...\n');
    
    // Verificar se as colunas já existem
    const checkColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'entreprises' 
        AND column_name IN ('smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_secure', 'use_custom_smtp')
    `);
    
    if (checkColumns.rows.length > 0) {
      console.log('✅ Campos SMTP já existem na tabela empresas');
      return;
    }
    
    // Adicionar as colunas uma por uma para evitar erros
    const alterQueries = [
      'ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255);',
      'ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS smtp_port INTEGER;',
      'ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255);',
      'ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS smtp_password TEXT;',
      'ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT TRUE;',
      'ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS use_custom_smtp BOOLEAN DEFAULT FALSE;'
    ];
    
    for (const sql of alterQueries) {
      console.log(`Executando: ${sql}`);
      await query(sql);
    }
    
    console.log('✅ Todos os campos SMTP foram adicionados com sucesso!\n');
    
    // Verificar o resultado
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'entreprises' 
        AND column_name LIKE 'smtp_%' OR column_name = 'use_custom_smtp'
      ORDER BY column_name
    `);
    
    console.log('📋 Campos SMTP criados:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    });
    
    console.log('\n🎉 Migração SMTP concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

addSMTPFields();