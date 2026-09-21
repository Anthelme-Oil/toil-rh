import { 
  Clock, 
  PlusCircle, 
  CheckSquare, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Megaphone,
  Home,
  Info,
  Wrench,
  FileQuestion,
  CalendarCheck,
  Users,
  FolderKanban,
  ListFilter,
  Layers,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { NavItem, NavLink } from '@/types/navigation';

// ═══════════════════════════════════════════════════════════════
// 1. LIENS DE NAVIGATION HORIZONTALE (INTRA TOPBAR)
// ═══════════════════════════════════════════════════════════════

export const BASE_NAV_LINKS: readonly NavLink[] = [
  { label: 'Accueil', href: '/', icon: Home, isPublicForUser: true,isEspaceLink:false },
  { label: 'Informations & actualités', href: '/informations', icon: Info, isPublicForUser: true },
  { label: 'Outils', href: '/outils', icon: Wrench, isPublicForUser: true },
  { label: 'Communautés', href: '/communautes', icon: Users, isPublicForUser: true },
  { label: 'Reservations', href: '/reservations', icon: CalendarCheck, isPublicForUser: true },
  { label: 'Mes Demandes', href: '/demandes/suivi', icon: FileQuestion, isPublicForUser: true,isEspaceLink:true },
] as const;

export const DYNAMIC_NAV_LINKS: NavLink[] = [
  // { 
  //   label: 'Validation', 
  //   href: '/demandes/validation',
  //   icon: CheckSquare,
  //   hasAccess: (perms) => perms.isManager || perms.isRH || perms.isDRH || perms.isRHPrint || perms.isAdmin 
  // },
  // { 
  //   label: 'Publication', 
  //   href: '/publications',
  //   icon: Megaphone,
  //   hasAccess: (perms) => perms.isAdmin || perms.isCom 
  // },
  // { 
  //   label: 'Admin', 
  //   href: '/admin/roles',
  //   icon: ShieldCheck,
  //   hasAccess: (perms) => perms.isAdmin 
  // },
];

// ═══════════════════════════════════════════════════════════════
// 2. ITEMS DU MENU LATÉRAL (SIDEBAR DASHBOARD)
// ═══════════════════════════════════════════════════════════════

export const NAV_ITEMS: NavItem[] = [
  // ── ESPACE DEMANDES (Sous-menus pour tous et par rôles) ──
  {
    title: 'Gestion des Demandes',
    href: '/demandes',
    icon: FolderKanban,
    isPublicForUser: true,
    hasSub: true,
    subItems: [
      // {
      //   title: 'Mes Demandes',
      //   href: '/demandes',
      //   icon: FileQuestion,
      //   isPublicForUser: true,
      // },
      {
        title: 'Suivi des Demandes',
        href: '/demandes/suivi',
        icon: ListFilter,
        isPublicForUser: true,
      },
      {
        title: 'Catalogue des Demandes',
        href: '/demandes/catalogue',
        icon: Layers,
        isPublicForUser: true,
      },
      {
        title: 'Validations N+1 / Manager',
        href: '/demandes/validation',
        icon: CheckCircle2,
        hasAccess: (perms) => perms.isManager || perms.isAdmin,
      },
      {
        title: 'Validations DRH',
        href: '/demandes/validation-drh',
        icon: UserCheck,
        hasAccess: (perms) => perms.isDRH || perms.isAdmin,
      },
    ],
  },

  // ── ESPACE TRAITEMENT & EXÉCUTION ──
  {
    title: 'Traitement RH',
    href: '/execution/rh',
    icon: FileText,
    hasAccess: (perms) => perms.isRH || perms.isDRH || perms.isRHPrint || perms.isAdmin,
  },
  {
    title: 'Traitement IT',
    href: '/execution/it',
    icon: Cpu,
    hasAccess: (perms) => perms.isRoomManager || perms.isAdmin,
  },

  // ── COMMUNICATION & PUBLICATIONS ──
  {
    title: 'Publications',
    href: '/publications',
    icon: Megaphone,
    hasAccess: (perms) => perms.isCom || perms.isAdmin,
  },

  // ── ADMINISTRATION ET RÔLES ──
  {
    title: 'Gestionnaire & attributions',
    // href: '/admin/roles',
    href: '/admin/parametres',
    icon: ShieldCheck,
    
    hasAccess: (perms) => perms.isAdmin,
  },
];