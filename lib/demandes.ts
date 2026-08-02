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

const graphClient = getGraphClient();
const siteBase = getSiteApiBase();

/**
 * Crée une nouvelle demande dans la Microsoft List.
 * L'insertion déclenche les workflows Power Automate associés.
 *
 * @param demande - Les données de la demande à créer
 * @returns L'ID de l'item créé dans la liste
 */
export async function creerDemande(demande: DemandeInterne): Promise<string> {
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
    const enCours = demandes.filter(d => d.statut !== 'resolu' && d.statut !== 'rejete');

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
