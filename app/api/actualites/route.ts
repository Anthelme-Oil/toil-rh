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

    // 1. Upload prioritaire de l'image vers SharePoint Drive (Bibliothèque Documents / Blogs)
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        // Envoi direct vers SharePoint Drive
        const spWebUrl = await uploadBlogImage(buffer, imageFile.name);
        if (spWebUrl) {
          imageUrl = spWebUrl;
        }
      } catch (spErr) {
        console.warn('[SharePoint Drive] Envoi SharePoint indisponible, utilisation du stockage local:', spErr);

        // Fallback local si SharePoint n'est pas encore configuré
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const timestamp = Date.now();
          const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${timestamp}_${cleanFileName}`;
          fs.writeFileSync(path.join(uploadDir, filename), buffer);
          imageUrl = `/uploads/blogs/${filename}`;
        } catch (localErr) {
          console.error('[API Actualités] Erreur fallback local:', localErr);
        }
      }
    }

    // 2. Création de l'élément d'actualité dans la Liste SharePoint
    const id = await creerActualite({
      titre,
      description,
      contenu,
      categorie,
      imageUrl,
    });

    // 3. Invalidation du cache pour rafraîchissement immédiat
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
