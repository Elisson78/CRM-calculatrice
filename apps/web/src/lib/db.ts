import { Pool, PoolClient } from 'pg';

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crm_demenagement',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Gestion des erreurs de connexion
pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL:', err);
});

// Fonction pour obtenir une connexion
export async function getConnection(): Promise<PoolClient> {
  return await pool.connect();
}

// Fonction pour exécuter une requête simple
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Fonction pour exécuter une requête et retourner un seul résultat
export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const results = await query<T>(text, params);
  return results.length > 0 ? results[0] : null;
}

// Export du pool pour utilisation directe si nécessaire
export { pool };

// Types pour les résultats des requêtes
export interface DBResult<T> {
  rows: T[];
  rowCount: number;
}



