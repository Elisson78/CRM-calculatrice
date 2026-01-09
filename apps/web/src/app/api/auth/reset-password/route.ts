import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import type { User } from '@/types/database';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token et nouveau mot de passe sont requis' }, { status: 400 });
        }

        // Trouver l'utilisateur avec ce token et vérifier l'expiration
        const user = await queryOne<User>(
            'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW() AND deleted_at IS NULL',
            [token]
        );

        if (!user) {
            return NextResponse.json({ error: 'Le lien de récupération est invalide ou a expiré' }, { status: 400 });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await hashPassword(password);

        // Mettre à jour le mot de passe et effacer le token
        await query(
            'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );

        return NextResponse.json({ message: 'Votre mot de passe a été réinitialisé avec succès' });
    } catch (error) {
        console.error('Erreur reset-password:', error);
        return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
    }
}
