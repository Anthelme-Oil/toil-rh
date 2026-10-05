export const SINGLE_LAYOUT_ROUTES: string[] = [
  '/',
  '/informations',
  '/outils',
  '/reservations',
  '/formations',
  '/communautes',
  '/contact',
  '/aide',
  '/mediatheque',
  '/actualites',
  '/videos',
  '/mediatheque/[id]/consultation', // ou '/mediatheque/{id}/consultation'
];

export function isSingleLayoutRoute(pathname: string): boolean {
  return SINGLE_LAYOUT_ROUTES.some((route) => {
    // Transforme [id] ou {id} en wildcard regex ([^/]+)
    const regexPattern = route
      .replace(/\[[^\]]+\]/g, '[^/]+')
      .replace(/\{[^}]+\}/g, '[^/]+');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });
}