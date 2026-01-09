import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { query, queryOne } from './db';
import type { User } from '@/types/database';

// Clé secrète pour JWT (OBLIGATOIRE en production)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// Fonction pour obtenir et valider JWT_SECRET
function getJWTSecret(): string {
  if (!JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET environment variable is not defined in .env.local');
    throw new Error('JWT_SECRET est requis. Veuillez définir cette variable d\'environnement.');
  }
  return JWT_SECRET;
}

// Nom du cookie d'authentification
export const AUTH_COOKIE_NAME = 'moovelabs_auth_token';

// Interface pour le payload JWT
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'entreprise' | 'client';
  entrepriseId?: string;
}

// Hasher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Vérifier un mot de passe
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Générer un token JWT
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: JWT_EXPIRES_IN });
}

// Vérifier un token JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJWTSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

// Créer un nouvel utilisateur
export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'entreprise' | 'client',
  nom: string,
  prenom?: string,
  telephone?: string
): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password);

    const result = await query<User>(
      `INSERT INTO users (email, password_hash, role, nom, prenom, telephone, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING *`,
      [email, hashedPassword, role, nom, prenom || null, telephone || null]
    );

    return result[0] || null;
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    return null;
  }
}

// Trouver un utilisateur par email
export async function findUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );
}

// Trouver un utilisateur par ID
export async function findUserById(id: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
}

// Authentifier un utilisateur (login)
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  try {
    const user = await findUserByEmail(email);

    // Type assertion necessário porque findUserByEmail retorna com password_hash
    const userWithPassword = user as (User & { password_hash?: string }) | null;

    if (!userWithPassword || !userWithPassword.password_hash) {
      return null;
    }

    const isValid = await verifyPassword(password, userWithPassword.password_hash);

    if (!isValid) {
      return null;
    }

    // Trouver l'entreprise si l'utilisateur est de type entreprise
    let entrepriseId: string | undefined;
    if (userWithPassword.role === 'entreprise') {
      const entreprise = await queryOne<{ id: string }>(
        'SELECT id FROM entreprises WHERE user_id = $1',
        [userWithPassword.id]
      );
      entrepriseId = entreprise?.id;
    }

    // Remover password_hash do objeto retornado
    const { password_hash: _, ...userWithoutPassword } = userWithPassword;

    const token = generateToken({
      userId: userWithoutPassword.id,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role as 'admin' | 'entreprise' | 'client',
      entrepriseId,
    });

    return { user: userWithoutPassword, token };
  } catch (error) {
    console.error('Erreur authentification:', error);
    return null;
  }
}

// Créer une entreprise avec un utilisateur
export async function createEntrepriseWithUser(
  email: string,
  password: string,
  entrepriseNom: string,
  telephone?: string
): Promise<{ user: User; entrepriseId: string } | null> {
  try {
    // 1. Créer l'utilisateur
    const user = await createUser(email, password, 'entreprise', entrepriseNom, undefined, telephone);

    if (!user) {
      return null;
    }

    // 2. Générer un slug unique
    const baseSlug = entrepriseNom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Vérifier si le slug existe déjà
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await queryOne<{ id: string }>(
        'SELECT id FROM entreprises WHERE slug = $1',
        [slug]
      );
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Créer l'entreprise
    const entreprise = await query<{ id: string }>(
      `INSERT INTO entreprises (user_id, nom, email, telephone, slug, actif)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id`,
      [user.id, entrepriseNom, email, telephone || null, slug]
    );

    if (!entreprise[0]) {
      return null;
    }

    return { user, entrepriseId: entreprise[0].id };
  } catch (error) {
    console.error('Erreur création entreprise:', error);
    return null;
  }
}

// Obtenir l'utilisateur courant depuis les cookies (Server Component)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    return findUserById(payload.userId);
  } catch {
    return null;
  }
}

// Obtenir le payload JWT depuis les cookies
export async function getCurrentSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch {
    return null;
  }
}