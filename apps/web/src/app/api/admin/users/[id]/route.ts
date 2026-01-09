import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 401 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { role } = body;

        // Validar o papel
        const validRoles = ['admin', 'entreprise', 'client'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Rôle invalide' },
                { status: 400 }
            );
        }

        // Atualizar o papel do usuário
        // Como somos admin, podemos usar query direta ou authenticatedQuery com contexto admin
        const result = await query(
            `UPDATE users 
       SET role = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, email, role`,
            [role, id]
        );

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Rôle mis à jour com succès',
            user: result[0]
        });
    } catch (error) {
        console.error('Erreur admin users PATCH:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
