export function removeFirstWord(value: string): string {
  return value.trim().split(/\s+/).slice(1).join(' ');
}

// Détermine l'URL de base selon qu'on est sur le serveur ou sur le client
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // Côté navigateur : chemin relatif OK
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL; // Variable d'environnement en prod
  return `http://localhost:${process.env.PORT || 3000}`; // Fallback local en dev
};

// const BASE_URL = getBaseUrl();
// const API_URL = `${BASE_URL}/api/requests/mediatheque`;