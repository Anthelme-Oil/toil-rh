import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
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

    // 1. Sauvegarde locale de l'image pour affichage direct (court et compatible SharePoint < 255 chars)
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const timestamp = Date.now();
        const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${cleanFileName}`;
        const filePath = path.join(uploadDir, filename);

        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(filePath, buffer);

        // URL relative courte (< 50 caractères)
        imageUrl = `/uploads/blogs/${filename}`;

        // Upload optionnel vers le Drive SharePoint si configuré
        try {
          await uploadBlogImage(buffer, imageFile.name);
        } catch (err) {
          console.warn('[SharePoint Drive] Upload image optionnel ignoré:', err);
        }
      } catch (err) {
        console.error('[API Actualités] Erreur sauvegarde locale de l\'image:', err);
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

    // 3. Purge du cache Next.js pour affichage instantané
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
