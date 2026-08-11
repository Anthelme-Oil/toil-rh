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

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${cleanFileName}`;

      // 1. PRIORITÉ : Upload sur SharePoint Drive → URL publique permanente
      try {
        const spUrl = await uploadBlogImage(buffer, imageFile.name);
        imageUrl = spUrl;
        console.log('[API Actualités] Image uploadée sur SharePoint Drive:', spUrl);
      } catch (spErr) {
        console.warn('[SharePoint Drive] Upload impossible, fallback disque local:', spErr);

        // 2. FALLBACK : Sauvegarde locale si SharePoint non configuré ou en erreur
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, buffer);
          // ⚠️ Cette URL locale ne fonctionnera PAS depuis SharePoint — usage temporaire seulement
          imageUrl = `/api/uploads/blogs/${filename}`;
          console.warn('[API Actualités] Image sauvegardée localement (invisible depuis SharePoint):', imageUrl);
        } catch (fsErr) {
          console.error('[API Actualités] Erreur écriture fichier image locale:', fsErr);
        }
      }
    }

    // 2. Création de l'élément dans SharePoint
    const id = await creerActualite({
      titre,
      description,
      contenu,
      categorie,
      imageUrl,
    });

    // 3. Purge du cache Next.js
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
