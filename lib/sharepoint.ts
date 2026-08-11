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
} from './graph';
import type { Actualite, DocumentSP, Evenement, Annonce } from '@/types';

const SHAREPOINT_HOSTNAME = process.env.SHAREPOINT_HOSTNAME || 'togooil.sharepoint.com';

// ═══════════════════════════════════════════════════════════════
// ACTUALITÉS
// ═══════════════════════════════════════════════════════════════

function formatSharePointUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  if (url.includes('sharepoint.com')) {
    return `/api/images/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function extractImageUrl(fields: Record<string, string>, itemId: string): string | undefined {
  if (fields.ImageUrl) {
    return formatSharePointUrl(fields.ImageUrl);
  }
  if (fields.Image) {
    try {
      const imgObj = typeof fields.Image === 'string' ? JSON.parse(fields.Image) : fields.Image;
      if (imgObj.serverRelativeUrl) {
        return `https://${SHAREPOINT_HOSTNAME}${imgObj.serverRelativeUrl}`;
      }
      if (imgObj.fileName) {
        return `https://${SHAREPOINT_HOSTNAME}/sites/NotrePortail/Lists/Actualites/Attachments/${itemId}/${encodeURIComponent(imgObj.fileName)}`;
      }
    } catch {
      // Ignorer l'erreur de parsing JSON
    }
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

    const items: Actualite[] = (response.value || []).map((item: Record<string, unknown>) => {
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

  try {
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `Blogs/${timestamp}_${cleanFileName}`;

    const response = await graphClient
      .api(`${siteBase}/drives/${DRIVE_PROCEDURES_IT}/root:/${path}:/content`)
      .put(buffer);

    return response.webUrl as string;
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
