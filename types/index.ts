// ═══════════════════════════════════════════════════════════════
// T-OIL / COMPEL STSL — TypeScript Interfaces & Types
// ═══════════════════════════════════════════════════════════════

/** Actualité SharePoint */

import { WorkflowStatus,WorkflowType ,workflowDefinitions} from "@/lib/workflows/engine";
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

/** Types de congés et d'absences */
export type TypeConge = 'conge' | 'autre' | 'conge_paye' | 'maladie' | 'maternite_paternite' | 'sans_solde' | 'evenement_familial' | string;


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

export interface PieceJointe {
  name: string;
  contentBase64?: string;
  url?: string;
  sizeFormatted?: string;
}

/** Interface spécifique pour une Demande de Congés */
export interface DemandeConge {
  id?: string;
  titre: string;
  typeConge: TypeConge;
  societe?: 'T-OIL' | 'STSL' | string;
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
  piecesJointes?: PieceJointe[];
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

/** Utilisateur de l'annuaire Microsoft 365 / Entra ID */
export interface UserDirectoryItem {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
}

/** Compteurs de demandes par type */
export interface CompteursDemandesParType {
  materiel: number;
  acces: number;
  it: number;
  rh: number;
}

/** Document rattaché à un module Onboarding */
export interface OnboardingDocument {
  id: string;
  titre: string;
  url: string;
  format: 'pdf' | 'doc' | 'xls';
  tailleFormatted?: string;
}

/** Module d'Onboarding / Vidéo de présentation */
export interface OnboardingModule {
  id: string;
  code: string;
  titre: string;
  description: string;
  categorie: 'culture' | 'securite' | 'it' | 'rh';
  videoUrl?: string;
  thumbnailUrl: string;
  dureeMinutes: number;
  ordre: number;
  estObligatoire: boolean;
  documentsAssocies?: OnboardingDocument[];
}

/** Suivi individuel de progression d'Onboarding */
export interface UserOnboardingProgress {
  userEmail: string;
  modulesCompletes: string[];
  pourcentageGlobal: number;
  dernierAcces?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface RequestItem {
  // --- Champs originaux de la table Demande Prisma ---
  id: string;
  titre: string;
  typeDemande: string;
  statut: string;
  utilisateurId: string | null;
  emailDemandeur: string;
  // companyName:string;
  nomDemandeur: string;
  targetUserId: string | null;
  targetUserName: string | null;
  emailManager: string | null;
  statutN1: string;
  dateValidationN1: string | null; // ou Date selon la sérialisation API
  commentaireN1: string | null;
  statutRH: string;
  dateValidationRH: string | null;
  commentaireRH: string | null;
  statutIT: string;
  dateValidationIT: string | null;
  commentaireIT: string | null;
  historiqueValidations: Array<{
    stepId: string;
    valideur?: string;
    dateValidation?: string;
    commentaire?: string;
    [key: string]: any;
  }> | null;
  dateDebut: string | null;
  dateFin: string | null;
  nombreJours: number | null;
  typeConge: string | null;
  motif: string | null;
  pieceJointe: string | null;
  donneesFormulaire: any | null;
  creeLe: string;
  misAJourLe: string;

  // --- Champs calculés / enrichis pour le workflow ---
  reference: string;
  type: WorkflowType;
  statutActuel: WorkflowStatus;
  dateCreation: string;
  nextStep?: {
    id: string;
    nom: string;
    role: string;
    statusMatcher: WorkflowStatus;
  } | null;
  estTerminee?: boolean;
  estRejetee?: boolean;
  historique?: Array<{
    stepId: string;
    valideur?: string;
    dateValidation?: string;
    commentaire?: string;
  }>;
}

// export type SequenceType = {
//   id: string;
//   nom: string;
//   role: string;
//   statusMatcher: string;
// } ;

export type SequenceType = {
  id: string;
  nom: string;
  role: string;
  statusMatcher: WorkflowStatus;
};
export type WorkflowKey = keyof typeof workflowDefinitions;

export type FilterKey = 'pending' | 'validated' | 'refused' | 'all';


export type MailRecipient =
    | string
    | string[];

export interface SendMailOptions<TProps = unknown> {
    to: MailRecipient;
    cc?: MailRecipient;
    bcc?: MailRecipient;

    subject: string;

    template: React.ComponentType<TProps>;

    props: TProps;

    replyTo?: string;
}


// types/index.ts

export type ExceptionalAbsenceType =
  | "PERMISSION"
  | "CONGES_ANNUELS"
  | "DECES_CONJOINT_ASCENDANT_DESCENDANT"
  | "DECES_FRERE_SOEUR"
  | "DECES_BEAU_PERE_BELLE_MERE"
  | "MARIAGE_ENFANT"
  | "MARIAGE_FRERE_SOEUR"
  | "MARIAGE_TRAVAILLEUR"
  | "NAISSANCE_FOYER"
  | "BAPTEME_ENFANT"
  | "DEMENAGEMENT";



  export const INCLUDES_WEEKEND_TYPES: ExceptionalAbsenceType[] = [
  "CONGES_ANNUELS",
  // Ajoutez d'autres clés ici si nécessaire
];

export const EXCEPTIONAL_ABSENCE_TYPES: Record<
  ExceptionalAbsenceType,
  {
    label: string;
    duration?: number;
  }
> = {
  PERMISSION: {
    label: "Permission",
    // duration: 5,
  },
   CONGES_ANNUELS: {
    label: "Congés annuels",
    // duration: 5,
  },
  DECES_CONJOINT_ASCENDANT_DESCENDANT: {
    label: "Décès d'un conjoint, d'un ascendant ou d'un descendant en ligne directe",
    duration: 5,
  },

  DECES_FRERE_SOEUR: {
    label: "Décès d'un frère ou d'une sœur",
    duration: 3,
  },

  DECES_BEAU_PERE_BELLE_MERE: {
    label: "Décès d'un beau-père ou d'une belle-mère",
    duration: 3,
  },

  MARIAGE_ENFANT: {
    label: "Mariage d'un enfant",
    duration: 2,
  },

  MARIAGE_FRERE_SOEUR: {
    label: "Mariage d'un frère ou d'une sœur",
    duration: 1,
  },

  MARIAGE_TRAVAILLEUR: {
    label: "Mariage du travailleur",
    duration: 3,
  },

  NAISSANCE_FOYER: {
    label: "Naissance au foyer",
    duration: 2,
  },

  BAPTEME_ENFANT: {
    label: "Baptême de l'enfant du travailleur",
    duration: 1,
  },

  DEMENAGEMENT: {
    label: "Déménagement",
    duration: 2,
  },
};


 export interface DayOff {
  id: number
  date: string
  name: string
  description: string | null
  isRecurring: boolean
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface News {
  actualite: Actualite;
  videos: Evenement;
}

export interface ActualitesResponse {
  actualites: Actualite[];
  videos: Array<{
    id: string;
    titre: string;
    categorie: string;
    duree: string;
    date: string;
    thumbnailUrl: string;
    videoUrl: string;
    description: string;
  }>;
  evenements: Evenement[];
}

export type NewsColor = "peach" | "lavender" | "mint";



/**
 * Départements disponibles dans la médiathèque.
 *
 * Les valeurs sont volontairement courtes :
 * IT, FINANCE, COMMERCIAL, etc.
 */
export const DOCUMENT_DEPARTMENTS = [
  'IT',
  'COMMERCIAL',
  'FINANCE',
  'OPERATION',
  'RH',
  'DIRECTION',
  'JURIDIQUE',
] as const;

export type DocumentDepartment =
  (typeof DOCUMENT_DEPARTMENTS)[number];


/**
 * Formats de documents pris en charge.
 */
export const DOCUMENT_FORMATS = [
  'PDF',
  'DOC',
  'DOCX',
  'XLS',
  'XLSX',
  'PPT',
  'PPTX',
  'TXT',
  'CSV',
  'IMAGE',
  'VIDEO',
  'OTHER',
] as const;

export type DocumentFormat =
  (typeof DOCUMENT_FORMATS)[number];


/**
 * Catégories fonctionnelles des documents.
 *
 * Elles permettent de mieux organiser la médiathèque
 * à l'intérieur d'un département.
 */
export const DOCUMENT_CATEGORIES = [
  'PROCEDURE',
  'GUIDE',
  'FORMULAIRE',
  'POLITIQUE',
  'NOTE',
  'RAPPORT',
  'MANUEL',
  'INSTRUCTION',
  'REGLEMENT',
  'PRESENTATION',
  'MODELE',
  'REFERENCE',
  'AUTRE',
] as const;

export type DocumentCategory =
  (typeof DOCUMENT_CATEGORIES)[number];


/**
 * Statut du document.
 */
export const DOCUMENT_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export type DocumentStatus =
  (typeof DOCUMENT_STATUSES)[number];


/**
 * Niveau de visibilité du document.
 *
 * PUBLIC :
 * accessible à tous les utilisateurs de l'intranet.
 *
 * DEPARTMENT :
 * accessible uniquement aux utilisateurs du département concerné.
 *
 * RESTRICTED :
 * accès limité selon les droits/permissions.
 */
export const DOCUMENT_VISIBILITIES = [
  'PUBLIC',
  'DEPARTMENT',
  'RESTRICTED',
] as const;

export type DocumentVisibility =
  (typeof DOCUMENT_VISIBILITIES)[number];


/**
 * Informations sur l'auteur / responsable du document.
 */
export interface MediaDocumentAuthor {
  id?: string;
  name: string;
  email?: string;
};


/**
 * Statistiques du document.
 */
export interface MediaDocumentStats {
  views: number;
  downloads: number;
};


/**
 * Document de la médiathèque.
 */
export interface MediaDocument {
  /**
   * Identifiant unique du document.
   */
  id: string;

  /**
   * Titre principal affiché dans la médiathèque.
   */
  title: string;

  /**
   * Description générale du document.
   */
  description?: string;

  /**
   * Objectif du document.
   *
   * Permet de comprendre rapidement pourquoi
   * le document existe et à quoi il sert.
   */
  objective?: string;

  /**
   * Département auquel appartient le document.
   *
   * Exemple : IT, FINANCE, COMMERCIAL...
   */
  department: DocumentDepartment;

  /**
   * Catégorie fonctionnelle du document.
   *
   * Exemple : PROCEDURE, GUIDE, FORMULAIRE...
   */
  category?: DocumentCategory;

  /**
   * Format logique du fichier.
   *
   * Exemple : PDF, DOCX, XLSX...
   */
  format: DocumentFormat;

  /**
   * Extension réelle du fichier.
   *
   * Exemple : .pdf, .docx, .xlsx
   */
  extension: string;

  /**
   * Nom physique du fichier.
   */
  fileName: string;

  /**
   * URL permettant de consulter/télécharger
   * le fichier.
   */
  fileUrl: string;

  /**
   * Taille du fichier en octets.
   */
  fileSize?: number;

  /**
   * Version du document.
   *
   * Exemple : "1.0", "2.1", "2026.1"
   */
  version?: string;

  /**
   * Mots-clés permettant d'améliorer la recherche.
   *
   * Exemple :
   * ["vpn", "securite", "connexion", "informatique"]
   */
  tags?: string[];

  /**
   * Auteur ou responsable du document.
   */
  author?: MediaDocumentAuthor;

  /**
   * Nom de la personne ayant publié le document.
   */
  publishedBy?: MediaDocumentAuthor;

  /**
   * Date de publication.
   */
  publishedAt?: string | Date;

  /**
   * Date de dernière modification.
   */
  updatedAt: string | Date;

  /**
   * Date de création du document.
   */
  createdAt: string | Date;

  /**
   * Nombre total de consultations.
   */
  views: number;

  /**
   * Nombre total de téléchargements.
   */
  downloads: number;

  /**
   * Statut actuel du document.
   */
  status: DocumentStatus;

  /**
   * Indique si le document est actuellement publié.
   *
   * Peut être conservé pour faciliter certains traitements
   * ou requêtes rapides.
   */
  isPublished: boolean;

  /**
   * Niveau de visibilité du document.
   */
  visibility: DocumentVisibility;

  /**
   * Date à laquelle le document doit éventuellement
   * être archivé.
   */
  archivedAt?: string | Date;

  /**
   * Identifiant du document ayant remplacé celui-ci,
   * lorsqu'une nouvelle version existe.
   */
  replacedById?: string;

  /**
   * Identifiant du document précédent lorsque celui-ci
   * constitue une nouvelle version.
   */
  previousVersionId?: string;
}

export interface MediaDocumentFilters {
  search?: string;

  department?: DocumentDepartment | 'ALL';

  category?: DocumentCategory | 'ALL';

  format?: DocumentFormat | 'ALL';

  status?: DocumentStatus | 'ALL';

  visibility?: DocumentVisibility | 'ALL';

  tag?: string;

  dateFrom?: string | Date;

  dateTo?: string | Date;
}


export type MediaDocumentSort =
  | 'LATEST'
  | 'OLDEST'
  | 'MOST_VIEWED'
  | 'MOST_DOWNLOADED'
  | 'TITLE_ASC'
  | 'TITLE_DESC';


export interface MediaDocumentQuery {
  page?: number;

  limit?: number;

  filters?: MediaDocumentFilters;

  sort?: MediaDocumentSort;
}

export interface MediaDocumentsResponse {
  documents: MediaDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
