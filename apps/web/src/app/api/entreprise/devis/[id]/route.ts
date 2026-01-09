import { NextRequest, NextResponse } from 'next/server';
import { query, authenticatedQuery, authenticatedQueryOne } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

// GET - Récupérer un devis avec ses meubles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le devis com RLS
    const devis = await authenticatedQueryOne(
      `SELECT d.*, e.nom as entreprise_nom 
       FROM devis d 
       LEFT JOIN entreprises e ON d.entreprise_id = e.id
       WHERE d.id = $1`,
      [id],
      session
    );

    if (!devis) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les meubles du devis (RLS se aplica à tabela devis_meubles que tem política vinculada ao devis)
    const meubles = await authenticatedQuery(
      `SELECT * FROM devis_meubles WHERE devis_id = $1 ORDER BY meuble_categorie, meuble_nom`,
      [id],
      session
    );

    return NextResponse.json({ devis, meubles });

  } catch (error) {
    console.error('Erreur GET devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un devis (statut, montant, nombre de déménageurs, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log(`🔧 PATCH DEVIS ${id} (Session: ${session.entrepriseId})`);

    // Construire dynamiquement la requête UPDATE
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Statut (si fourni)
    if (body.statut !== undefined) {
      const validStatuts = ['nouveau', 'vu', 'en_traitement', 'devis_envoye', 'accepte', 'refuse', 'termine', 'archive'];
      if (!validStatuts.includes(body.statut)) {
        return NextResponse.json(
          { error: 'Statut invalide' },
          { status: 400 }
        );
      }
      updates.push(`statut = $${paramIndex}`);
      values.push(body.statut);
      paramIndex++;
    }

    // Montant estimé (si fourni)
    if (body.montant_estime !== undefined) {
      updates.push(`montant_estime = $${paramIndex}`);
      values.push(body.montant_estime === null || body.montant_estime === '' ? null : parseFloat(body.montant_estime));
      paramIndex++;
    }

    // Nombre de déménageurs (si fourni)
    if (body.nombre_demenageurs !== undefined) {
      updates.push(`nombre_demenageurs = $${paramIndex}`);
      values.push(body.nombre_demenageurs === null || body.nombre_demenageurs === '' ? null : parseInt(body.nombre_demenageurs));
      paramIndex++;
    }

    // Devise (si fournie)
    if (body.devise !== undefined) {
      updates.push(`devise = $${paramIndex}`);
      values.push(body.devise);
      paramIndex++;
    }

    // Observations (si fournies)
    if (body.observations !== undefined) {
      updates.push(`observations = $${paramIndex}`);
      values.push(body.observations);
      paramIndex++;
    }

    // Date de déménagement (si fournie)
    if (body.date_demenagement !== undefined) {
      updates.push(`date_demenagement = $${paramIndex}`);
      values.push(body.date_demenagement === null || body.date_demenagement === '' ? null : body.date_demenagement);
      paramIndex++;
    }

    // Étage départ (si fourni)
    if (body.etage_depart !== undefined) {
      updates.push(`etage_depart = $${paramIndex}`);
      values.push(body.etage_depart === null || body.etage_depart === '' ? 0 : parseInt(body.etage_depart));
      paramIndex++;
    }

    // Étage arrivée (si fourni)
    if (body.etage_arrivee !== undefined) {
      updates.push(`etage_arrivee = $${paramIndex}`);
      values.push(body.etage_arrivee === null || body.etage_arrivee === '' ? 0 : parseInt(body.etage_arrivee));
      paramIndex++;
    }

    // Ascenseur départ (si fourni)
    if (body.avec_ascenseur_depart !== undefined) {
      updates.push(`avec_ascenseur_depart = $${paramIndex}`);
      values.push(body.avec_ascenseur_depart);
      paramIndex++;
    }

    // Ascenseur arrivée (si fourni)
    if (body.avec_ascenseur_arrivee !== undefined) {
      updates.push(`avec_ascenseur_arrivee = $${paramIndex}`);
      values.push(body.avec_ascenseur_arrivee);
      paramIndex++;
    }

    // Si aucun champ à mettre à jour
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ à mettre à jour' },
        { status: 400 }
      );
    }

    // Ajouter updated_at
    updates.push(`updated_at = NOW()`);

    // Ajouter l'ID à la fin
    values.push(id);

    // Exécuter la mise à jour com RLS
    const queryText = `UPDATE devis SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id`;

    const result = await authenticatedQueryOne(queryText, values, session);

    if (!result) {
      return NextResponse.json(
        { error: 'Devis non trouvé ou accès non autorisé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur PATCH devis:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur serveur inconnue',
        details: error
      },
      { status: 500 }
    );
  }
}


