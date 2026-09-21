import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session non valide ou expirée.',
        },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase().trim();
    const userRole = String((session.user as any)?.role || '').toUpperCase();

    let userRequests;

    if (userRole === 'ADMIN') {
      // ADMIN : toutes les demandes
      userRequests = await prisma.demande.findMany({
        orderBy: {
          creeLe: 'desc',
        },
      });
    } else {
      // Autres utilisateurs :
      // uniquement les demandes dont le managerEmail
      // correspond au mail de l'utilisateur connecté.
      userRequests = await prisma.demande.findMany({
        where: {
          emailManager: email,
        },
        orderBy: {
          creeLe: 'desc',
        },
      });
    }

    const formattedData = userRequests.map((demande) => {
      let historiqueArray: Array<any> = [];

      if (Array.isArray(demande.historiqueValidations)) {
        historiqueArray = demande.historiqueValidations as Array<any>;
      } else {
        if (demande.commentaireN1) {
          historiqueArray.push({
            stepId: 'N1',
            commentaire: demande.commentaireN1,
            dateValidation: demande.dateValidationN1,
          });
        }

        if (demande.commentaireRH) {
          historiqueArray.push({
            stepId: 'RH',
            commentaire: demande.commentaireRH,
            dateValidation: demande.dateValidationRH,
          });
        }

        if (demande.commentaireIT) {
          historiqueArray.push({
            stepId: 'IT',
            commentaire: demande.commentaireIT,
            dateValidation: demande.dateValidationIT,
          });
        }
      }

      return {
        ...demande,

        reference: demande.id.slice(-6).toUpperCase(),
        titre: demande.titre,
        typeDemande: demande.typeDemande,
        type: demande.typeDemande,
        statut: demande.statut,
        statutActuel: demande.statut,
        historique: historiqueArray,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('[API MY_REQUESTS_ERROR]', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de récupérer la liste des demandes.',
      },
      { status: 500 }
    );
  }
}