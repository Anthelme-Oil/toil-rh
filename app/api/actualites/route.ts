import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import {
  creerActualite,
  getActualites,
  uploadBlogImage,
  uploadVideoToSharePoint,
  creerVideo,
  getVideosFromSharePoint,
  creerEvenement,
  getEvenementsDuJour,
} from '@/lib/sharepoint';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [actualites, videos, evenements] = await Promise.all([
      getActualites(100),
      getVideosFromSharePoint(),
      getEvenementsDuJour(),
    ]);

    return NextResponse.json(
      { actualites, videos, evenements },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur récupération actualités & événements.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const type = (formData.get('type') as string) || 'article';
    const titre = formData.get('titre') as string;
    const description = formData.get('description') as string;
    const contenu = formData.get('contenu') as string;
    const categorie = formData.get('categorie') as string;
    const duree = (formData.get('duree') as string) || '5 min';

    // 📅 PUBLICATION D'ÉVÉNEMENT (LIST: Evenement t-oil)
    if (type === 'evenement') {
      const dateDebut = formData.get('dateDebut') as string;
      const dateFin = (formData.get('dateFin') as string) || undefined;
      const lieu = (formData.get('lieu') as string) || undefined;

      if (!titre || !dateDebut) {
        return NextResponse.json(
          { error: 'Le titre et la date de début de l\'événement sont requis.' },
          { status: 400 }
        );
      }

      const id = await creerEvenement({
        titre,
        dateDebut,
        dateFin,
        lieu,
        description,
      });

      revalidatePath('/informations');
      revalidatePath('/publications');
      revalidatePath('/');

      return NextResponse.json(
        {
          success: true,
          id,
          message: 'Événement publié avec succès dans la liste SharePoint Evenement t-oil !',
        },
        { status: 201 }
      );
    }

    if (!titre || !description) {
      return NextResponse.json(
        { error: 'Le titre et la description sont requis.' },
        { status: 400 }
      );
    }

    // 🎥 PUBLICATION DE VIDÉO / FORMATION
    if (type === 'video') {
      const videoFile = formData.get('video') as File | null;
      let videoUrlInput = (formData.get('videoUrl') as string) || '';

      if (!videoFile && !videoUrlInput) {
        return NextResponse.json(
          { error: 'Un fichier vidéo (.mp4) ou un lien SharePoint vers la vidéo est requis.' },
          { status: 400 }
        );
      }

      let finalVideoUrl = videoUrlInput;

      if (videoFile && videoFile.size > 0) {
        const bytes = await videoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        try {
          // Upload direct sur SharePoint Drive dans "T-oil Intranet Files"
          const spUrl = await uploadVideoToSharePoint(buffer, videoFile.name);
          finalVideoUrl = spUrl;
          console.log('[API Vidéos] Vidéo uploadée avec succès sur SharePoint:', spUrl);
        } catch (spErr) {
          console.warn('[SharePoint Video Upload] Fallback sauvegarde locale:', spErr);

          try {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            const cleanName = `${Date.now()}_${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = path.join(uploadDir, cleanName);
            fs.writeFileSync(filePath, buffer);
            finalVideoUrl = `/uploads/videos/${cleanName}`;
          } catch (fsErr) {
            console.error('[API Vidéos] Échec écriture vidéo locale:', fsErr);
            throw new Error('Impossible de sauvegarder le fichier vidéo.');
          }
        }
      }

      // Enregistrement de la vidéo dans SharePoint
      const id = await creerVideo({
        titre,
        description,
        duree,
        categorie,
        videoUrl: finalVideoUrl,
      });

      // Purge du cache
      revalidatePath('/informations');
      revalidatePath('/onboarding');
      revalidatePath('/');

      return NextResponse.json(
        {
          success: true,
          id,
          videoUrl: finalVideoUrl,
          message: 'Vidéo & Formation publiée avec succès sur SharePoint Online !',
        },
        { status: 201 }
      );
    }

    // 📰 PUBLICATION D'ARTICLE (EXISTANT)
    const imageFile = formData.get('image') as File | null;
    let imageUrl: string | undefined = undefined;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${cleanFileName}`;

      try {
        const spUrl = await uploadBlogImage(buffer, imageFile.name);
        imageUrl = spUrl;
        console.log('[API Actualités] Image uploadée sur SharePoint Drive:', spUrl);
      } catch (spErr) {
        console.warn('[SharePoint Drive] Upload impossible, fallback disque local:', spErr);

        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, buffer);
          imageUrl = `/api/uploads/blogs/${filename}`;
        } catch (fsErr) {
          console.error('[API Actualités] Erreur écriture fichier image locale:', fsErr);
        }
      }
    }

    const id = await creerActualite({
      titre,
      description,
      contenu,
      categorie,
      imageUrl,
    });

    revalidatePath('/informations');
    revalidatePath('/');

    return NextResponse.json(
      { success: true, id, message: 'Article de blog publié avec succès sur SharePoint !' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[API Actualités] Erreur:', error);
    const msg = error instanceof Error ? error.message : 'Une erreur est survenue lors de la publication.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

