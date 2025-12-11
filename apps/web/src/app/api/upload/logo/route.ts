import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
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

    // Créer le dossier si nécessaire
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `${entrepriseId}-${Date.now()}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL relative du logo
    const logoUrl = `/uploads/logos/${fileName}`;

    // Mettre à jour la base de données
    await query(
      'UPDATE entreprises SET logo_url = $1, updated_at = NOW() WHERE id = $2',
      [logoUrl, entrepriseId]
    );

    return NextResponse.json({
      success: true,
      logoUrl,
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

    // Mettre à jour la base de données
    await query(
      'UPDATE entreprises SET logo_url = NULL, updated_at = NOW() WHERE id = $1',
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



