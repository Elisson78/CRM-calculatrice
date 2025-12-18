import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, pool } from '@/lib/db';
import type { Entreprise, MeubleSelection } from '@/types/database';
import { sendDevisEmails, type DevisEmailData } from '@/lib/email';

interface DevisPayload {
  entreprise_id?: string;
  entreprise_slug?: string;
  nom: string;
  email: string;
  telephone: string;
  adresse_depart: string;
  avec_ascenseur_depart: boolean;
  adresse_arrivee: string;
  avec_ascenseur_arrivee: boolean;
  date_demenagement?: string;
  observations?: string;
  volume_total_m3: number;
  meubles: MeubleSelection[];
}

export async function POST(request: NextRequest) {
  console.log('🔥 API /api/devis - Nouvelle requête reçue');
  const client = await pool.connect();
  
  try {
    const payload: DevisPayload = await request.json();
    console.log('📦 Payload reçu:', { 
      ...payload, 
      meubles: payload.meubles?.length || 0,
      email: payload.email || 'MANQUANT'
    });
    
    // Validation basique
    if (!payload.email || !payload.nom || !payload.adresse_depart || !payload.adresse_arrivee) {
      console.log('❌ Validation échouée - Données manquantes');
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }
    
    console.log('✅ Validation basique réussie');
    
    // Trouver l'entreprise
    let entreprise: Entreprise | null = null;
    
    console.log('🏢 Recherche entreprise...', {
      id: payload.entreprise_id || 'non fourni',
      slug: payload.entreprise_slug || 'non fourni'
    });
    
    if (payload.entreprise_id) {
      console.log('🔍 Recherche par ID:', payload.entreprise_id);
      entreprise = await queryOne<Entreprise>(
        'SELECT * FROM entreprises WHERE id = $1',
        [payload.entreprise_id]
      );
    } else if (payload.entreprise_slug) {
      console.log('🔍 Recherche par slug:', payload.entreprise_slug);
      entreprise = await queryOne<Entreprise>(
        'SELECT * FROM entreprises WHERE slug = $1',
        [payload.entreprise_slug]
      );
    }
    
    if (!entreprise) {
      console.log('❌ Entreprise non trouvée');
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }
    
    console.log('✅ Entreprise trouvée:', entreprise.nom);
    
    // Démarrer la transaction
    await client.query('BEGIN');
    
    try {
      // Calculer le poids total
      const poidsTotal = payload.meubles.reduce(
        (acc, m) => acc + (m.quantite * (m.poids_unitaire_kg || 0)),
        0
      );
      
      // Calculer le nombre de meubles
      const nombreMeubles = payload.meubles.reduce(
        (acc, m) => acc + m.quantite,
        0
      );
      
      // 1. Créer le devis
      const devisResult = await client.query(
        `INSERT INTO devis (
          entreprise_id,
          client_nom,
          client_email,
          client_telephone,
          adresse_depart,
          avec_ascenseur_depart,
          adresse_arrivee,
          avec_ascenseur_arrivee,
          date_demenagement,
          observations,
          volume_total_m3,
          poids_total_kg,
          nombre_meubles,
          statut,
          source,
          ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'nouveau', 'calculatrice', $14)
        RETURNING id, numero`,
        [
          entreprise.id,
          payload.nom,
          payload.email,
          payload.telephone,
          payload.adresse_depart,
          payload.avec_ascenseur_depart,
          payload.adresse_arrivee,
          payload.avec_ascenseur_arrivee,
          payload.date_demenagement || null,
          payload.observations || null,
          payload.volume_total_m3,
          poidsTotal,
          nombreMeubles,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        ]
      );
      
      const devisId = devisResult.rows[0].id;
      const devisNumero = devisResult.rows[0].numero;
      
      // 2. Insérer les meubles du devis
      for (const meuble of payload.meubles) {
        await client.query(
          `INSERT INTO devis_meubles (
            devis_id,
            meuble_id,
            meuble_nom,
            meuble_categorie,
            quantite,
            volume_unitaire_m3,
            poids_unitaire_kg
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            devisId,
            meuble.meuble_id,
            meuble.meuble_nom,
            meuble.meuble_categorie,
            meuble.quantite,
            meuble.volume_unitaire_m3,
            meuble.poids_unitaire_kg || null,
          ]
        );
      }
      
      // 3. Valider la transaction
      await client.query('COMMIT');
      
      // 4. Envoyer les emails (en arrière-plan)
      console.log('📧 Iniciando envio de emails em background...');
      sendEmails(devisId, entreprise, payload).catch(error => {
        console.error('❌ Erro no envio de emails (background):', error);
        console.error('❌ Stack trace email:', error.stack);
      });
      
      return NextResponse.json({
        success: true,
        devis_id: devisId,
        devis_numero: devisNumero,
        message: 'Demande de devis enregistrée avec succès',
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Erreur API devis:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Payload reçu:', JSON.stringify(payload, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'enregistrement du devis',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Fonction pour envoyer les emails
async function sendEmails(
  devisId: string,
  entreprise: Entreprise,
  payload: DevisPayload
) {
  try {
    // Préparer les données pour l'email
    const emailData: DevisEmailData = {
      clientNom: payload.nom,
      clientEmail: payload.email,
      clientTelephone: payload.telephone,
      adresseDepart: payload.adresse_depart,
      adresseArrivee: payload.adresse_arrivee,
      dateDemenagement: payload.date_demenagement,
      volumeTotal: payload.volume_total_m3,
      nombreMeubles: payload.meubles.reduce((acc, m) => acc + m.quantite, 0),
      meubles: payload.meubles.map(m => ({
        nom: m.meuble_nom,
        categorie: m.meuble_categorie,
        quantite: m.quantite,
        volume: m.quantite * m.volume_unitaire_m3,
      })),
      entreprise: {
        nom: entreprise.nom,
        email: entreprise.email_notification || entreprise.email,
        telephone: entreprise.telephone || undefined,
        smtp_host: entreprise.smtp_host || undefined,
        smtp_port: entreprise.smtp_port || undefined,
        smtp_user: entreprise.smtp_user || undefined,
        smtp_password: entreprise.smtp_password || undefined,
        smtp_secure: entreprise.smtp_secure !== undefined ? entreprise.smtp_secure : true,
        use_custom_smtp: entreprise.use_custom_smtp || false,
      },
    };
    
    // Envoyer les emails
    const result = await sendDevisEmails(emailData);
    
    // Marquer les emails comme envoyés
    await query(
      `UPDATE devis SET 
        email_client_envoye = $1,
        email_client_date = CASE WHEN $1 THEN NOW() ELSE NULL END,
        email_entreprise_envoye = $2,
        email_entreprise_date = CASE WHEN $2 THEN NOW() ELSE NULL END
      WHERE id = $3`,
      [result.clientSent, result.entrepriseSent, devisId]
    );
    
    console.log(`📧 Emails envoyés - Client: ${result.clientSent}, Entreprise: ${result.entrepriseSent}`);
    
  } catch (error) {
    console.error('Erreur envoi emails:', error);
  }
}

