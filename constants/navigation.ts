import { NavLink } from '@/types';

export const BASE_NAV_LINKS: readonly NavLink[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Informations', href: '/informations' },
  { label: 'Outils', href: '/outils' },
  { label: 'Demandes & Services', href: '/demandes' },
  { label: 'Réservations', href: '/reservations' },
  { label: 'Formations', href: '/formations' },
  { label: 'Communautés', href: '/communautes' },
] as const;