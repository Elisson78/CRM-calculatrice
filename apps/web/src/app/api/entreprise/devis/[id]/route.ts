import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET - Récupérer un devis avec ses meubles
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Récupérer le devis
    const devis = await queryOne(
      `SELECT * FROM devis WHERE id = $1`,
      [id]
    );

    if (!devis) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les meubles du devis
    const meubles = await query(
      `SELECT * FROM devis_meubles WHERE devis_id = $1 ORDER BY meuble_categorie, meuble_nom`,
      [id]
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log(`🔧 PATCH DEVIS ${id}`);
    console.log('📦 Body:', body);

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

    // Exécuter la mise à jour
    const queryText = `UPDATE devis SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
    console.log('📝 Query:', queryText);
    console.log('❓ Values:', values);

    await query(queryText, values);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur PATCH devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


