// ═══════════════════════════════════════════════════════════════
// T-OIL / COMPEL STSL — TypeScript Interfaces & Types
// ═══════════════════════════════════════════════════════════════

/** Actualité SharePoint */
export interface Actualite {
  id: string;
  titre: string;
  description: string;
  contenu?: string;
  datePublication: string;
  imageUrl?: string;
  categorie?: string;
  auteur?: string;
  tempsLecture?: string;
  lienVersPage?: string;
}

/** Document / Procédure SharePoint */
export interface DocumentSP {
  id: string;
  nom: string;
  description?: string;
  categorie: 'IT' | 'RH' | 'HSE' | 'Finance' | 'Juridique' | 'Autre';
  dateModification: string;
  taille?: number;
  urlTelechargement: string;
  auteur?: string;
}

/** Types de demande interne */
export type TypeDemande =
  | 'materiel'
  | 'acces'
  | 'it'
  | 'rh'
  | 'administrative'
  | 'autre'
  // Specific demand keys
  | 'renouvellement_compte'
  | 'creation_suppression_compte'
  | 'demande_conges'
  | 'domiciliation_bancaire'
  | 'attestation_travail'
  | 'consommables'
  | 'materiel_informatique'
  | 'intervention'
  | 'fiche_achat'
  | 'ordre_mission'
  | 'autorisation_acces';

export type PrioriteDemande = 'basse' | 'normale' | 'haute' | 'urgente';

/** Statut d'une demande générale */
export type StatutDemande = 'soumis' | 'en_cours' | 'resolu' | 'refuse';

/** Types de congés */
export type TypeConge = 'autre' | 'conge_paye' | 'rtt' | 'maladie' | 'maternite_paternite' | 'sans_solde' | 'evenement_familial';

/** Statuts du workflow de validation des congés */
export type StatutConge = 
  | 'Soumise'
  | 'En attente de validation'
  | 'Accordée'
  | 'Refusée'
  | 'EN_ATTENTE_N1'
  | 'EN_ATTENTE_RH'
  | 'APPROUVEE'
  | 'REFUSEE_N1'
  | 'REFUSEE_RH';

/** Interface spécifique pour une Demande de Congés */
export interface DemandeConge {
  id?: string;
  titre: string;
  typeConge: TypeConge;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif?: string;
  statut: StatutConge;
  demandeurNom: string;
  demandeurEmail: string;
  demandeurLookupId?: number | string;
  managerEmail?: string;
  supHierarchiqueLookupId?: number | string;
  motifRefus?: string;
  dateCreation?: string;
  dateValidationN1?: string;
  dateValidationRH?: string;
  pieceJointeUrl?: string;
}

/** Demande interne (Microsoft List) */
export interface DemandeInterne {
  id?: string;
  titre: string;
  type: TypeDemande;
  description: string;
  priorite: PrioriteDemande;
  statut?: StatutDemande;
  demandeurEmail: string;
  demandeurNom: string;
  dateCreation?: string;
  dateResolution?: string;
  commentaires?: string;
}

/** Événement calendrier */
export interface Evenement {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin?: string;
  lieu?: string;
  description?: string;
}

/** Annonce importante */
export interface Annonce {
  id: string;
  titre: string;
  contenu: string;
  type: 'info' | 'warning' | 'urgent';
  datePublication: string;
  lien?: string;
}

/** Outil M365 pour les raccourcis rapides */
export interface OutilM365 {
  nom: string;
  icone: string;
  url: string;
  couleur?: string;
  categorie?: string;
}

/** Utilisateur connecté (session) */
export interface UtilisateurSession {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  departement?: string;
  poste?: string;
}

/** Compteurs de demandes par type */
export interface CompteursDemandesParType {
  materiel: number;
  acces: number;
  it: number;
  rh: number;
}
