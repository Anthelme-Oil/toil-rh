// ═══════════════════════════════════════════════════════════════
// Service Demandes Internes — Connexion Directe MySQL via mysql2
// ═══════════════════════════════════════════════════════════════

import 'server-only';
import { query, execute, generateId } from './db';
import type { DemandeInterne, CompteursDemandesParType, DemandeConge, StatutConge, PieceJointe } from '@/types';

// ═══════════════════════════════════════════════════════════════
// 1. DEMANDES INTERNES GÉNÉRIQUES (IT, Matériel, Accès, RH)
// ═══════════════════════════════════════════════════════════════

/**
 * Crée une nouvelle demande interne dans MySQL.
 */
export async function creerDemande(demande: DemandeInterne): Promise<string> {
  try {
    const id = generateId();
    const cleanEmail = demande.demandeurEmail.toLowerCase().trim();
    const nom = demande.demandeurNom || cleanEmail.split('@')[0];
    const typeDem = (demande.type || 'AUTRE').toUpperCase();
    const now = new Date();
    const donneesFormulaire = JSON.stringify({ priorite: demande.priorite });

    const sql = `
      INSERT INTO demandes (id, titre, type_demande, statut, email_demandeur, nom_demandeur, motif, donnees_formulaire, cree_le, mis_a_jour_le)
      VALUES (?, ?, ?, 'EN_ATTENTE', ?, ?, ?, ?, ?, ?)
    `;

    await execute(sql, [id, demande.titre, typeDem, cleanEmail, nom, demande.description, donneesFormulaire, now, now]);
    return id;
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
    const sql = `
      SELECT * FROM demandes 
      WHERE email_demandeur = ? AND type_demande != 'CONGE' 
      ORDER BY cree_le DESC 
      LIMIT ?
    `;
    const rows = await query<any>(sql, [cleanEmail, top]);

    return rows.map((row) => {
      let priorite: DemandeInterne['priorite'] = 'normale';
      if (row.donnees_formulaire) {
        try {
          const parsed = typeof row.donnees_formulaire === 'string' ? JSON.parse(row.donnees_formulaire) : row.donnees_formulaire;
          if (parsed?.priorite) priorite = parsed.priorite;
        } catch {}
      }

      let type: DemandeInterne['type'] = 'it';
      const t = (row.type_demande || '').toLowerCase();
      if (t === 'materiel') type = 'materiel';
      else if (t === 'acces') type = 'acces';
      else if (t === 'rh') type = 'rh';

      return {
        id: row.id,
        titre: row.titre || 'Demande sans titre',
        description: row.motif || '',
        type,
        priorite,
        statut: row.statut === 'EN_ATTENTE' ? 'soumis' : row.statut === 'APPROUVE' ? 'resolu' : 'en_cours',
        dateCreation: row.cree_le ? new Date(row.cree_le).toISOString() : new Date().toISOString(),
        demandeurEmail: row.email_demandeur || cleanEmail,
        demandeurNom: row.nom_demandeur || '',
      };
    });
  } catch (error) {
    console.error('[Demandes] Erreur lecture demandes utilisateur MySQL:', error);
    return [];
  }
}

/**
 * Récupère le nombre de demandes en cours par catégorie.
 */
export async function getCompteursDemandesUtilisateur(email: string): Promise<CompteursDemandesParType> {
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

export { getCompteursDemandesUtilisateur as getCompteursDemandesParType };

// ═══════════════════════════════════════════════════════════════
// 2. WORKFLOW DE DEMANDE DE CONGÉS (N+1 -> RH)
// ═══════════════════════════════════════════════════════════════

import { processAndSaveAttachments } from './storage';

/**
 * Crée une nouvelle demande de congé dans MySQL via mysql2.
 */
export async function creerDemandeConge(
  demande: Omit<DemandeConge, 'id' | 'statut' | 'dateCreation'>
): Promise<string> {
  try {
    const id = generateId();
    const cleanEmail = demande.demandeurEmail.toLowerCase().trim();
    const cleanManagerEmail = (demande.managerEmail || '').toLowerCase().trim();

    // Traitement et sauvegarde physique des fichiers lourds dans /public/uploads/
    const processedAttachments = await processAndSaveAttachments(demande.piecesJointes);

    const mainAttachmentName = processedAttachments?.[0]?.name || null;
    const mainAttachmentUrl = processedAttachments?.[0]?.url || null;
    const now = new Date();
    const dateDeb = demande.dateDebut ? new Date(demande.dateDebut) : null;
    const dateF = demande.dateFin ? new Date(demande.dateFin) : null;
    const donneesFormulaire = processedAttachments.length > 0 ? JSON.stringify({ piecesJointes: processedAttachments }) : null;

    const sql = `
      INSERT INTO demandes (
        id, titre, type_demande, statut, email_demandeur, nom_demandeur, email_manager,
        type_conge, date_debut, date_fin, nombre_jours, motif, piece_jointe, donnees_formulaire, cree_le, mis_a_jour_le
      ) VALUES (?, ?, 'CONGE', 'EN_ATTENTE', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await execute(sql, [
      id,
      demande.titre,
      cleanEmail,
      demande.demandeurNom || cleanEmail.split('@')[0],
      cleanManagerEmail,
      demande.typeConge || 'conge_paye',
      dateDeb,
      dateF,
      demande.nombreJours || 1,
      demande.motif || '',
      mainAttachmentUrl || mainAttachmentName,
      donneesFormulaire,
      now,
      now,
    ]);

    return id;
  } catch (error: unknown) {
    console.error('[Demandes] Erreur création demande de congé MySQL:', error);
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Impossible d'enregistrer la demande: ${detail}`);
  }
}

/**
 * Convertit un enregistrement SQL `demandes` en objet `DemandeConge`
 */
export function mapRowToDemandeConge(row: any): DemandeConge {
  let statutFormatted: StatutConge = 'En attente de validation';
  if (row.statut === 'APPROUVE' || row.statut_rh === 'APPROUVE') {
    statutFormatted = 'Accordée';
  } else if (row.statut_n1 === 'APPROUVE' && row.statut_rh === 'EN_ATTENTE') {
    statutFormatted = 'EN_ATTENTE_RH';
  } else if (row.statut === 'REFUSE' || row.statut_n1 === 'REFUSE' || row.statut_rh === 'REFUSE') {
    statutFormatted = 'Refusée';
  }

  let extra: Record<string, any> = {};
  if (row.donnees_formulaire) {
    try {
      extra = typeof row.donnees_formulaire === 'string' ? JSON.parse(row.donnees_formulaire) : row.donnees_formulaire;
    } catch {}
  }

  const piecesJointes: PieceJointe[] | undefined =
    extra.piecesJointes || (row.piece_jointe ? [{ name: row.piece_jointe.split('/').pop() || 'document', url: row.piece_jointe }] : undefined);

  return {
    id: row.id,
    titre: row.titre || 'Demande de congé',
    typeConge: (row.type_conge || 'conge_paye') as DemandeConge['typeConge'],
    dateDebut: row.date_debut ? new Date(row.date_debut).toISOString() : '',
    dateFin: row.date_fin ? new Date(row.date_fin).toISOString() : '',
    nombreJours: row.nombre_jours || 1,
    motif: row.motif || '',
    statut: statutFormatted,
    demandeurNom: row.nom_demandeur || '',
    demandeurEmail: row.email_demandeur || '',
    managerEmail: row.email_manager || '',
    dateCreation: row.cree_le ? new Date(row.cree_le).toISOString() : new Date().toISOString(),
    pieceJointeUrl: row.piece_jointe || undefined,
    piecesJointes: piecesJointes,
  };
}

/**
 * Récupère les demandes de congés d'un utilisateur.
 */
export async function getDemandesCongesUtilisateur(email: string): Promise<DemandeConge[]> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const rows = await query<any>(
      'SELECT * FROM demandes WHERE email_demandeur = ? AND type_demande = "CONGE" ORDER BY cree_le DESC',
      [cleanEmail]
    );

    return rows.map(mapRowToDemandeConge);
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
      const rows = await query<any>(
        'SELECT * FROM demandes WHERE type_demande = "CONGE" ORDER BY cree_le DESC'
      );
      return rows.map(mapRowToDemandeConge);
    }

    // Role N+1 : Les demandes où email_manager correspond
    const rows = await query<any>(
      'SELECT * FROM demandes WHERE type_demande = "CONGE" AND LOWER(email_manager) = ? ORDER BY cree_le DESC',
      [cleanEmail]
    );

    return rows.map(mapRowToDemandeConge);
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
    const now = new Date();

    if (role === 'N1') {
      const sql = `
        UPDATE demandes 
        SET statut_n1 = ?, date_validation_n1 = ?, commentaire_n1 = ?, mis_a_jour_le = ?
        ${newStatut === 'REFUSE' ? ", statut = 'REFUSE'" : ''}
        WHERE id = ?
      `;
      await execute(sql, [newStatut, now, motifRefus || null, now, id]);
    } else {
      const sql = `
        UPDATE demandes 
        SET statut_rh = ?, date_validation_rh = ?, commentaire_rh = ?, statut = ?, mis_a_jour_le = ?
        WHERE id = ?
      `;
      await execute(sql, [newStatut, now, motifRefus || null, newStatut, now, id]);
    }

    return true;
  } catch (error) {
    console.error(`[Demandes] Erreur traitement demande ${id} MySQL:`, error);
    return false;
  }
}
