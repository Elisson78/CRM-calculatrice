import { NextResponse } from 'next/server';
import { authenticatedQueryOne } from '@/lib/db';

export async function GET() {
  try {
    const stats = await authenticatedQueryOne<{
      total_entreprises: string;
      total_meubles: string;
      total_devis: string;
      total_clients: string;
    }>(
      `SELECT 
        (SELECT COUNT(*) FROM entreprises WHERE deleted_at IS NULL) as total_entreprises,
        (SELECT COUNT(*) FROM meubles WHERE actif = true) as total_meubles,
        (SELECT COUNT(*) FROM devis) as total_devis,
        (SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL) as total_clients`,
      [],
      { role: 'admin' }
    );

    return NextResponse.json({
      totalEntreprises: parseInt(stats?.total_entreprises || '0'),
      totalMeubles: parseInt(stats?.total_meubles || '0'),
      totalDevis: parseInt(stats?.total_devis || '0'),
      totalClients: parseInt(stats?.total_clients || '0'),
    });

  } catch (error) {
    console.error('Erreur admin stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}









