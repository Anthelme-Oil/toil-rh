import { NextResponse } from 'next/server';
import { saveFileInFolder } from '@/lib/upload';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'actualites';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier sélectionné ou transmis.' },
        { status: 400 }
      );
    }

    const fileUrl = await saveFileInFolder(file, folder);

    return NextResponse.json(
      { message: 'Fichier téléversé avec succès', url: fileUrl },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API Upload] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la sauvegarde du fichier.' },
      { status: 500 }
    );
  }
}