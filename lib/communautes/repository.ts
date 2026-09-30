
import { execute, query } from '@/lib/db';
import crypto from 'crypto';



import {
  AddCommentPayload,
  ChannelType,
  CommentModel,
  CreateGreffePayload,

  FormattedGreffeData,
  InteractionGreffeModel,
  ReactionModel,
  ToggleReactionPayload,
  CommunityEntity,
  EntityWithGreffe,
} from './types';



import { getMediaDocuments as  getAllMedia } from '@/lib/mediatheque/service'; // Adaptez l'import de votre service/repo Media


/**
 * Génère un identifiant pour les commentaires et les réactions.
 *
 * L'ID de InteractionGreffe est généré automatiquement
 * par la base de données avec cuid().
 */
function generateEntityId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

 function generateUniqueId(): string {
  return crypto.randomUUID();
}

/**
 * Formate une greffe avec ses commentaires et ses réactions
 * pour le frontend.
 */
export function formatGreffeData(
  greffe: InteractionGreffeModel,
  comments: CommentModel[],
  reactions: ReactionModel[],
): FormattedGreffeData {
  const likes = reactions.filter(
    (reaction) => reaction.type === 'LIKE',
  );

  const dislikes = reactions.filter(
    (reaction) => reaction.type === 'DISLIKE',
  );

  return {
    id: greffe.id,
    referId: greffe.referId,
    typeRefer: greffe.typeRefer,
     createdAt:greffe.createdAt,
     updatedAt:greffe.updatedAt,
    likesCount: likes.length,
    dislikesCount: dislikes.length,

    likesAuthors: likes.map((reaction) => ({
      name: reaction.authorName,
      email: reaction.authorEmail,
      date: reaction.createdAt,
    })),

    dislikesAuthors: dislikes.map((reaction) => ({
      name: reaction.authorName,
      email: reaction.authorEmail,
      date: reaction.createdAt,
    })),

    comments,
  };
}

/**
 * Récupère une greffe à partir du referId et du type.
 *
 * Une seule greffe peut exister pour le couple :
 * referId + typeRefer
 *
 * grâce à :
 * @@unique([referId, typeRefer])
 */
export async function getGreffeByRefer(
  referId: string | number,
  typeRefer: ChannelType,
): Promise<FormattedGreffeData | null> {
  const normalizedReferId = String(referId).trim();

  if (!normalizedReferId) {
    return null;
  }

  /**
   * IMPORTANT :
   *
   * query<T>() retourne Promise<T[]>.
   *
   * On utilise donc :
   * query<InteractionGreffeModel>()
   *
   * et NON :
   * query<InteractionGreffeModel[]>()
   */
  const greffes = await query<InteractionGreffeModel>(
    `
      SELECT
        id,
        referId,
        typeRefer,
        createdAt,
        updatedAt
      FROM interactiongreffe
      WHERE referId = ?
        AND typeRefer = ?
      LIMIT 1
    `,
    [normalizedReferId, typeRefer],
  );

  if (greffes.length === 0) {
    return null;
  }

  const greffe = greffes[0];

  /**
   * Récupération des commentaires.
   *
   * interactionGreffeId référence InteractionGreffe.id.
   */
  const comments = await query<CommentModel>(
    `
      SELECT
        id,
        interactionGreffeId,
        authorName,
        authorEmail,
        text,
        createdAt
      FROM comment
      WHERE interactionGreffeId = ?
      ORDER BY createdAt DESC
    `,
    [greffe.id],
  );

  /**
   * Récupération des réactions.
   */
  const reactions = await query<ReactionModel>(
    `
      SELECT
        id,
        interactionGreffeId,
        type,
        authorName,
        authorEmail,
        createdAt
      FROM reaction
      WHERE interactionGreffeId = ?
    `,
    [greffe.id],
  );

  return formatGreffeData(
    greffe,
    comments,
    reactions,
  );
}

/**
 * Crée une greffe si elle n'existe pas encore.
 *
 * L'ID de InteractionGreffe est généré automatiquement
 * par la base de données grâce à @default(cuid()).
 */
export async function createGreffeInstance(
  payload: CreateGreffePayload,
): Promise<FormattedGreffeData> {
  const referId = String(payload.referId).trim();

  if (!referId) {
    throw new Error(
      "L'identifiant de l'entité référencée est requis.",
    );
  }

  /**
   * Vérifie si la greffe existe déjà.
   */
  const existing = await getGreffeByRefer(
    referId,
    payload.typeRefer,
  );

  if (existing) {
    return existing;
  }

  /**
   * Création de la greffe.
   *
   * On ne fournit PAS id :
   * Prisma prévoit @default(cuid()).
   * 
   */
  const grefId= generateUniqueId()
  await execute(
    `
      INSERT INTO interactiongreffe (
        id,
        referId,
        typeRefer
      )
      VALUES (?,?, ?)
    `,
    [grefId, referId, payload.typeRefer],
  );

  /**
   * On récupère la greffe créée afin d'obtenir
   * son véritable id.
   */
  const created = await getGreffeByRefer(
    referId,
    payload.typeRefer,
  );

  if (!created) {
    throw new Error(
      "La greffe a été créée mais n'a pas pu être récupérée.",
    );
  }

  return created;
}

/**
 * Ajoute un commentaire à une greffe.
 */
export async function addCommentToGreffe(
  payload: AddCommentPayload,
): Promise<FormattedGreffeData | null> {
  const text = payload.text.trim();

  if (!text) {
    throw new Error(
      "Le commentaire ne peut pas être vide.",
    );
  }

  const greffe = await createGreffeInstance({
    referId: payload.referId,
    typeRefer: payload.typeRefer,
  });

  const commentId = generateEntityId();

  await execute(
    `
      INSERT INTO comment (
        id,
        interactionGreffeId,
        authorName,
        authorEmail,
        text
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      commentId,
      greffe.id,
      payload.authorName,
      payload.authorEmail || null,
      text,
    ],
  );

  return getGreffeByRefer(
    payload.referId,
    payload.typeRefer,
  );
}

/**
 * Supprime un commentaire.
 */
export async function deleteCommentFromGreffe(
  commentId: string,
): Promise<void> {
  const id = String(commentId).trim();

  if (!id) {
    throw new Error(
      "L'identifiant du commentaire est requis.",
    );
  }

  await execute(
    `
      DELETE FROM comment
      WHERE id = ?
    `,
    [id],
  );
}

/**
 * Gère une réaction LIKE / DISLIKE.
 *
 * - aucune réaction → création
 * - même réaction → suppression
 * - réaction différente → modification
 */
export async function toggleUserReaction(
  payload: ToggleReactionPayload,
): Promise<FormattedGreffeData | null> {
  const authorEmail = payload.authorEmail
    .trim()
    .toLowerCase();

  if (!authorEmail) {
    throw new Error(
      "L'adresse email de l'auteur est requise.",
    );
  }

  const greffe = await createGreffeInstance({
    referId: payload.referId,
    typeRefer: payload.typeRefer,
  });

  /**
   * Recherche de la réaction de l'utilisateur
   * sur cette greffe.
   */
  const existingReactions = await query<ReactionModel>(
    `
      SELECT
        id,
        interactionGreffeId,
        type,
        authorName,
        authorEmail,
        createdAt
      FROM reaction
      WHERE interactionGreffeId = ?
        AND authorEmail = ?
      LIMIT 1
    `,
    [greffe.id, authorEmail],
  );

  if (existingReactions.length > 0) {
    const currentReaction = existingReactions[0];

    /**
     * Même réaction :
     * on la supprime.
     */
    if (currentReaction.type === payload.reactionType) {
      await execute(
        `
          DELETE FROM reaction
          WHERE id = ?
        `,
        [currentReaction.id],
      );
    } else {
      /**
       * Réaction différente :
       * LIKE -> DISLIKE
       * ou
       * DISLIKE -> LIKE
       */
      await execute(
        `
          UPDATE reaction
          SET
            type = ?,
            authorName = ?
          WHERE id = ?
        `,
        [
          payload.reactionType,
          payload.authorName,
          currentReaction.id,
        ],
      );
    }
  } else {
    /**
     * Nouvelle réaction.
     */
    const reactionId = generateEntityId();

    await execute(
      `
        INSERT INTO reaction (
          id,
          interactionGreffeId,
          type,
          authorName,
          authorEmail
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        reactionId,
        greffe.id,
        payload.reactionType,
        payload.authorName,
        authorEmail,
      ],
    );
  }

  /**
   * Retourne la greffe avec son état actualisé.
   */
  return getGreffeByRefer(
    payload.referId,
    payload.typeRefer,
  );
}








// Helper pour générer uniquement l'ID des commentaires et des réactions
// function generateEntityId(): string {
//   return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
// }

// export function formatGreffeData(
//   greffe: InteractionGreffeModel,
//   comments: CommentModel[],
//   reactions: ReactionModel[],
// ): FormattedGreffeData {
//   const likes = reactions.filter((reaction) => reaction.type === 'LIKE');
//   const dislikes = reactions.filter((reaction) => reaction.type === 'DISLIKE');

//   return {
//     id: greffe.id,
//     referId: greffe.referId,
//     typeRefer: greffe.typeRefer,

//     likesCount: likes.length,
//     dislikesCount: dislikes.length,

//     likesAuthors: likes.map((reaction) => ({
//       name: reaction.authorName,
//       email: reaction.authorEmail,
//       date: reaction.createdAt,
//     })),

//     dislikesAuthors: dislikes.map((reaction) => ({
//       name: reaction.authorName,
//       email: reaction.authorEmail,
//       date: reaction.createdAt,
//     })),

//     comments,
//   };
// }

/**
 * 1. Récupère toutes les greffes enregistrées triées par date récente (createdAt DESC)
 */
export async function getAllGreffesInteractions(): Promise<FormattedGreffeData[]> {
  const greffes = await query<InteractionGreffeModel>(
    `SELECT id, referId, typeRefer, createdAt, updatedAt 
     FROM interactiongreffe 
     ORDER BY createdAt DESC`
  );

  if (!greffes || greffes.length === 0) {
    return [];
  }

  const result: FormattedGreffeData[] = [];

  for (const greffe of greffes) {
    const comments = await query<CommentModel>(
      `SELECT id, interactionGreffeId, authorName, authorEmail, text, createdAt 
       FROM comment 
       WHERE interactionGreffeId = ? 
       ORDER BY createdAt DESC`,
      [greffe.id]
    );

    const reactions = await query<ReactionModel>(
      `SELECT id, interactionGreffeId, type, authorName, authorEmail, createdAt 
       FROM reaction 
       WHERE interactionGreffeId = ?`,
      [greffe.id]
    );

    result.push(formatGreffeData(greffe, comments, reactions));
  }

  return result;
}

/**
 * 2. Fonction polyvalente d'assemblage / compactage :
 * Récupère les entités métiers et les associe à leurs interactions de greffe.
 * 
 * - Si `filterType` est omis (undefined/null), elle retourne tout le flux.
 * - Si `filterType` est fourni (ex: 'MEDIA'), elle retourne uniquement les éléments de ce type.
 */

export async function getEntitiesWithInteractions(
  filterType?: ChannelType,
): Promise<EntityWithGreffe<CommunityEntity>[]> {
  /**
   * 1. Récupération des greffes existantes.
   *
   * Une greffe correspond toujours à une entité réelle
   * via le couple :
   *
   * referId + typeRefer
   */
  const allGreffes = await getAllGreffesInteractions();

  /**
   * 2. Indexation des greffes.
   *
   * Permet de retrouver rapidement la greffe
   * correspondant à une entité.
   */
  const greffeMap = new Map<string, FormattedGreffeData>();

  for (const greffe of allGreffes) {
    const key = `${String(greffe.referId)}_${greffe.typeRefer}`;

    greffeMap.set(key, greffe);
  }

  /**
   * 3. Liste finale des entités.
   */
  const combinedEntities: EntityWithGreffe<CommunityEntity>[] = [];

  /**
   * Fonction utilitaire permettant d'ajouter
   * une entité avec sa greffe éventuelle.
   *
   * Une entité peut ne pas encore avoir de greffe.
   *
   * Dans ce cas :
   * interactions = null
   */

const addEntity = <T extends CommunityEntity>(
  entity: T,
  typeRefer: ChannelType,
): void => {
  const entityId = String(entity.id);

  const key = `${entityId}_${typeRefer}`;

  const greffe = greffeMap.get(key);

  // L'entité n'a aucune interaction :
  // on ne l'ajoute pas au résultat.
  if (!greffe) {
    return;
  }

  combinedEntities.push({
    ...entity,
    typeRefer,
    createdAt: greffe.createdAt,
    updatedAt: greffe.updatedAt,
    interactions: greffe,
  } as EntityWithGreffe<CommunityEntity>);
};


  /**
   * ------------------------------------------------------------------
   * MEDIA
   * ------------------------------------------------------------------
   */
  if (!filterType || filterType === 'MEDIA') {
    try {
      const medias = await getAllMedia();

      const documents = medias?.documents ?? [];

      for (const media of documents) {
        addEntity(media, 'MEDIA');
      }
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des médias :',
        error,
      );
    }
  }

  /**
   * ------------------------------------------------------------------
   * ARTICLE
   * ------------------------------------------------------------------
   */
  if (!filterType || filterType === 'ARTICLE') {
    try {
      // const articles = await getAllArticles();

      // for (const article of articles) {
      //   addEntity(article, 'ARTICLE');
      // }
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des articles :',
        error,
      );
    }
  }

  /**
   * ------------------------------------------------------------------
   * VIDEO
   * ------------------------------------------------------------------
   */
  if (!filterType || filterType === 'VIDEO') {
    try {
      // const videos = await getAllVideos();

      // for (const video of videos) {
      //   addEntity(video, 'VIDEO');
      // }
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des vidéos :',
        error,
      );
    }
  }

  /**
   * ------------------------------------------------------------------
   * INFO
   * ------------------------------------------------------------------
   */
  if (!filterType || filterType === 'INFO') {
    try {
      // const infos = await getAllInfos();

      // for (const info of infos) {
      //   addEntity(info, 'INFO');
      // }
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des informations :',
        error,
      );
    }
  }

  /**
   * 4. Tri global par date de création décroissante.
   *
   * Les éléments les plus récents apparaissent en premier.
   */
  return combinedEntities.sort((a, b) => {
    
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return dateB - dateA;
  });
}


// ... garder les méthodes existantes (getGreffeByRefer, createGreffeInstance, addCommentToGreffe, toggleUserReaction)
