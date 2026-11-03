import {
  UserCheck,
  UserPlus,
  Calendar,
  Building2,
  FileCheck2,
  Box,
  Monitor,
  Wrench,
  ShoppingCart,
  Briefcase,
  ShieldAlert,
  LucideIcon,
} from 'lucide-react';

export interface RequestItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  items: RequestItem[];
}

export const CATALOG_CATEGORIES: Category[] = [
  {
    id: 'admin',
    title: 'Demandes Administratives',
    description: 'Gestion des comptes, RH, congés et attestations',
    items: [
      {
        id: 'ABSENCE',
        title: "Demande d'absence",
        description: 'Soumission des dates de congés payés, permissions ou absences',
        icon: Calendar,
        badge: 'RH',
      },
      {
        id: 'DOMICILIATION',
        title: 'Domiciliation Bancaire',
        description: "Mise à jour ou attestation de Relevé d'Identité Bancaire (RIB)",
        icon: Building2,
      },
      {
        id: 'ATTESTATION',
        title: 'Attestation de travail',
        description: 'Demande de certificat de travail (T-OIL, STSL, COMPEL)',
        icon: FileCheck2,
      },
      {
        id: 'ACCOUNT_RENEWAL',
        title: 'Renouvellement de compte IT',
        description: "Demande de prolongation ou réactivation d'accès utilisateur",
        icon: UserCheck,
      },
      {
        id: 'ACCOUNT_MANAGEMENT',
        title: 'Création ou suppression de Compte IT',
        description: 'Ouverture pour nouvel arrivant ou clôture de compte',
        icon: UserPlus,
      },
    ],
  },
  {
    id: 'it',
    title: 'Demandes IT',
    description: 'Consommables, matériel et support technique',
    items: [
      {
        id: 'SUPPLIES',
        title: 'Consommables',
        description: "Cartouches d'encre, papier, toners et fournitures bureau",
        icon: Box,
      },
      {
        id: 'HARDWARE',
        title: 'Matériel informatique',
        description: 'Ordinateurs, écrans, souris, claviers et accessoires',
        icon: Monitor,
      },
      {
        id: 'SOFTWARE',
        title: 'Maintenance logicielle / Installation',
        description: 'Installation de logiciels, mises à jour, correctifs',
        icon: Wrench,
      },
      {
        id: 'SPECIAL_BUY',
        title: 'Achat de matériel spécifique',
        description: "Demande d'acquisition d'équipements non standards",
        icon: ShoppingCart,
      },
    ],
  },
  {
    id: 'other',
    title: 'Autres Services',
    description: 'Besoins métiers, accès et autorisations',
    items: [
      {
        id: 'BUSINESS_NEED',
        title: 'Besoin Métier / Évolution',
        description: 'Demande de nouvelles fonctionnalités ou droits applicatifs',
        icon: Briefcase,
      },
      {
        id: 'SITE_ACCESS',
        title: "Autorisation d'accès au site",
        description: 'Badges visiteurs, accès aux zones sécurisées ou dépôts',
        icon: ShieldAlert,
      },
    ],
  },
];