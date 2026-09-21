// ═══════════════════════════════════════════════════════════════
// Configuration des Layouts par Route
// ═══════════════════════════════════════════════════════════════

/**
 * Liste des routes statiques qui utilisent SingleLayout (sans Sidebar).
 * Toutes les autres routes utiliseront MainLayout (avec Sidebar).
 */
export const SINGLE_LAYOUT_ROUTES: string[] = [
  '/',
  '/informations',
  '/outils',
  '/reservations',
  '/communautes',
  '/contact',
  '/aide',
];

/**
 * Helper pour vérifier si la route actuelle doit utiliser SingleLayout
 */
export function isSingleLayoutRoute(pathname: string): boolean {
  return SINGLE_LAYOUT_ROUTES.includes(pathname);
}