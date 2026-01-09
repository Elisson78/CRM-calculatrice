export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File | null;
    const entrepriseId = formData.get('entrepriseId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!entrepriseId) {
      return NextResponse.json(
        { error: 'ID entreprise requis' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WebP ou SVG.' },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 5MB.' },
        { status: 400 }
      );
    }

    // Converter arquivo para Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Criar data URL completa
    const logoDataUrl = `data:${file.type};base64,${base64Data}`;

    console.log(`📦 Convertendo logo para Base64: ${file.type}, ${Math.round(buffer.length / 1024)}KB`);

    // Salvar no banco de dados (tanto logo_data quanto logo_url para compatibilidade)
    await query(
      `UPDATE entreprises SET 
         logo_data = $1,
         logo_url = $2,
         updated_at = NOW() 
       WHERE id = $3`,
      [logoDataUrl, logoDataUrl, entrepriseId]
    );

    console.log('✅ Logo salvo no banco PostgreSQL como Base64');

    return NextResponse.json({
      success: true,
      logoUrl: logoDataUrl,
      message: 'Logo uploadé avec succès',
    });

  } catch (error) {
    console.error('Erreur upload logo:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}

// Supprimer le logo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entrepriseId = searchParams.get('entrepriseId');

    if (!entrepriseId) {
      return NextResponse.json(
        { error: 'ID entreprise requis' },
        { status: 400 }
      );
    }

    // Limpar dados do logo (tanto URL quanto Base64)
    await query(
      'UPDATE entreprises SET logo_url = NULL, logo_data = NULL, updated_at = NOW() WHERE id = $1',
      [entrepriseId]
    );

    return NextResponse.json({
      success: true,
      message: 'Logo supprimé',
    });

  } catch (error) {
    console.error('Erreur suppression logo:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}









