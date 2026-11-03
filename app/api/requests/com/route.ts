import { NextResponse } from 'next/server';
import {
  addCommentService,
  deleteCommentService,
  getGreffeService,
  initGreffeService,
  toggleReactionService,
} from '@/lib/communautes/service';
import { ChannelType, ReactionType } from '@/lib/communautes/types';
import { getEntitiesService } from '@/lib/communautes/service';

/**
 * GET /api/requests/com?referId=xxx&typeRefer=MEDIA
 */
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const referId = searchParams.get('referId');
//   const typeRefer = searchParams.get('typeRefer') as ChannelType;

//   if (!referId || !typeRefer) {
//     return NextResponse.json(
//       { success: false, message: 'Paramètres referId et typeRefer requis.' },
//       { status: 400 },
//     );
//   }

//   try {
//     const data = await getGreffeService(referId, typeRefer);
//     return NextResponse.json({ success: true, data });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message || 'Erreur serveur.' },
//       { status: 500 },
//     );
//   }
// }


/**
 * GET /api/requests/com
 * 
 * - CAS 1 : /api/requests/com
 *           OU /api/requests/com?typeRefer=MEDIA
 *   --> Retourne le flux global des entités avec leurs interactions.
 * 
 * - CAS 2 : /api/requests/com?referId=xxx&typeRefer=MEDIA
 *   --> Retourne uniquement la greffe d'une entité spécifique.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const referId = searchParams.get('referId');
  const typeRefer = searchParams.get('typeRefer') as ChannelType | null;

  try {
    // CAS 2 : Récupération ciblée d'une seule greffe
    if (referId) {
      if (!typeRefer) {
        return NextResponse.json(
          { success: false, message: 'Le paramètre typeRefer est requis avec referId.' },
          { status: 400 },
        );
      }

      const data = await getGreffeService(referId, typeRefer);
      return NextResponse.json({ success: true, data });
    }

    // CAS 1 : Récupération du flux (tout ou filtré par type)
    const data = await getEntitiesService(typeRefer || undefined);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/requests/com
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, referId, typeRefer, authorName, authorEmail, text, reactionType } = body;

    if (!referId || !typeRefer) {
      return NextResponse.json(
        { success: false, message: 'Paramètres referId et typeRefer requis.' },
        { status: 400 },
      );
    }

    // Action 1: Initialisation de la greffe
    if (action === 'init') {
      const data = await initGreffeService({ referId, typeRefer });
      return NextResponse.json({ success: true, data });
    }

    // Action 2: Ajout de commentaire
    if (action === 'comment') {
      const data = await addCommentService({
        referId,
        typeRefer,
        authorName,
        authorEmail,
        text,
      });
      return NextResponse.json({ success: true, data });
    }

    // Action 3: Reaction (LIKE/DISLIKE)
    if (action === 'reaction') {
      const data = await toggleReactionService({
        referId,
        typeRefer,
        reactionType: reactionType as ReactionType,
        authorName,
        authorEmail,
      });
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { success: false, message: 'Action non reconnue.' },
      { status: 400 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors du traitement.' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/requests/com?commentId=xxx
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('commentId');

  if (!commentId) {
    return NextResponse.json(
      { success: false, message: 'L\'identifiant du commentaire est requis.' },
      { status: 400 },
    );
  }

  try {
    await deleteCommentService(commentId);
    return NextResponse.json({ success: true, message: 'Commentaire supprimé.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur lors de la suppression.' },
      { status: 500 },
    );
  }
}