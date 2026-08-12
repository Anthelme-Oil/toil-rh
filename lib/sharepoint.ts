// ═══════════════════════════════════════════════════════════════
// Service SharePoint — Actualités, Documents & Événements
// ═══════════════════════════════════════════════════════════════
//
// Ce module encapsule toutes les fonctions de récupération
// des données depuis SharePoint Online via Microsoft Graph.
// ═══════════════════════════════════════════════════════════════

import 'server-only';
import {
  getGraphClient,
  getSiteApiBase,
  LIST_ACTUALITES_ID,
  LIST_EVENEMENTS_ID,
  LIST_ANNONCES_ID,
  DRIVE_PROCEDURES_IT,
  DRIVE_PROCEDURES_RH,
  DRIVE_BLOG_IMAGES,
} from './graph';
import { prisma, withRetry } from '@/lib/prisma';
import type { Actualite, DocumentSP, Evenement, Annonce } from '@/types';

const SHAREPOINT_HOSTNAME = process.env.SHAREPOINT_HOSTNAME || 'togooil.sharepoint.com';

// ═══════════════════════════════════════════════════════════════
// ACTUALITÉS
// ═══════════════════════════════════════════════════════════════

function formatSharePointUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const url = rawUrl.trim();
  // URLs locales ou data URLs → servies directement sans proxy
  if (url.startsWith('data:') || url.startsWith('/')) return url;
  // URLs SharePoint / Graph → proxy avec token OAuth
  if (url.includes('sharepoint.com') || url.includes('graph.microsoft.com') || url.includes('1drv.ms')) {
    // Décoder d'abord pour éviter le double-encodage (%20 → %2520)
    let decoded = url;
    try { decoded = decodeURIComponent(url); } catch { decoded = url; }
    return `/api/images/proxy?url=${encodeURIComponent(decoded)}`;
  }
  return url;
}

function extractImageUrl(fields: Record<string, string>, itemId: string): string | undefined {
  let rawUrl: string | undefined = undefined;

  if (fields.ImageUrl) {
    rawUrl = fields.ImageUrl;
  } else if (fields.Image) {
    try {
      const imgObj = typeof fields.Image === 'string' ? JSON.parse(fields.Image) : (fields.Image as Record<string, unknown>);
      if (imgObj?.serverRelativeUrl) {
        rawUrl = `https://${SHAREPOINT_HOSTNAME}${imgObj.serverRelativeUrl}`;
      } else if (imgObj?.fileName) {
        rawUrl = `https://${SHAREPOINT_HOSTNAME}/sites/NotrePortail/Lists/Actualites/Attachments/${itemId}/${encodeURIComponent(String(imgObj.fileName))}`;
      } else if (typeof fields.Image === 'string' && fields.Image.startsWith('http')) {
        rawUrl = fields.Image;
      }
    } catch {
      if (typeof fields.Image === 'string' && fields.Image.startsWith('http')) {
        rawUrl = fields.Image;
      }
    }
  }

  if (rawUrl) {
    return formatSharePointUrl(rawUrl);
  }
  return undefined;
}

/**
 * Récupère les dernières actualités depuis la liste SharePoint.
 * @param top - Nombre maximum d'éléments à retourner (défaut: 5)
 */
export async function getActualites(top: number = 5): Promise<Actualite[]> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    console.warn('[SharePoint] Graph non configuré. Utilisation des données par défaut.');
    return [];
  }
  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_ACTUALITES_ID}/items`)
      .expand('fields')
      .top(100)
      .get();

    const rawItems = response.value || [];
    const items: Actualite[] = rawItems
      .filter((item: Record<string, unknown>) => {
        const fields = (item.fields || {}) as Record<string, string>;
        const cat = fields.Categorie || '';
        const img = fields.ImageUrl || '';
        // Filtrer pour ne garder QUE les articles réels, pas les vidéos
        return !cat.toLowerCase().startsWith('vidéo') && !img.toLowerCase().includes('.mp4');
      })
      .map((item: Record<string, unknown>) => {
        const fields = item.fields as Record<string, string>;
        const id = item.id as string;
        return {
          id,
          titre: fields.Title || '',
          description: fields.Description || '',
          contenu: fields.Contenu || '',
          datePublication: fields.DatePublication || (item.createdDateTime as string) || '',
          imageUrl: extractImageUrl(fields, id),
          categorie: fields.Categorie || undefined,
          auteur: fields.Auteur || undefined,
          lienVersPage: fields.LienVersPage || undefined,
        };
      });

    // Tri par date de publication DÉCROISSANTE (du plus récent au plus ancien)
    items.sort((a, b) => {
      const dateA = a.datePublication ? new Date(a.datePublication).getTime() : 0;
      const dateB = b.datePublication ? new Date(b.datePublication).getTime() : 0;
      return dateB - dateA;
    });

    return items.slice(0, top);
  } catch (error) {
    console.error('[SharePoint] Erreur récupération actualités:', error);
    return [];
  }
}

/**
 * Récupère le détail d'une actualité par son ID depuis SharePoint.
 * @param id - L'ID de l'élément SharePoint
 */
export async function getActualiteById(id: string): Promise<Actualite | null> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    console.warn('[SharePoint] Graph non configuré.');
    return null;
  }
  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_ACTUALITES_ID}/items/${id}`)
      .expand('fields')
      .get();

    const fields = response.fields as Record<string, string>;
    if (!fields) return null;

    return {
      id: response.id as string,
      titre: fields.Title || '',
      description: fields.Description || '',
      contenu: fields.Contenu || '',
      datePublication: fields.DatePublication || '',
      imageUrl: extractImageUrl(fields, response.id as string),
      categorie: fields.Categorie || undefined,
      auteur: fields.Auteur || undefined,
      lienVersPage: fields.LienVersPage || undefined,
    };
  } catch (error) {
    console.error(`[SharePoint] Erreur récupération actualité ${id}:`, error);
    return null;
  }
}


/**
 * Uploade un document (ex: justificatif de congé, pièce jointe) dans la bibliothèque de documents SharePoint Online.
 * @param buffer - Le contenu binaire du fichier
 * @param fileName - Le nom du fichier
 * @param folder - Le dossier cible dans la bibliothèque (ex: 'Justificatifs_Conges')
 */
export async function uploadDocumentToSharePoint(
  buffer: Buffer,
  fileName: string,
  folder: string = 'Justificatifs_Conges'
): Promise<string | null> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    return null;
  }
  const siteBase = getSiteApiBase();

  try {
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${timestamp}_${cleanFileName}`;
    const driveId = DRIVE_PROCEDURES_RH || DRIVE_PROCEDURES_IT;

    const response = await graphClient
      .api(`${siteBase}/drives/${driveId}/root:/${path}:/content`)
      .put(buffer);

    return (response.webUrl as string) || null;
  } catch (error) {
    console.error('[SharePoint] Erreur upload document vers SharePoint Online:', error);
    return null;
  }
}

/**
 * Uploade une image de couverture pour un blog dans la bibliothèque SharePoint.
 * @param buffer - Le contenu binaire du fichier
 * @param fileName - Le nom du fichier avec extension
 */
export async function uploadBlogImage(buffer: Buffer, fileName: string): Promise<string> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    throw new Error('SharePoint n\'est pas encore configuré. Renseignez les identifiants Azure AD dans .env.local');
  }
  const siteBase = getSiteApiBase();

  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `T-oil Intranet Files/${timestamp}_${cleanFileName}`;

  try {
    // Upload du fichier dans la bibliothèque d'images de blog
    const uploadResponse = await graphClient
      .api(`${siteBase}/drives/${DRIVE_BLOG_IMAGES}/root:/${filePath}:/content`)
      .put(buffer);

    const itemId = uploadResponse.id as string;

    // Récupérer les métadonnées — webUrl est l'URL permanente de la page SharePoint
    // On retourne webUrl et le proxy s'occupe de l'authentification lors de l'affichage
    const itemMeta = await graphClient
      .api(`${siteBase}/drives/${DRIVE_BLOG_IMAGES}/items/${itemId}`)
      .select('id,webUrl,@microsoft.graph.downloadUrl')
      .get();

    // Préférer l'URL de téléchargement directe si disponible (expire après ~1h, non adaptée au stockage long terme)
    // On stocke webUrl et on passe par le proxy /api/images/proxy?url= pour l'authentification
    const sharePointUrl = (itemMeta['@microsoft.graph.downloadUrl'] as string) || (itemMeta.webUrl as string);

    if (!sharePointUrl) {
      throw new Error('URL de l\'image non retournée par SharePoint.');
    }

    console.log('[SharePoint] Image uploadée avec succès. URL:', sharePointUrl);
    // Retourner l'URL directe — elle sera déjà passée par extractImageUrl qui ajoutera le proxy
    return sharePointUrl;
  } catch (error) {
    console.error('[SharePoint] Erreur upload image blog:', error);
    throw new Error('Échec de l\'upload de l\'image de couverture.');
  }
}

/**
 * Crée un nouvel article d'actualité/blog dans la Liste SharePoint.
 * @param blog - Les données de l'article à créer
 */
export async function creerActualite(blog: {
  titre: string;
  description: string;
  contenu?: string;
  categorie?: string;
  imageUrl?: string;
}): Promise<string> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    throw new Error('SharePoint n\'est pas encore configuré dans .env.local (AZURE_AD_TENANT_ID, AZURE_AD_CLIENT_ID, etc.).');
  }
  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_ACTUALITES_ID}/items`)
      .post({
        fields: {
          Title: blog.titre,
          Description: blog.description,
          Contenu: blog.contenu || '',
          Categorie: blog.categorie || 'Général',
          DatePublication: new Date().toISOString(),
          ImageUrl: blog.imageUrl || '',
        },
      });

    return response.id as string;
  } catch (error) {
    console.error('[SharePoint] Erreur création actualité:', error);
    throw new Error('Impossible de publier l\'article dans SharePoint.');
  }
}


// ═══════════════════════════════════════════════════════════════
// DOCUMENTS / PROCÉDURES
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère les documents depuis une bibliothèque SharePoint.
 * @param bibliotheque - Nom de la bibliothèque ('IT' ou 'RH')
 * @param top - Nombre maximum de résultats
 */
export async function getDocuments(
  bibliotheque: 'IT' | 'RH' = 'IT',
  top: number = 20
): Promise<DocumentSP[]> {
  const graphClient = getGraphClient();
  if (!graphClient) return [];
  const siteBase = getSiteApiBase();

  const driveId = bibliotheque === 'IT' ? DRIVE_PROCEDURES_IT : DRIVE_PROCEDURES_RH;

  try {
    const response = await graphClient
      .api(`${siteBase}/drives/${driveId}/root/children`)
      .top(top)
      .orderby('lastModifiedDateTime desc')
      .select('id,name,description,lastModifiedDateTime,size,webUrl,createdBy')
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      nom: item.name as string,
      description: (item.description as string) || undefined,
      categorie: bibliotheque,
      dateModification: item.lastModifiedDateTime as string,
      taille: item.size as number | undefined,
      urlTelechargement: item.webUrl as string,
      auteur: ((item.createdBy as Record<string, Record<string, string>>)?.user?.displayName) || undefined,
    }));
  } catch (error) {
    console.error(`[SharePoint] Erreur récupération documents ${bibliotheque}:`, error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// ÉVÉNEMENTS
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère les événements du jour depuis la liste SharePoint.
 */
export async function getEvenementsDuJour(): Promise<Evenement[]> {
  const graphClient = getGraphClient();
  if (!graphClient) return [];
  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_EVENEMENTS_ID}/items`)
      .expand('fields')
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, string>;
      return {
        id: item.id as string,
        titre: fields.Title || '',
        dateDebut: fields.DateDebut || fields.EventDate || fields.StartDate || new Date().toISOString(),
        dateFin: fields.DateFin || fields.EndDate || undefined,
        lieu: fields.Lieu || fields.Location || undefined,
        description: fields.Description || undefined,
      };
    });
  } catch (error) {
    console.error('[SharePoint] Erreur récupération événements:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// ANNONCES IMPORTANTES
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère les annonces actives depuis la liste SharePoint.
 */
export async function getAnnonces(): Promise<Annonce[]> {
  const graphClient = getGraphClient();
  if (!graphClient) return [];
  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_ANNONCES_ID}/items`)
      .expand('fields')
      .top(5)
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, string>;
      return {
        id: item.id as string,
        titre: fields.Title || '',
        contenu: fields.Contenu || '',
        type: (fields.Type as Annonce['type']) || 'info',
        datePublication: fields.DatePublication || fields.Created || '',
        lien: fields.Lien || undefined,
      };
    });
  } catch (error) {
    console.error('[SharePoint] Erreur récupération annonces:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// VIDÉOS & FORMATIONS SHAREPOINT
// ═══════════════════════════════════════════════════════════════

/**
 * Uploade un fichier vidéo MP4 vers SharePoint Online (dossier T-oil Intranet Files).
 * Utilise une session d'upload (UploadSession) pour supporter les gros fichiers sans timeout.
 */
export async function uploadVideoToSharePoint(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    throw new Error('SharePoint n\'est pas encore configuré.');
  }
  const siteBase = getSiteApiBase();
  const driveId = DRIVE_BLOG_IMAGES || DRIVE_PROCEDURES_IT;

  const timestamp = Date.now();
  const cleanFileName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `T-oil Intranet Files/${cleanFileName}`;

  try {
    // Si la vidéo fait moins de 4 Mo, simple PUT
    if (buffer.length < 4 * 1024 * 1024) {
      const response = await graphClient
        .api(`${siteBase}/drives/${driveId}/root:/${filePath}:/content`)
        .put(buffer);

      const spUrl = (response.webUrl as string) || `https://${SHAREPOINT_HOSTNAME}/sites/NotrePortail/Documents%20partages/T-oil%20Intranet%20Files/${encodeURIComponent(cleanFileName)}`;
      return spUrl;
    }

    // Si > 4 Mo, Session d'upload Graph API
    const uploadSession = await graphClient
      .api(`${siteBase}/drives/${driveId}/root:/${filePath}:/createUploadSession`)
      .post({
        item: {
          '@microsoft.graph.conflictBehavior': 'replace',
          name: cleanFileName,
        },
      });

    const uploadUrl = uploadSession.uploadUrl;
    const chunkSize = 3276800; // Chunk de 3.2 Mo
    let start = 0;
    let finalWebUrl = '';

    while (start < buffer.length) {
      const end = Math.min(start + chunkSize, buffer.length);
      const chunk = buffer.subarray(start, end);
      const contentRange = `bytes ${start}-${end - 1}/${buffer.length}`;

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': chunk.length.toString(),
          'Content-Range': contentRange,
        },
        body: new Uint8Array(chunk),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.webUrl) finalWebUrl = json.webUrl;
      } else {
        const errText = await res.text();
        console.error('[SharePoint Video Chunk] Erreur chunk:', errText);
        throw new Error('Échec du transfert du segment vidéo.');
      }
      start = end;
    }

    const videoSharePointUrl = finalWebUrl || `https://${SHAREPOINT_HOSTNAME}/sites/NotrePortail/Documents%20partages/T-oil%20Intranet%20Files/${encodeURIComponent(cleanFileName)}`;
    return videoSharePointUrl;
  } catch (error) {
    console.error('[SharePoint Video Upload] Erreur:', error);
    throw new Error('Échec de l\'upload vidéo vers SharePoint.');
  }
}

/**
 * Enregistre une vidéo dans la base de données vidéo dédiée (séparée des Actualités).
 */
export async function creerVideo(video: {
  titre: string;
  description: string;
  duree?: string;
  categorie?: string;
  videoUrl: string;
}): Promise<string> {
  try {
    let formattedVideoUrl = video.videoUrl;
    if (formattedVideoUrl.includes('sharepoint.com') || formattedVideoUrl.includes('graph.microsoft.com')) {
      formattedVideoUrl = `/api/images/proxy?url=${encodeURIComponent(formattedVideoUrl)}`;
    }

    const res = await withRetry(() =>
      prisma.videoIntranet.create({
        data: {
          titre: video.titre,
          description: video.description,
          duree: video.duree || '5 min 00 s',
          categorie: video.categorie || 'Institutionnel',
          videoUrl: formattedVideoUrl,
          thumbnailUrl: `${formattedVideoUrl}#t=2`,
        },
      })
    );

    return res.id;
  } catch (error) {
    console.error('[Vidéo Storage] Erreur création vidéo:', error);
    throw new Error('Impossible d\'enregistrer la vidéo.');
  }
}

/**
 * Récupère toutes les vidéos publiées (Base de données dédiée + SharePoint Drive T-oil Intranet Files).
 */
export async function getVideosFromSharePoint(): Promise<Array<{
  id: string;
  titre: string;
  categorie: string;
  duree: string;
  date: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
}>> {
  const videos: Array<{
    id: string;
    titre: string;
    categorie: string;
    duree: string;
    date: string;
    thumbnailUrl: string;
    videoUrl: string;
    description: string;
  }> = [];

  // 1. Charger depuis la table dédiée VideoIntranet dans MySQL
  try {
    const dbVideos = await withRetry(() =>
      prisma.videoIntranet.findMany({
        orderBy: { creeLe: 'desc' },
      })
    );

    for (const v of dbVideos) {
      videos.push({
        id: v.id,
        titre: v.titre,
        categorie: v.categorie,
        duree: v.duree || '5 min 00 s',
        date: v.creeLe ? new Date(v.creeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Récemment',
        thumbnailUrl: v.thumbnailUrl || `${v.videoUrl}#t=2`,
        videoUrl: v.videoUrl,
        description: v.description || '',
      });
    }
  } catch (err) {
    console.warn('[Vidéo Storage] Erreur lecture DB vidéo:', err);
  }

  // 2. Analyser le dossier SharePoint Drive "T-oil Intranet Files" pour les vidéos téléversées
  const graphClient = getGraphClient();
  if (graphClient) {
    try {
      const siteBase = getSiteApiBase();
      const driveId = DRIVE_BLOG_IMAGES || DRIVE_PROCEDURES_IT;
      const folderRes = await graphClient
        .api(`${siteBase}/drives/${driveId}/root:/T-oil Intranet Files:/children`)
        .get();

      const files = folderRes.value || [];
      for (const file of files) {
        const name = file.name as string;
        if (name && (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov'))) {
          const rawUrl = file.webUrl || file['@microsoft.graph.downloadUrl'] || '';
          const formattedUrl = `/api/images/proxy?url=${encodeURIComponent(rawUrl)}`;
          
          // Éviter les doublons déjà présents en BDD
          const exists = videos.some((v) => v.videoUrl.includes(encodeURIComponent(rawUrl)) || v.titre === name);
          if (!exists) {
            videos.push({
              id: file.id || name,
              titre: name.replace(/^[0-9]+_/, '').replace(/\.[^/.]+$/, ''),
              categorie: 'Formation',
              duree: '5 min 00 s',
              date: file.createdDateTime ? new Date(file.createdDateTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Récemment',
              thumbnailUrl: `${formattedUrl}#t=2`,
              videoUrl: formattedUrl,
              description: 'Vidéo téléversée sur SharePoint Drive (T-oil Intranet Files).',
            });
          }
        }
      }
    } catch (driveErr) {
      console.warn('[SharePoint Drive] Erreur lecture dossiers vidéos:', driveErr);
    }
  }

  return videos;
}

