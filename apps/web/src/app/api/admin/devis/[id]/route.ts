import { NextRequest, NextResponse } from 'next/server';
import { query, authenticatedQuery } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        // Fields that can be updated
        const {
            client_nom,
            client_email,
            client_telephone,
            adresse_depart,
            adresse_arrivee,
            statut,
            volume_total_m3,
            date_demenagement,
            observations
        } = body;

        const result = await authenticatedQuery(
            `UPDATE devis 
             SET 
                client_nom = COALESCE($1, client_nom),
                client_email = COALESCE($2, client_email),
                client_telephone = COALESCE($3, client_telephone),
                adresse_depart = COALESCE($4, adresse_depart),
                adresse_arrivee = COALESCE($5, adresse_arrivee),
                statut = COALESCE($6, statut),
                volume_total_m3 = COALESCE($7, volume_total_m3),
                date_demenagement = COALESCE($8, date_demenagement),
                observations = COALESCE($9, observations),
                updated_at = NOW()
             WHERE id = $10
             RETURNING id, numero`,
            [
                client_nom,
                client_email,
                client_telephone,
                adresse_depart,
                adresse_arrivee,
                statut,
                volume_total_m3,
                date_demenagement,
                observations,
                id
            ],
            { role: 'admin' }
        );

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Devis non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Devis mis à jour avec succès',
            devis: result[0]
        });

    } catch (error) {
        console.error('Erreur admin devis PATCH:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getCurrentSession();

        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // On supprime d'abord les meubles (bien que des clés étrangères avec cascade pourraient exister)
        // Pour être sûr, on utilise une transaction via authenticatedQuery
        await authenticatedQuery(
            'DELETE FROM devis_meubles WHERE devis_id = $1',
            [id],
            { role: 'admin' }
        );

        const result = await authenticatedQuery(
            'DELETE FROM devis WHERE id = $1 RETURNING id',
            [id],
            { role: 'admin' }
        );

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Devis non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Devis supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur admin devis DELETE:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
