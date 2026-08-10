// ═══════════════════════════════════════════════════════════════
// Service Demandes Internes — Bridge vers Microsoft Lists
// ═══════════════════════════════════════════════════════════════
//
// Ce module gère la création et la récupération des demandes
// internes (IT, RH, Matériel, Accès) stockées dans une
// Microsoft List. La création d'un item dans cette liste
// déclenche automatiquement les workflows Power Automate
// configurés en arrière-plan.
// ═══════════════════════════════════════════════════════════════

import 'server-only';
import {
  getGraphClient,
  getSiteApiBase,
  LIST_DEMANDES_ID,
  LIST_CONGES_ID,
} from './graph';
import { serverCache } from './cache';
import type { DemandeInterne, CompteursDemandesParType } from '@/types';

// TTL du cache pour les données de congés (2 min — bon compromis fraîcheur/perf)
const CONGES_CACHE_TTL = 2 * 60 * 1000;
// TTL du cache pour les compteurs du dashboard (3 min)
const COMPTEURS_CACHE_TTL = 3 * 60 * 1000;

// ═══════════════════════════════════════════════════════════════
// ACTUALITÉS ET DEMANDES
// ═══════════════════════════════════════════════════════════════

/**
 * Crée une nouvelle demande dans la Microsoft List.
 * L'insertion déclenche les workflows Power Automate associés.
 *
 * @param demande - Les données de la demande à créer
 * @returns L'ID de l'item créé dans la liste
 */
export async function creerDemande(demande: DemandeInterne): Promise<string> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    throw new Error('SharePoint / Graph non configuré dans .env.local.');
  }
  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_DEMANDES_ID}/items`)
      .post({
        fields: {
          Title: demande.titre,
          TypeDemande: demande.type,
          Description: demande.description,
          Priorite: demande.priorite,
          Statut: 'en_attente',
          DemandeurEmail: demande.demandeurEmail,
          DemandeurNom: demande.demandeurNom,
          DateCreation: new Date().toISOString(),
        },
      });

    return response.id;
  } catch (error) {
    console.error('[Demandes] Erreur création demande:', error);
    throw new Error('Impossible de créer la demande. Veuillez réessayer.');
  }
}

/**
 * Récupère les demandes d'un utilisateur depuis la Microsoft List.
 *
 * @param email - L'email de l'utilisateur
 * @param top - Nombre maximum de résultats
 */
export async function getDemandesUtilisateur(
  email: string,
  top: number = 20
): Promise<DemandeInterne[]> {
  const graphClient = getGraphClient();
  if (!graphClient) return [];
  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_DEMANDES_ID}/items`)
      .expand('fields($select=Title,TypeDemande,Description,Priorite,Statut,DemandeurEmail,DemandeurNom,DateCreation,DateResolution,Commentaires)')
      .filter(`fields/DemandeurEmail eq '${email}'`)
      .orderby('fields/DateCreation desc')
      .top(top)
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, string>;
      return {
        id: item.id as string,
        titre: fields.Title || '',
        type: fields.TypeDemande as DemandeInterne['type'],
        description: fields.Description || '',
        priorite: fields.Priorite as DemandeInterne['priorite'],
        statut: fields.Statut as DemandeInterne['statut'],
        demandeurEmail: fields.DemandeurEmail || '',
        demandeurNom: fields.DemandeurNom || '',
        dateCreation: fields.DateCreation || '',
        dateResolution: fields.DateResolution || undefined,
        commentaires: fields.Commentaires || undefined,
      };
    });
  } catch (error) {
    console.error('[Demandes] Erreur récupération demandes:', error);
    return [];
  }
}

/**
 * Récupère les compteurs de demandes par type pour un utilisateur.
 *
 * @param email - L'email de l'utilisateur
 */
export async function getCompteursDemandesParType(
  email: string
): Promise<CompteursDemandesParType> {
  return serverCache.getOrFetch(
    `compteurs:${email.toLowerCase().trim()}`,
    async () => {
      try {
        const demandes = await getDemandesUtilisateur(email, 100);
        const enCours = demandes.filter(d => d.statut !== 'resolu' && d.statut !== 'refuse');

        return {
          materiel: enCours.filter(d => d.type === 'materiel').length,
          acces: enCours.filter(d => d.type === 'acces').length,
          it: enCours.filter(d => d.type === 'it').length,
          rh: enCours.filter(d => d.type === 'rh').length,
        };
      } catch (error) {
        console.error('[Demandes] Erreur compteurs:', error);
        return { materiel: 0, acces: 0, it: 0, rh: 0 };
      }
    },
    COMPTEURS_CACHE_TTL,
  );
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW DE DEMANDE DE CONGÉS (N+1 -> RH)
// ═══════════════════════════════════════════════════════════════

import type { DemandeConge, StatutConge } from '@/types';

/**
 * Crée une nouvelle demande de congé dans la liste SharePoint.
 */
export async function creerDemandeConge(
  demande: Omit<DemandeConge, 'id' | 'statut' | 'dateCreation'>
): Promise<string> {
  const graphClient = getGraphClient();
  if (!graphClient) {
    throw new Error('SharePoint / Graph non configuré dans .env.local.');
  }
  const siteBase = getSiteApiBase();

  try {
    // Helper de normalisation stricte (supprime accents, espaces et caractères spéciaux)
    const normalizeStr = (str: string) =>
      str
        ? str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
        : '';

    let columnsMap: Record<string, string> = {};
    let availableColsList: string[] = [];

    try {
      // Interroge à la fois /columns et l'expand de la liste pour garantir la récupération
      const colsRes = await graphClient
        .api(`${siteBase}/lists/${LIST_CONGES_ID}/columns`)
        .get();
      
      const cols = colsRes?.value || [];
      availableColsList = cols.map((c: { name: string; displayName: string }) => `${c.displayName} (${c.name})`);

      cols.forEach((col: { name: string; displayName: string }) => {
        if (col.name) {
          columnsMap[normalizeStr(col.name)] = col.name;
        }
        if (col.displayName) {
          columnsMap[normalizeStr(col.displayName)] = col.name;
        }
      });
      console.log('[Demandes] Colonnes SharePoint chargées:', availableColsList);
    } catch (colErr) {
      console.warn('[Demandes] Impossible de lister les colonnes SharePoint:', colErr);
    }

    const getColName = (possibleNames: string[], fallback: string): string => {
      for (const name of possibleNames) {
        const clean = normalizeStr(name);
        if (columnsMap[clean]) {
          return columnsMap[clean];
        }
      }
      // Cherche une clé contenue partiellement si pas de match exact
      for (const name of possibleNames) {
        const clean = normalizeStr(name);
        for (const [key, realName] of Object.entries(columnsMap)) {
          if (key.includes(clean) || clean.includes(key)) {
            return realName;
          }
        }
      }
      return fallback;
    };

    const titleCol = getColName(['title', 'titre'], 'Title');
    const dateDebutCol = getColName(['datedebutconge', 'datedebut', 'debut'], 'Dated_x00e9_butcong_x00e9_');
    const dateFinCol = getColName(['datefinconge', 'datefin', 'fin'], 'Datefincong_x00e9_');
    const typeCol = getColName(['typedeconge', 'typeconge', 'type'], 'Typedecong_x00e9_');
    const statutCol = getColName(['statutdelademande', 'statut'], 'Statutdelademande');

    const fieldsPayload: Record<string, unknown> = {
      [titleCol]: demande.titre,
      [dateDebutCol]: demande.dateDebut,
      [dateFinCol]: demande.dateFin,
      [typeCol]:
        demande.typeConge === 'conge_paye'
          ? 'Congé Payé'
          : demande.typeConge === 'maladie'
          ? 'Arrêt Maladie'
          : demande.typeConge === 'maternite_paternite'
          ? 'Maternité / Paternité'
          : demande.typeConge === 'sans_solde'
          ? 'Sans Solde'
          : demande.typeConge === 'evenement_familial'
          ? 'Événement Familial'
          : 'Autre',
      [statutCol]: 'Soumise',
    };

    let userMap: Record<string, number> = {
      'it.helpdesktogo@togosh.com': 12,
      'portailtest@togosh.com': 28,
      'honore.fiadjoe@togosh.com': 6,
      'madje.bedou@togosh.com': 10,
      'dzidefo.dake@togosh.com': 22,
      'test10.toil@togosh.com': 23,
      'test10@togosh.com': 23,
    };

    try {
      const listsRes = await graphClient.api(`${siteBase}/lists?$select=id,displayName,name,system`).get();
      const userList = listsRes.value.find((l: { name?: string; displayName?: string }) => l.name === 'users' || l.displayName?.includes('utilisateur'));
      if (userList) {
        const itemsRes = await graphClient.api(`${siteBase}/lists/${userList.id}/items?expand=fields`).get();
        itemsRes.value.forEach((item: { id: string; fields?: Record<string, string> }) => {
          const id = Number(item.id);
          const f = item.fields || {};
          const mail = (f.EMail || f.UserName || '').toLowerCase().trim();
          if (mail) userMap[mail] = id;
          const nameStr = (f.Name || '').toLowerCase().trim();
          if (nameStr.includes('membership|')) {
            const uMail = nameStr.split('membership|')[1]?.toLowerCase().trim();
            if (uMail) userMap[uMail] = id;
          }
        });
      }
    } catch (uErr) {
      console.warn('[Demandes] Impossible de récupérer la liste dynamique des utilisateurs SharePoint:', uErr);
    }

    const resolveUserLookupId = (email?: string, directId?: number | string, fallbackId?: number): number | undefined => {
      if (directId) return Number(directId);
      if (!email) return fallbackId;
      const key = email.toLowerCase().trim();
      if (userMap[key]) return userMap[key];
      for (const [e, id] of Object.entries(userMap)) {
        if (e && (e.includes(key) || key.includes(e))) return id;
      }
      return fallbackId;
    };

    const demandeurId = resolveUserLookupId(demande.demandeurEmail, demande.demandeurLookupId, 12);
    const supId = resolveUserLookupId(demande.managerEmail, demande.supHierarchiqueLookupId, 28);

    if (demandeurId) {
      fieldsPayload['DemandeurLookupId'] = Number(demandeurId);
    }

    if (supId) {
      fieldsPayload['Sup_x00e9_rieurhi_x00e9_rarchiquLookupId'] = Number(supId);
    }

    // Si la colonne Motif existe bien dans le schéma SharePoint, on l'ajoute
    if (demande.motif && columnsMap['motif']) {
      fieldsPayload[columnsMap['motif']] = demande.motif;
    }

    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_CONGES_ID}/items`)
      .post({
        fields: fieldsPayload,
      });

    // Traitement et envoi des pièces jointes à SharePoint si présent
    if (demande.piecesJointes && demande.piecesJointes.length > 0 && response.id) {
      for (const file of demande.piecesJointes) {
        try {
          const rawBase64 = file.contentBase64.includes(',')
            ? file.contentBase64.split(',')[1]
            : file.contentBase64;
          const buffer = Buffer.from(rawBase64, 'base64');

          await graphClient
            .api(`${siteBase}/lists/${LIST_CONGES_ID}/items/${response.id}/attachments/${encodeURIComponent(file.name)}`)
            .put(buffer);

          console.log(`[Demandes] Pièce jointe téléversée avec succès: ${file.name}`);
        } catch (attachErr) {
          console.warn(`[Demandes] Échec de l'envoi de la pièce jointe ${file.name}:`, attachErr);
        }
      }
    }

    // ⚡ Invalidation du cache après mutation
    serverCache.invalidateByPrefix('conges:');
    serverCache.invalidateByPrefix('compteurs:');

    return response.id;
  } catch (error: unknown) {
    console.error('[Demandes] Erreur création demande de congé (Détails):', error);
    
    let detailMsg = 'Impossible d\'enregistrer la demande de congé.';
    if (error && typeof error === 'object') {
      const errObj = error as { body?: unknown; message?: string; code?: string };
      if (errObj.body) {
        detailMsg = typeof errObj.body === 'string' ? errObj.body : JSON.stringify(errObj.body);
      } else if (errObj.message) {
        detailMsg = errObj.message;
      }
    }
    throw new Error(detailMsg);
  }
}

/**
 * Helper pour convertir un item SharePoint en objet DemandeConge
 */
function mapSPItemToDemandeConge(item: any): DemandeConge {
  const f = item.fields || {};
  return {
    id: item.id,
    titre: f.Title || 'Demande de congé',
    typeConge: (f.Typedecong_x00e9_ || f.SousType || 'conge_paye') as DemandeConge['typeConge'],
    dateDebut: f.Dated_x00e9_butcong_x00e9_ || f.DateDebut || '',
    dateFin: f.Datefincong_x00e9_ || f.DateFin || '',
    nombreJours: parseFloat(f.NombreJours || '1'),
    motif: f.Description || f.Motif || '',
    statut: (f.Statutdelademande || f.Statut || 'En attente de validation') as StatutConge,
    demandeurNom: f.DemandeurNom || '',
    demandeurEmail: f.DemandeurEmail || '',
    demandeurLookupId: f.DemandeurLookupId,
    supHierarchiqueLookupId: f.Sup_x00e9_rieurhi_x00e9_rarchiquLookupId,
    managerEmail: f.ManagerEmail || '',
    dateCreation: f.Created || f.DateCreation || '',
  };
}

/**
 * Récupère les demandes de congés soumises par un utilisateur.
 */
export async function getDemandesCongesUtilisateur(email: string): Promise<DemandeConge[]> {
  return serverCache.getOrFetch(
    `conges:user:${email.toLowerCase().trim()}`,
    async () => {
      const graphClient = getGraphClient();
      if (!graphClient) return [];
      const siteBase = getSiteApiBase();

      try {
        const listsRes = await graphClient.api(`${siteBase}/lists?$select=id,displayName,name,system`).get();
        const userList = listsRes.value.find((l: { name?: string; displayName?: string }) => l.name === 'users' || l.displayName?.includes('utilisateur'));
        let userLookupId: string | number | undefined;

        if (userList) {
          const itemsRes = await graphClient.api(`${siteBase}/lists/${userList.id}/items?expand=fields`).get();
          const target = itemsRes.value.find((it: any) => {
            const f = it.fields || {};
            const mail = (f.EMail || f.UserName || '').toLowerCase().trim();
            const nameStr = (f.Name || '').toLowerCase().trim();
            const key = email.toLowerCase().trim();
            return mail === key || (nameStr.includes('membership|') && nameStr.includes(key));
          });
          if (target) userLookupId = target.id;
        }

        const response = await graphClient
          .api(`${siteBase}/lists/${LIST_CONGES_ID}/items?expand=fields`)
          .get();

        const allDemandes = (response.value || []).map(mapSPItemToDemandeConge);

        if (!email) return allDemandes;

        return allDemandes.filter((d: DemandeConge) => {
          if (userLookupId && String(d.demandeurLookupId) === String(userLookupId)) return true;
          if (d.demandeurEmail && d.demandeurEmail.toLowerCase().trim() === email.toLowerCase().trim()) return true;
          return false;
        });
      } catch (error) {
        console.error('[Demandes] Erreur récupération demandes de congés utilisateur:', error);
        return [];
      }
    },
    CONGES_CACHE_TTL,
  );
}

/**
 * Récupère les demandes à valider pour un Supérieur Hiérarchique (N+1) ou RH.
 */
export async function getDemandesCongesAValider(
  email: string,
  role: 'N1' | 'RH'
): Promise<DemandeConge[]> {
  return serverCache.getOrFetch(
    `conges:valider:${role}:${email.toLowerCase().trim()}`,
    async () => {
      const graphClient = getGraphClient();
      if (!graphClient) return [];
      const siteBase = getSiteApiBase();

      try {
        const listsRes = await graphClient.api(`${siteBase}/lists?$select=id,displayName,name,system`).get();
        const userList = listsRes.value.find((l: { name?: string; displayName?: string }) => l.name === 'users' || l.displayName?.includes('utilisateur'));
        let userLookupId: string | number | undefined;

        if (userList) {
          const itemsRes = await graphClient.api(`${siteBase}/lists/${userList.id}/items?expand=fields`).get();
          const target = itemsRes.value.find((it: any) => {
            const f = it.fields || {};
            const mail = (f.EMail || f.UserName || '').toLowerCase().trim();
            const nameStr = (f.Name || '').toLowerCase().trim();
            const key = email.toLowerCase().trim();
            return mail === key || (nameStr.includes('membership|') && nameStr.includes(key));
          });
          if (target) userLookupId = target.id;
        }

        const response = await graphClient
          .api(`${siteBase}/lists/${LIST_CONGES_ID}/items?expand=fields`)
          .get();

        const allDemandes = (response.value || []).map(mapSPItemToDemandeConge);

        if (role === 'RH') {
          return allDemandes;
        }

        // Role N+1 : Filtrer les demandes destinées à cet utilisateur comme Supérieur Hiérarchique
        return allDemandes.filter((d: DemandeConge) => {
          if (userLookupId && String(d.supHierarchiqueLookupId) === String(userLookupId)) return true;
          if (d.managerEmail && d.managerEmail.toLowerCase().trim() === email.toLowerCase().trim()) return true;
          return false;
        });
      } catch (error) {
        console.error('[Demandes] Erreur récupération demandes à valider:', error);
        return [];
      }
    },
    CONGES_CACHE_TTL,
  );
}

/**
 * Fait évoluer le statut d'une demande de congé (Approbation ou Refus par N+1 ou RH).
 */
export async function traiterDemandeConge(
  id: string,
  action: 'APPROUVER' | 'REFUSER',
  role: 'N1' | 'RH',
  motifRefus?: string
): Promise<boolean> {
  const graphClient = getGraphClient();
  if (!graphClient) return false;
  const siteBase = getSiteApiBase();

  let nouveauStatut: string;
  if (action === 'APPROUVER') {
    nouveauStatut = role === 'N1' ? 'Approuvée par N+1' : 'Accordée';
  } else {
    nouveauStatut = 'Refusée';
  }

  const patchFields: Record<string, string> = {
    Statutdelademande: nouveauStatut,
  };

  if (motifRefus) {
    patchFields.MotifRefus = motifRefus;
  }

  try {
    await graphClient
      .api(`${siteBase}/lists/${LIST_CONGES_ID}/items/${id}/fields`)
      .patch(patchFields);

    // ⚡ Invalidation du cache après mutation
    serverCache.invalidateByPrefix('conges:');

    return true;
  } catch (error) {
    console.error(`[Demandes] Erreur traitement demande ${id}:`, error);
    return false;
  }
}
