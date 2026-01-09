export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entrepriseId = searchParams.get('entrepriseId');

    if (!entrepriseId) {
      return NextResponse.json(
        { error: 'ID entreprise requis' },
        { status: 400 }
      );
    }

    // Statistiques générales
    const generalStats = await queryOne<{
      total_devis: string;
      total_volume: string;
      total_meubles: string;
      devis_nouveau: string;
      devis_en_cours: string;
      devis_accepte: string;
      devis_refuse: string;
      devis_termine: string;
    }>(
      `SELECT 
        COUNT(*) as total_devis,
        COALESCE(SUM(volume_total_m3), 0) as total_volume,
        COALESCE(SUM(nombre_meubles), 0) as total_meubles,
        COUNT(*) FILTER (WHERE statut = 'nouveau') as devis_nouveau,
        COUNT(*) FILTER (WHERE statut IN ('vu', 'en_traitement', 'devis_envoye')) as devis_en_cours,
        COUNT(*) FILTER (WHERE statut = 'accepte') as devis_accepte,
        COUNT(*) FILTER (WHERE statut = 'refuse') as devis_refuse,
        COUNT(*) FILTER (WHERE statut = 'termine') as devis_termine
      FROM devis
      WHERE entreprise_id = $1`,
      [entrepriseId]
    );

    // Statistiques du mois en cours
    const monthStats = await queryOne<{
      devis_mois: string;
      volume_mois: string;
      accepte_mois: string;
    }>(
      `SELECT 
        COUNT(*) as devis_mois,
        COALESCE(SUM(volume_total_m3), 0) as volume_mois,
        COUNT(*) FILTER (WHERE statut = 'accepte') as accepte_mois
      FROM devis
      WHERE entreprise_id = $1
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [entrepriseId]
    );

    // Statistiques du mois précédent (pour comparaison)
    const lastMonthStats = await queryOne<{
      devis_mois_prec: string;
      volume_mois_prec: string;
      accepte_mois_prec: string;
    }>(
      `SELECT 
        COUNT(*) as devis_mois_prec,
        COALESCE(SUM(volume_total_m3), 0) as volume_mois_prec,
        COUNT(*) FILTER (WHERE statut = 'accepte') as accepte_mois_prec
      FROM devis
      WHERE entreprise_id = $1
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND created_at < DATE_TRUNC('month', CURRENT_DATE)`,
      [entrepriseId]
    );

    // Statistiques des 7 derniers jours
    const weekStats = await queryOne<{
      devis_semaine: string;
      volume_semaine: string;
    }>(
      `SELECT 
        COUNT(*) as devis_semaine,
        COALESCE(SUM(volume_total_m3), 0) as volume_semaine
      FROM devis
      WHERE entreprise_id = $1
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [entrepriseId]
    );

    // Devis par jour (7 derniers jours)
    const devisParJour = await query<{
      jour: string;
      count: string;
    }>(
      `SELECT 
        TO_CHAR(created_at::date, 'YYYY-MM-DD') as jour,
        COUNT(*) as count
      FROM devis
      WHERE entreprise_id = $1
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY created_at::date
      ORDER BY created_at::date`,
      [entrepriseId]
    );

    // Devis par statut (pour graphique)
    const devisParStatut = await query<{
      statut: string;
      count: string;
    }>(
      `SELECT statut, COUNT(*) as count
       FROM devis
       WHERE entreprise_id = $1
       GROUP BY statut
       ORDER BY count DESC`,
      [entrepriseId]
    );

    // Top 5 meubles les plus demandés
    const topMeubles = await query<{
      meuble_nom: string;
      total_quantite: string;
    }>(
      `SELECT 
        dm.meuble_nom,
        SUM(dm.quantite) as total_quantite
      FROM devis_meubles dm
      JOIN devis d ON dm.devis_id = d.id
      WHERE d.entreprise_id = $1
      GROUP BY dm.meuble_nom
      ORDER BY total_quantite DESC
      LIMIT 5`,
      [entrepriseId]
    );

    // Volume moyen par devis
    const volumeMoyen = await queryOne<{
      volume_moyen: string;
    }>(
      `SELECT COALESCE(AVG(volume_total_m3), 0) as volume_moyen
       FROM devis
       WHERE entreprise_id = $1`,
      [entrepriseId]
    );

    // Taux de conversion (acceptés / total)
    const totalDevis = parseInt(generalStats?.total_devis || '0');
    const acceptes = parseInt(generalStats?.devis_accepte || '0');
    const tauxConversion = totalDevis > 0 ? (acceptes / totalDevis) * 100 : 0;

    // Clients uniques
    const clientsUniques = await queryOne<{
      clients_uniques: string;
    }>(
      `SELECT COUNT(DISTINCT client_email) as clients_uniques
       FROM devis
       WHERE entreprise_id = $1`,
      [entrepriseId]
    );

    // Derniers devis
    const derniersDevis = await query(
      `SELECT id, numero, client_nom, client_email, volume_total_m3, statut, created_at
       FROM devis
       WHERE entreprise_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [entrepriseId]
    );

    // Calculer les tendances (comparaison avec mois précédent)
    const devisMois = parseInt(monthStats?.devis_mois || '0');
    const devisMoisPrec = parseInt(lastMonthStats?.devis_mois_prec || '0');
    const tendanceDevis = devisMoisPrec > 0
      ? ((devisMois - devisMoisPrec) / devisMoisPrec) * 100
      : (devisMois > 0 ? 100 : 0);

    return NextResponse.json({
      // Stats générales
      totalDevis: parseInt(generalStats?.total_devis || '0'),
      totalVolume: parseFloat(generalStats?.total_volume || '0'),
      totalMeubles: parseInt(generalStats?.total_meubles || '0'),
      clientsUniques: parseInt(clientsUniques?.clients_uniques || '0'),

      // Stats par statut
      devisNouveau: parseInt(generalStats?.devis_nouveau || '0'),
      devisEnCours: parseInt(generalStats?.devis_en_cours || '0'),
      devisAccepte: parseInt(generalStats?.devis_accepte || '0'),
      devisRefuse: parseInt(generalStats?.devis_refuse || '0'),
      devisTermine: parseInt(generalStats?.devis_termine || '0'),

      // Stats temporelles
      devisCeMois: parseInt(monthStats?.devis_mois || '0'),
      volumeCeMois: parseFloat(monthStats?.volume_mois || '0'),
      acceptesCeMois: parseInt(monthStats?.accepte_mois || '0'),
      devisSemaine: parseInt(weekStats?.devis_semaine || '0'),
      volumeSemaine: parseFloat(weekStats?.volume_semaine || '0'),

      // Métriques calculées
      volumeMoyen: parseFloat(volumeMoyen?.volume_moyen || '0'),
      tauxConversion: Math.round(tauxConversion * 10) / 10,
      tendanceDevis: Math.round(tendanceDevis * 10) / 10,

      // Données pour graphiques
      devisParJour: devisParJour.map(d => ({
        jour: d.jour,
        count: parseInt(d.count),
      })),
      devisParStatut: devisParStatut.map(d => ({
        statut: d.statut,
        count: parseInt(d.count),
      })),
      topMeubles: topMeubles.map(m => ({
        nom: m.meuble_nom,
        quantite: parseInt(m.total_quantite),
      })),

      // Derniers devis
      derniersDevis,
    });

  } catch (error) {
    console.error('Erreur stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
