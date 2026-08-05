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
} from './graph';
import type { DemandeInterne, CompteursDemandesParType } from '@/types';

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
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_DEMANDES_ID}/items`)
      .post({
        fields: {
          Title: demande.titre,
          TypeDemande: 'demande_conges',
          SousType: demande.typeConge,
          DateDebut: demande.dateDebut,
          DateFin: demande.dateFin,
          NombreJours: demande.nombreJours.toString(),
          Description: demande.motif || '',
          Statut: 'EN_ATTENTE_N1',
          DemandeurEmail: demande.demandeurEmail,
          DemandeurNom: demande.demandeurNom,
          ManagerEmail: demande.managerEmail || '',
          DateCreation: new Date().toISOString(),
        },
      });

    return response.id;
  } catch (error) {
    console.error('[Demandes] Erreur création demande de congé:', error);
    throw new Error('Impossible d\'enregistrer la demande de congé.');
  }
}

/**
 * Récupère les demandes de congés soumises par un utilisateur.
 */
export async function getDemandesCongesUtilisateur(email: string): Promise<DemandeConge[]> {
  const graphClient = getGraphClient();
  if (!graphClient) return [];
  const siteBase = getSiteApiBase();

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_DEMANDES_ID}/items`)
      .expand('fields')
      .filter(`fields/DemandeurEmail eq '${email}' and fields/TypeDemande eq 'demande_conges'`)
      .orderby('fields/DateCreation desc')
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, string>;
      return {
        id: item.id as string,
        titre: fields.Title || 'Demande de Congé',
        typeConge: (fields.SousType as DemandeConge['typeConge']) || 'conge_paye',
        dateDebut: fields.DateDebut || '',
        dateFin: fields.DateFin || '',
        nombreJours: parseFloat(fields.NombreJours || '1'),
        motif: fields.Description || '',
        statut: (fields.Statut as StatutConge) || 'EN_ATTENTE_N1',
        demandeurNom: fields.DemandeurNom || '',
        demandeurEmail: fields.DemandeurEmail || '',
        managerEmail: fields.ManagerEmail || '',
        motifRefus: fields.MotifRefus || undefined,
        dateCreation: fields.DateCreation || '',
      };
    });
  } catch (error) {
    console.error('[Demandes] Erreur récupération demandes de congés:', error);
    return [];
  }
}

/**
 * Récupère les demandes en attente de validation pour un Manager N+1 ou pour l'équipe RH.
 */
export async function getDemandesCongesAValider(
  email: string,
  role: 'N1' | 'RH'
): Promise<DemandeConge[]> {
  const graphClient = getGraphClient();
  if (!graphClient) return [];
  const siteBase = getSiteApiBase();

  const filterStatut = role === 'N1' ? "fields/Statut eq 'EN_ATTENTE_N1'" : "fields/Statut eq 'EN_ATTENTE_RH'";
  const filterEmail = role === 'N1' ? ` and fields/ManagerEmail eq '${email}'` : '';

  try {
    const response = await graphClient
      .api(`${siteBase}/lists/${LIST_DEMANDES_ID}/items`)
      .expand('fields')
      .filter(`fields/TypeDemande eq 'demande_conges' and ${filterStatut}${filterEmail}`)
      .orderby('fields/DateCreation desc')
      .get();

    return (response.value || []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, string>;
      return {
        id: item.id as string,
        titre: fields.Title || 'Demande de Congé',
        typeConge: (fields.SousType as DemandeConge['typeConge']) || 'conge_paye',
        dateDebut: fields.DateDebut || '',
        dateFin: fields.DateFin || '',
        nombreJours: parseFloat(fields.NombreJours || '1'),
        motif: fields.Description || '',
        statut: (fields.Statut as StatutConge) || (role === 'N1' ? 'EN_ATTENTE_N1' : 'EN_ATTENTE_RH'),
        demandeurNom: fields.DemandeurNom || '',
        demandeurEmail: fields.DemandeurEmail || '',
        managerEmail: fields.ManagerEmail || '',
        dateCreation: fields.DateCreation || '',
      };
    });
  } catch (error) {
    console.error('[Demandes] Erreur récupération demandes à valider:', error);
    return [];
  }
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

  let nouveauStatut: StatutConge;
  if (action === 'APPROUVER') {
    nouveauStatut = role === 'N1' ? 'EN_ATTENTE_RH' : 'APPROUVEE';
  } else {
    nouveauStatut = role === 'N1' ? 'REFUSEE_N1' : 'REFUSEE_RH';
  }

  const patchFields: Record<string, string> = {
    Statut: nouveauStatut,
  };

  if (role === 'N1') {
    patchFields.DateValidationN1 = new Date().toISOString();
  } else {
    patchFields.DateValidationRH = new Date().toISOString();
  }

  if (motifRefus) {
    patchFields.MotifRefus = motifRefus;
  }

  try {
    await graphClient
      .api(`${siteBase}/lists/${LIST_DEMANDES_ID}/items/${id}`)
      .patch({ fields: patchFields });

    return true;
  } catch (error) {
    console.error(`[Demandes] Erreur traitement demande ${id}:`, error);
    return false;
  }
}
