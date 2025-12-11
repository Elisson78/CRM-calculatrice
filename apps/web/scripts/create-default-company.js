/**
 * Script para criar empresa padrão para a calculadora
 */

const { Pool } = require('pg');

// Configuration pour production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:Bradok41@72.62.36.167:5432/crm_demenagement?schema=public"
});

async function createDefaultCompany() {
  const client = await pool.connect();
  
  try {
    console.log('🏢 Crétion de l\'entreprise par défaut...\n');
    
    // Vérifier si l'utilisateur admin existe
    let admin = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@moovelabs.com']
    );

    if (admin.rows.length === 0) {
      // Créer l'utilisateur admin
      console.log('👤 Création de l\'utilisateur admin...');
      const result = await client.query(`
        INSERT INTO users (email, role, nom, prenom, email_verified)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, ['admin@moovelabs.com', 'admin', 'Admin', 'Moovelabs', true]);
      
      admin = result;
      console.log('✅ Utilisateur admin créé');
    } else {
      console.log('✅ Utilisateur admin existe déjà');
    }

    const adminId = admin.rows[0].id;

    // Créer l'entreprise calculateur-demenagement
    await client.query(`
      INSERT INTO entreprises (
        user_id,
        nom,
        email,
        telephone,
        adresse,
        code_postal,
        ville,
        pays,
        slug,
        couleur_primaire,
        couleur_secondaire,
        couleur_accent,
        actif,
        plan,
        titre_calculatrice
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (slug) DO UPDATE SET
        nom = EXCLUDED.nom,
        email = EXCLUDED.email,
        titre_calculatrice = EXCLUDED.titre_calculatrice,
        updated_at = NOW()
    `, [
      adminId,
      'MooveLabs Calculateur',
      'contact@moovelabs.com',
      '+41 21 123 45 67',
      'Route de Genève 1',
      '1000',
      'Lausanne',
      'Suisse',
      'calculateur-demenagement',
      '#1e3a5f',
      '#2563eb',
      '#dc2626',
      true,
      'enterprise',
      'Calculateur de Volume pour Déménagement'
    ]);

    console.log('✅ Entreprise "calculateur-demenagement" créée avec succès!');
    
    // Vérifier les données
    const verification = await client.query(
      'SELECT nom, slug, actif FROM entreprises WHERE slug = $1',
      ['calculateur-demenagement']
    );
    
    if (verification.rows.length > 0) {
      console.log('📊 Entreprise créée:');
      console.log(`   - Nom: ${verification.rows[0].nom}`);
      console.log(`   - Slug: ${verification.rows[0].slug}`);
      console.log(`   - Actif: ${verification.rows[0].actif}`);
    }

    console.log('\n🎉 Script terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createDefaultCompany();