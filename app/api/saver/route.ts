
import { NextResponse } from 'next/server';
import { saveFileInFolder } from '@/lib/upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'actualites';

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Aucun fichier sélectionné ou transmis.' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Le fichier est vide.' },
        { status: 400 }
      );
    }

    const fileUrl = await saveFileInFolder(file, folder);

    return NextResponse.json(
      {
        message: 'Fichier téléversé avec succès',
        url: fileUrl,
        size: file.size,
        name: file.name,
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('[API Upload] Erreur:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Erreur lors de la sauvegarde du fichier.';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
