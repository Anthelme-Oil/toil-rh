import {
  ApiResponse,
  ChannelType,
  FormattedGreffeData,
  ReactionType,
  EntityWithGreffe,
  CommunityEntity
} from '@/lib/communautes/types';

const API_PATH = '/api/requests/com';

/**
 * Récupère les interactions complètes d'un élément
 */
export async function fetchGreffeInteractions(
  referId: string | number,
  typeRefer: ChannelType,
): Promise<FormattedGreffeData | null> {
  const response = await fetch(
    `${API_PATH}?referId=${encodeURIComponent(referId)}&typeRefer=${encodeURIComponent(typeRefer)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  const result: ApiResponse<FormattedGreffeData | null> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Impossible de récupérer les interactions.');
  }

  return result.data ?? null;
}


export async function fetchCommunityFeed(
  typeRefer?: ChannelType,
): Promise<EntityWithGreffe<CommunityEntity>[]> {
  const queryParam = typeRefer ? `?typeRefer=${encodeURIComponent(typeRefer)}` : '';
  const response = await fetch(`${API_PATH}${queryParam}`, {
    method: 'GET',
    cache: 'no-store',
  });

  const result: ApiResponse<EntityWithGreffe<CommunityEntity>[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Impossible de récupérer le flux de la communauté.');
  }

  return result.data ?? [];
}

/**
 * Initialise la greffe lors de la création d'une entité (ex: Média)
 */
export async function initGreffe(
  referId: string | number,
  typeRefer: ChannelType,
): Promise<FormattedGreffeData> {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'init', referId, typeRefer }),
  });

  const result: ApiResponse<FormattedGreffeData> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Impossible d\'initialiser la greffe.');
  }

  return result.data;
}

/**
 * Envoie un nouveau commentaire
 */
export async function sendComment(payload: {
  referId: string | number;
  typeRefer: ChannelType;
  authorName: string;
  authorEmail?: string;
  text: string;
}): Promise<FormattedGreffeData> {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'comment', ...payload }),
  });

  const result: ApiResponse<FormattedGreffeData> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Impossible d\'ajouter le commentaire.');
  }

  return result.data;
}

/**
 * Supprime un commentaire existant
 */
export async function removeComment(commentId: string): Promise<void> {
  const response = await fetch(`${API_PATH}?commentId=${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  });

  const result: ApiResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Impossible de supprimer le commentaire.');
  }
}

/**
 * Bascule une réaction (LIKE / DISLIKE)
 */
export async function toggleReaction(payload: {
  referId: string | number;
  typeRefer: ChannelType;
  reactionType: ReactionType;
  authorName: string;
  authorEmail: string;
}): Promise<FormattedGreffeData> {
  const response = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reaction', ...payload }),
  });

  const result: ApiResponse<FormattedGreffeData> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Impossible de mettre à jour votre réaction.');
  }

  return result.data;
}