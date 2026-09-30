import type {ActualitesResponse} from '@/types';



export async function getActualites(
  top?: number
): Promise<ActualitesResponse> {
  const url = top
    ? `/api/actualites?top=${top}`
    : '/api/actualites';

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      'Impossible de récupérer les actualités.'
    );
  }

  return response.json();
}