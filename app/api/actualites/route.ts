import { NextResponse } from 'next/server';
import { creerActualite, uploadBlogImage } from '@/lib/sharepoint';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const titre = formData.get('titre') as string;
    const description = formData.get('description') as string;
    const contenu = formData.get('contenu') as string;
    const categorie = formData.get('categorie') as string;
    const imageFile = formData.get('image') as File | null;

    if (!titre || !description) {
      return NextResponse.json(
        { error: 'Le titre et la description sont requis.' },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined = undefined;

    // 1. Upload de l'image si fournie
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = await uploadBlogImage(buffer, imageFile.name);
    }

    // 2. Création de l'élément d'actualité dans SharePoint
    const id = await creerActualite({
      titre,
      description,
      contenu,
      categorie,
      imageUrl,
    });

    return NextResponse.json(
      { success: true, id, message: 'Article de blog publié avec succès sur SharePoint !' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API Actualités] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la création du blog.' },
      { status: 500 }
    );
  }
}
