

import {
  addCommentToGreffe,
  createGreffeInstance,
  deleteCommentFromGreffe,
  getEntitiesWithInteractions,
  getGreffeByRefer,
  toggleUserReaction,
} from './repository';

import {
  AddCommentPayload,
  ChannelType,
  CreateGreffePayload,
  FormattedGreffeData,
  ToggleReactionPayload,
} from './types';


/**
 * Initialise une greffe pour une entité (Média, Article, etc.)
 */
export async function initGreffeService(
  payload: CreateGreffePayload,
): Promise<FormattedGreffeData> {
  const referId = String(payload.referId).trim();

  if (!referId) {
    throw new Error("L'identifiant d'élément référencé est invalide.");
  }

  return createGreffeInstance({
    referId,
    typeRefer: payload.typeRefer,
  });
}

/**
 * Récupère les interactions d'une entité
 */
export async function getGreffeService(
  referId: string | number,
  typeRefer: ChannelType,
): Promise<FormattedGreffeData | null> {
  const normalizedId = String(referId).trim();

  if (!normalizedId) {
    return null;
  }

  return getGreffeByRefer(normalizedId, typeRefer);
}

/**
 * Traite l'ajout d'un commentaire
 */
export async function addCommentService(
  payload: AddCommentPayload,
): Promise<FormattedGreffeData | null> {
  if (!payload.text || !payload.text.trim()) {
    throw new Error('Le contenu du commentaire ne peut pas être vide.');
  }

  if (!payload.authorName || !payload.authorName.trim()) {
    throw new Error("Le nom de l'auteur est requis.");
  }

  return addCommentToGreffe(payload);
}

/**
 * Traite la suppression d'un commentaire
 */
export async function deleteCommentService(
  commentId: string,
): Promise<void> {
  if (!commentId || !commentId.trim()) {
    throw new Error('Identifiant de commentaire invalide.');
  }

  await deleteCommentFromGreffe(commentId);
}

/**
 * Traite le basculement (toggle) d'une réaction LIKE/DISLIKE
 */
export async function toggleReactionService(
  payload: ToggleReactionPayload,
): Promise<FormattedGreffeData | null> {
  if (!payload.authorEmail || !payload.authorEmail.trim()) {
    throw new Error("L'adresse email est obligatoire pour enregistrer votre réaction.");
  }

  if (!payload.authorName || !payload.authorName.trim()) {
    throw new Error("Le nom de l'auteur est requis.");
  }

  return toggleUserReaction(payload);
}

export async function getEntitiesService(type?:ChannelType){

    return await getEntitiesWithInteractions(type);

}