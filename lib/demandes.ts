// ═══════════════════════════════════════════════════════════════
// Service Demandes Internes — Connexion MySQL via Prisma ORM
// ═══════════════════════════════════════════════════════════════

import 'server-only';
import { prisma, withRetry } from './prisma';
import type { DemandeInterne, CompteursDemandesParType, DemandeConge, StatutConge, PieceJointe } from '@/types';

// ═══════════════════════════════════════════════════════════════
// 1. DEMANDES INTERNES GÉNÉRIQUES (IT, Matériel, Accès, RH)
// ═══════════════════════════════════════════════════════════════

/**
 * Crée une nouvelle demande interne dans MySQL via Prisma.
 */
export async function creerDemande(demande: DemandeInterne): Promise<string> {
  try {
    const created = await withRetry(() =>
      prisma.demande.create({
        data: {
          titre: demande.titre,
          typeDemande: (demande.type || 'AUTRE').toUpperCase(),
          statut: 'EN_ATTENTE',
          emailDemandeur: demande.demandeurEmail.toLowerCase().trim(),
          nomDemandeur: demande.demandeurNom || demande.demandeurEmail.split('@')[0],
          motif: demande.description,
          donneesFormulaire: {
            priorite: demande.priorite,
          },
        },
      })
    );

    return created.id;
  } catch (error) {
    console.error('[Demandes] Erreur création demande MySQL:', error);
    throw new Error('Impossible de créer la demande. Veuillez réessayer.');
  }
}

/**
 * Récupère les demandes d'un utilisateur depuis MySQL.
 */
export async function getDemandesUtilisateur(
  email: string,
  top: number = 20
): Promise<DemandeInterne[]> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const rows = await withRetry(() =>
      prisma.demande.findMany({
        where: {
          emailDemandeur: cleanEmail,
          typeDemande: {
            not: 'CONGE',
          },
        },
        orderBy: {
          creeLe: 'desc',
        },
        take: top,
      })
    );

    return rows.map((r) => {
      const extra = (r.donneesFormulaire as Record<string, unknown>) || {};
      return {
        id: r.id,
        titre: r.titre,
        type: r.typeDemande.toLowerCase() as DemandeInterne['type'],
        description: r.motif || '',
        priorite: (extra.priorite as DemandeInterne['priorite']) || 'moyenne',
        statut: (r.statut.toLowerCase() === 'approuve' ? 'resolu' : r.statut.toLowerCase()) as DemandeInterne['statut'],
        demandeurEmail: r.emailDemandeur,
        demandeurNom: r.nomDemandeur,
        dateCreation: r.creeLe.toISOString(),
        dateResolution: r.dateValidationRH?.toISOString() || r.dateValidationN1?.toISOString(),
        commentaires: r.commentaireRH || r.commentaireN1 || undefined,
      };
    });
  } catch (error) {
    console.error('[Demandes] Erreur récupération demandes MySQL:', error);
    return [];
  }
}

/**
 * Récupère les compteurs de demandes par type pour un utilisateur.
 */
export async function getCompteursDemandesParType(
  email: string
): Promise<CompteursDemandesParType> {
  try {
    const demandes = await getDemandesUtilisateur(email, 100);
    const enCours = demandes.filter((d) => d.statut !== 'resolu' && d.statut !== 'refuse');

    return {
      materiel: enCours.filter((d) => d.type === 'materiel').length,
      acces: enCours.filter((d) => d.type === 'acces').length,
      it: enCours.filter((d) => d.type === 'it').length,
      rh: enCours.filter((d) => d.type === 'rh').length,
    };
  } catch (error) {
    console.error('[Demandes] Erreur compteurs MySQL:', error);
    return { materiel: 0, acces: 0, it: 0, rh: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. WORKFLOW DE DEMANDE DE CONGÉS (N+1 -> RH)
// ═══════════════════════════════════════════════════════════════

/**
 * Crée une nouvelle demande de congé dans MySQL via Prisma.
 */
export async function creerDemandeConge(
  demande: Omit<DemandeConge, 'id' | 'statut' | 'dateCreation'>
): Promise<string> {
  try {
    const cleanEmail = demande.demandeurEmail.toLowerCase().trim();
    const cleanManagerEmail = (demande.managerEmail || '').toLowerCase().trim();
    const mainAttachmentName = demande.piecesJointes?.[0]?.name || null;

    const created = await withRetry(() =>
      prisma.demande.create({
        data: {
          titre: demande.titre,
          typeDemande: 'CONGE',
          statut: 'EN_ATTENTE',
          emailDemandeur: cleanEmail,
          nomDemandeur: demande.demandeurNom || cleanEmail.split('@')[0],
          emailManager: cleanManagerEmail,
          typeConge: demande.typeConge || 'conge_paye',
          dateDebut: demande.dateDebut ? new Date(demande.dateDebut) : null,
          dateFin: demande.dateFin ? new Date(demande.dateFin) : null,
          nombreJours: demande.nombreJours || 1,
          motif: demande.motif || '',
          pieceJointe: mainAttachmentName,
          donneesFormulaire: demande.piecesJointes ? JSON.parse(JSON.stringify({ piecesJointes: demande.piecesJointes })) : undefined,
        },
      })
    );

    return created.id;
  } catch (error: unknown) {
    console.error('[Demandes] Erreur création demande de congé MySQL:', error);
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Impossible d'enregistrer la demande: ${detail}`);
  }
}

/**
 * Convertit un enregistrement Prisma `demandes` en objet `DemandeConge`
 */
function mapPrismaToDemandeConge(row: any): DemandeConge {
  let statutFormatted: StatutConge = 'En attente de validation';
  if (row.statut === 'APPROUVE' || row.statutRH === 'APPROUVE') {
    statutFormatted = 'Accordée';
  } else if (row.statutN1 === 'APPROUVE' && row.statutRH === 'EN_ATTENTE') {
    statutFormatted = 'EN_ATTENTE_RH';
  } else if (row.statut === 'REFUSE' || row.statutN1 === 'REFUSE' || row.statutRH === 'REFUSE') {
    statutFormatted = 'Refusée';
  }

  const extra = (row.donneesFormulaire as Record<string, any>) || {};
  const piecesJointes: PieceJointe[] | undefined =
    extra.piecesJointes || (row.pieceJointe ? [{ name: row.pieceJointe, contentBase64: '' }] : undefined);

  return {
    id: row.id,
    titre: row.titre || 'Demande de congé',
    typeConge: (row.typeConge || 'conge_paye') as DemandeConge['typeConge'],
    dateDebut: row.dateDebut ? row.dateDebut.toISOString() : '',
    dateFin: row.dateFin ? row.dateFin.toISOString() : '',
    nombreJours: row.nombreJours || 1,
    motif: row.motif || '',
    statut: statutFormatted,
    demandeurNom: row.nomDemandeur || '',
    demandeurEmail: row.emailDemandeur || '',
    managerEmail: row.emailManager || '',
    dateCreation: row.creeLe ? row.creeLe.toISOString() : '',
    pieceJointeUrl: row.pieceJointe || undefined,
    piecesJointes: piecesJointes,
  };
}

/**
 * Récupère les demandes de congés d'un utilisateur.
 */
export async function getDemandesCongesUtilisateur(email: string): Promise<DemandeConge[]> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const rows = await withRetry(() =>
      prisma.demande.findMany({
        where: {
          emailDemandeur: cleanEmail,
          typeDemande: 'CONGE',
        },
        orderBy: {
          creeLe: 'desc',
        },
      })
    );

    return rows.map(mapPrismaToDemandeConge);
  } catch (error) {
    console.error('[Demandes] Erreur lecture demandes congés utilisateur MySQL:', error);
    return [];
  }
}

/**
 * Récupère les demandes de congés à valider pour le Supérieur N+1 ou RH.
 */
export async function getDemandesCongesAValider(
  email: string,
  role: 'N1' | 'RH'
): Promise<DemandeConge[]> {
  try {
    const cleanEmail = email.toLowerCase().trim();

    if (role === 'RH') {
      const rows = await withRetry(() =>
        prisma.demande.findMany({
          where: {
            typeDemande: 'CONGE',
          },
          orderBy: {
            creeLe: 'desc',
          },
        })
      );
      return rows.map(mapPrismaToDemandeConge);
    }

    // Role N+1 : Les demandes où emailManager correspond
    const rows = await withRetry(() =>
      prisma.demande.findMany({
        where: {
          typeDemande: 'CONGE',
          emailManager: cleanEmail,
        },
        orderBy: {
          creeLe: 'desc',
        },
      })
    );

    return rows.map(mapPrismaToDemandeConge);
  } catch (error) {
    console.error('[Demandes] Erreur demandes à valider MySQL:', error);
    return [];
  }
}

/**
 * Traite (Approuve ou Refuse) une demande de congé.
 */
export async function traiterDemandeConge(
  id: string,
  action: 'APPROUVER' | 'REFUSER',
  role: 'N1' | 'RH',
  motifRefus?: string
): Promise<boolean> {
  try {
    const newStatut = action === 'APPROUVER' ? 'APPROUVE' : 'REFUSE';

    if (role === 'N1') {
      await withRetry(() =>
        prisma.demande.update({
          where: { id },
          data: {
            statutN1: newStatut,
            dateValidationN1: new Date(),
            commentaireN1: motifRefus || null,
            ...(newStatut === 'REFUSE' ? { statut: 'REFUSE' } : {}),
          },
        })
      );
    } else {
      await withRetry(() =>
        prisma.demande.update({
          where: { id },
          data: {
            statutRH: newStatut,
            dateValidationRH: new Date(),
            commentaireRH: motifRefus || null,
            statut: newStatut,
          },
        })
      );
    }

    return true;
  } catch (error) {
    console.error(`[Demandes] Erreur traitement demande ${id} MySQL:`, error);
    return false;
  }
}
