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
export type TypeDemande = 'materiel' | 'acces' | 'it' | 'rh';

/** Priorité d'une demande */
export type PrioriteDemande = 'basse' | 'normale' | 'haute' | 'urgente';

/** Statut d'une demande */
export type StatutDemande = 'en_attente' | 'en_cours' | 'resolu' | 'rejete';

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
