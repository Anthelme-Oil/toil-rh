import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { creerActualite, getActualites, uploadBlogImage } from '@/lib/sharepoint';

export async function GET() {
  try {
    const actualites = await getActualites(100);
    return NextResponse.json({ actualites });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur récupération actualités.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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

    // 1. Conversion de l'image en Base64 Data URL pour affichage garanti sans problème de CORS / Auth SharePoint
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = imageFile.type || 'image/jpeg';
      const base64 = buffer.toString('base64');
      imageUrl = `data:${mimeType};base64,${base64}`;

      // Envoi optionnel vers le Drive SharePoint si configuré
      try {
        await uploadBlogImage(buffer, imageFile.name);
      } catch (err) {
        console.warn('[SharePoint Drive] Upload image optionnel ignoré:', err);
      }
    }

    // 2. Création de l'élément d'actualité dans SharePoint
    const id = await creerActualite({
      titre,
      description,
      contenu,
      categorie,
      imageUrl,
    });

    // 3. Purge du cache Next.js pour affichage instantané sur toutes les pages
    revalidatePath('/informations');
    revalidatePath('/');

    return NextResponse.json(
      { success: true, id, message: 'Article de blog publié avec succès sur SharePoint !' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[API Actualités] Erreur:', error);
    const msg = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du blog.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
