import { Pool, PoolClient } from 'pg';

// Configuration de la connexion PostgreSQL
// Utiliser DATABASE_URL en priorité

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Gestion des erreurs de connexion
pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL:', err);
});

// Interface pour le contexto de sessão (multitenancy)
export interface SessionContext {
  userId?: string;
  entrepriseId?: string;
  role?: string;
}

// Fonction para configurar o contexto da sessão no PostgreSQL
async function setSessionContext(client: PoolClient, context: SessionContext): Promise<void> {
  // SECURITÉ CRITIQUE: En production, on force l'utilisation du rôle restreint
  // pour garantir que le RLS est actif, même si la connexion est faite en superuser.
  if (process.env.NODE_ENV === 'production') {
    try {
      await client.query("SET LOCAL ROLE moover_app_user");
    } catch (error) {
      console.error("CRITICAL SECURITY ERROR: Failed to switch to restricted role 'moover_app_user'", error);
      throw new Error("Security enforcement failed: Could not switch to restricted role.");
    }
  } else {
    // En dev, on essaye mais on ne bloque pas si le rôle n'existe pas
    try {
      await client.query("SAVEPOINT role_setup");
      await client.query("SET LOCAL ROLE moover_app_user");
      await client.query("RELEASE SAVEPOINT role_setup");
    } catch (e) {
      // Si ça échoue (ex: rôle n'existe pas), on rollback au savepoint
      // pour ne pas corrompre la transaction principale
      try {
        await client.query("ROLLBACK TO SAVEPOINT role_setup");
      } catch (rollbackError) {
        console.warn("Failed to rollback to savepoint:", rollbackError);
      }
    }
  }

  // Usamos set_config para definir variáveis de sessão que o RLS usará
  // O terceiro parâmetro 'true' torna a configuração local à transação atual
  if (context.userId) {
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [context.userId]);
  }
  if (context.entrepriseId) {
    await client.query("SELECT set_config('app.current_entreprise_id', $1, true)", [context.entrepriseId]);
  }
  if (context.role) {
    await client.query("SELECT set_config('app.current_user_role', $1, true)", [context.role]);
  }
}

// Fonction pour executar uma consulta dentro de um contexto autenticado
export async function authenticatedQuery<T>(
  text: string,
  params: unknown[] = [],
  context: SessionContext
): Promise<T[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setSessionContext(client, context);
    const result = await client.query(text, params);
    await client.query('COMMIT');
    return result.rows as T[];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Fonction pour executar uma consulta autenticada e retornar um único resultado
export async function authenticatedQueryOne<T>(
  text: string,
  params: unknown[] = [],
  context: SessionContext
): Promise<T | null> {
  const results = await authenticatedQuery<T>(text, params, context);
  return results.length > 0 ? results[0] : null;
}

// Fonction pour obter uma conexão já configurada com o contexto
export async function getAuthenticatedConnection(context: SessionContext): Promise<PoolClient> {
  const client = await pool.connect();
  await client.query('BEGIN');
  await setSessionContext(client, context);
  return client;
}

// Fonction pour obter uma conexão normal
export async function getConnection(): Promise<PoolClient> {
  return await pool.connect();
}

// Fonction pour executar uma consulta simples (Atenção: sem contexto RLS)
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Fonction pour executar uma consulta e retornar um único resultado
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









