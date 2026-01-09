import { NextResponse } from 'next/server';
import { authenticatedQuery } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 401 }
            );
        }

        // Buscar todos os usuários ordenados por data de criação
        const users = await authenticatedQuery(
            `SELECT id, email, role, nom, prenom, telephone, created_at, email_verified
       FROM users
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`,
            [],
            { role: 'admin' }
        );

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Erreur admin users GET:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
