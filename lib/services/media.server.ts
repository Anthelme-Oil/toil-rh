// lib/services/media.server.ts
import { cookies } from 'next/headers';
import { getBaseUrl } from '@/utils/utils';
import type { MediaDocument } from '@/types';

const API_PATH = '/api/requests/mediatheque';

import { getMediaDocument } from '@/lib/mediatheque/service';



async function serverFetch(endpoint: string): Promise<Response> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const baseUrl = getBaseUrl();

  return fetch(`${baseUrl}${API_PATH}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader, // Transmet automatiquement la session
    },
    cache: 'no-store',
  });
}

// export async function getMediaById(id: string | number): Promise<MediaDocument | null> {
//   try {
//     const response = await serverFetch(`/${id}`);

//     if (!response.ok) {
//       return null;
//     }

//     const data = await response.json();
//     return data.document ?? null;
//   } catch (error) {
//     console.error('Erreur getMediaById (Server):', error);
//     return null;
//   }
// }




export async function getMediaById(
  id: string | number
): Promise<MediaDocument | null> {
  try {
    const document = await getMediaDocument(Number(id));

    return document ?? null;
  } catch (error) {
    console.error('Erreur getMediaById (Server):', error);
    return null;
  }
}