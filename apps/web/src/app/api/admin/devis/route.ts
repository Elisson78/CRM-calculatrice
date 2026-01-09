import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

        // Como é admin, usamos a query direta que ignora o RLS de empresa se necessário,
        // ou simplesmente buscamos todos os registros.
        const devis = await query(
            `SELECT 
        d.id, d.numero, d.client_nom, d.client_email, d.client_telephone,
        d.adresse_depart, d.adresse_arrivee, d.volume_total_m3, d.nombre_meubles,
        d.statut, d.date_demenagement, 
        d.montant_estime,
        COALESCE(d.devise, 'EUR') as devise,
        d.nombre_demenageurs,
        d.created_at,
        COALESCE(e.nom, 'Sans entreprise') as entreprise_nom,
        e.slug as entreprise_slug
      FROM devis d
      LEFT JOIN entreprises e ON d.entreprise_id = e.id
      ORDER BY d.created_at DESC`
        );

        return NextResponse.json({ devis });

    } catch (error) {
        console.error('Erreur admin devis:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
