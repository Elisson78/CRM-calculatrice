/**
 * Script para verificar a estrutura da tabela entreprises
 */

const { Pool } = require('pg');

const config = {
  host: '72.62.36.167',
  port: 5432,
  database: 'crm_demo',
  user: 'postgres', 
  password: 'Bradok41',
};

const pool = new Pool(config);

async function checkDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando estrutura da tabela entreprises...\n');
    
    // Verificar colunas da tabela entreprises
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'entreprises' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas encontradas na tabela entreprises:');
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}`);
    });
    
    // Verificar colunas específicas
    const checkColumns = {
      logo_data: columns.rows.some(col => col.column_name === 'logo_data'),
      logo_size: columns.rows.some(col => col.column_name === 'logo_size'),
      smtp_host: columns.rows.some(col => col.column_name === 'smtp_host'),
      smtp_port: columns.rows.some(col => col.column_name === 'smtp_port'),
      smtp_user: columns.rows.some(col => col.column_name === 'smtp_user'),
      smtp_password: columns.rows.some(col => col.column_name === 'smtp_password'),
      smtp_secure: columns.rows.some(col => col.column_name === 'smtp_secure'),
      use_custom_smtp: columns.rows.some(col => col.column_name === 'use_custom_smtp'),
    };
    
    console.log('\n🔎 Status das colunas importantes:');
    Object.entries(checkColumns).forEach(([col, exists]) => {
      console.log(`  ${col}: ${exists ? '✅ Existe' : '❌ Não existe'}`);
    });
    
    // Contar quantas empresas existem
    const countResult = await client.query('SELECT COUNT(*) FROM entreprises');
    console.log(`\n📊 Total de empresas: ${countResult.rows[0].count}`);
    
    // Verificar se alguma empresa tem logo_data
    if (logoDataExists) {
      const logoCount = await client.query('SELECT COUNT(*) FROM entreprises WHERE logo_data IS NOT NULL');
      console.log(`📷 Empresas com logo_data: ${logoCount.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDatabase();