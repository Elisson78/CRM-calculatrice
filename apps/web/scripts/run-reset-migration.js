const { Pool } = require('pg');

const config = {
    host: '72.62.36.167',
    port: 5432,
    database: 'crm_demo',
    user: 'postgres',
    password: 'Bradok41',
};

const pool = new Pool(config);

async function runResetMigration() {
    const client = await pool.connect();

    try {
        console.log('🚀 Iniciando migração de recuperação de senha...');

        const sql = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_password_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_reset_token') THEN
          CREATE INDEX idx_users_reset_token ON users(reset_password_token);
        END IF;
      END
      $$;
    `;

        await client.query(sql);
        console.log('✅ Migração aplicada com sucesso!');

        // Verificar se as colunas foram criadas
        const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('reset_password_token', 'reset_password_expires')
    `);
        console.log('📊 Colunas confirmadas:', res.rows.map(r => r.column_name));

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

runResetMigration();
