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

const graphClient = getGraphClient();
const siteBase = getSiteApiBase();

// ═══════════════════════════════════════════════════════════════
// ACTUALITÉS
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère les dernières actualités depuis la liste SharePoint.
 * @param top - Nombre maximum d'éléments à retourner (défaut: 5)
 */
export async function getActualites(top: number = 5): Promise<Actualite[]> {
  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_ACTUALITES_ID}/items`)
      .expand('fields($select=Title,Description,DatePublication,ImageUrl,Categorie,LienVersPage)')
      .top(top)
      .orderby('fields/DatePublication desc')
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, string>;
      return {
        id: item.id as string,
        titre: fields.Title || '',
        description: fields.Description || '',
        datePublication: fields.DatePublication || '',
        imageUrl: fields.ImageUrl || undefined,
        categorie: fields.Categorie || undefined,
        lienVersPage: fields.LienVersPage || undefined,
      };
    });
  } catch (error) {
    console.error('[SharePoint] Erreur récupération actualités:', error);
    return [];
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
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_EVENEMENTS_ID}/items`)
      .expand('fields($select=Title,DateDebut,DateFin,Lieu,Description)')
      .filter(`fields/DateDebut ge '${today}T00:00:00Z' and fields/DateDebut le '${today}T23:59:59Z'`)
      .orderby('fields/DateDebut asc')
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, string>;
      return {
        id: item.id as string,
        titre: fields.Title || '',
        dateDebut: fields.DateDebut || '',
        dateFin: fields.DateFin || undefined,
        lieu: fields.Lieu || undefined,
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
  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_ANNONCES_ID}/items`)
      .expand('fields($select=Title,Contenu,Type,DatePublication,Lien)')
      .filter("fields/Actif eq 1")
      .orderby('fields/DatePublication desc')
      .top(5)
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, string>;
      return {
        id: item.id as string,
        titre: fields.Title || '',
        contenu: fields.Contenu || '',
        type: (fields.Type as Annonce['type']) || 'info',
        datePublication: fields.DatePublication || '',
        lien: fields.Lien || undefined,
      };
    });
  } catch (error) {
    console.error('[SharePoint] Erreur récupération annonces:', error);
    return [];
  }
}
