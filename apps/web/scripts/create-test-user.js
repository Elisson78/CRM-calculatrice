/**
 * Script para criar usuário de teste com senha
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuration pour production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:Bradok41@72.62.36.167:5432/crm_demenagement?schema=public"
});

async function createTestUser() {
  const client = await pool.connect();
  
  try {
    console.log('👤 Création d\'utilisateur de test...\n');
    
    const email = 'test@moovelabs.com';
    const password = 'test123';
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Supprimer l'utilisateur s'il existe
    await client.query('DELETE FROM users WHERE email = $1', [email]);
    console.log('🗑️ Utilisateur existant supprimé');
    
    // Créer nouvel utilisateur
    const result = await client.query(`
      INSERT INTO users (email, password_hash, role, nom, prenom, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email
    `, [email, hashedPassword, 'admin', 'Test', 'User', true]);
    
    console.log('✅ Utilisateur de test créé:');
    console.log(`   - Email: ${result.rows[0].email}`);
    console.log(`   - Password: ${password}`);
    console.log(`   - ID: ${result.rows[0].id}`);

    console.log('\n🎉 Utilisateur de test créé avec succès!');
    console.log('\n📝 Credentials pour login:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUser();