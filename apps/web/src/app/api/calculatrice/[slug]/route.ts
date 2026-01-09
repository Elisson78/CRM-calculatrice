import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Entreprise, CategorieMeuble, Meuble } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug = '';
  try {
    const paramsResolved = await params;
    slug = paramsResolved.slug;

    console.log('🚀 Calculatrice API called with slug:', slug);
    console.log('Looking for entreprise with slug:', slug);
    const entreprise = await queryOne<Entreprise>(
      `SELECT * FROM entreprises WHERE slug = $1 AND actif = true AND deleted_at IS NULL`,
      [slug]
    );

    console.log('Entreprise found:', entreprise ? 'YES' : 'NO');

    if (!entreprise) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée', slug },
        { status: 404 }
      );
    }

    // 2. Récupérer les catégories de meubles
    const categories = await query<CategorieMeuble>(
      `SELECT * FROM categories_meubles WHERE actif = true ORDER BY ordre ASC`
    );

    // 3. Récupérer les meubles actifs
    const meubles = await query<Meuble>(
      `SELECT * FROM meubles WHERE actif = true ORDER BY ordre ASC`
    );

    // 4. Retourner les données
    return NextResponse.json({
      entreprise,
      categories,
      meubles,
    });

  } catch (error) {
    console.error('Erreur API calculatrice:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        slug: slug
      },
      { status: 500 }
    );
  }
}









