import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Session non valide ou expirée.",
        },
        { status: 401 }
      );
    }

    // Récupération de toutes les demandes
    const demandes = await prisma.demande.findMany({
      orderBy: {
        creeLe: "desc",
      },
    });

    const formattedData = demandes.map((demande) => {
      let historiqueArray: any[] = [];

      if (Array.isArray(demande.historiqueValidations)) {
        historiqueArray = demande.historiqueValidations as any[];
      } else {
        if (demande.commentaireN1) {
          historiqueArray.push({
            stepId: "N1",
            commentaire: demande.commentaireN1,
            dateValidation: demande.dateValidationN1,
          });
        }

        if (demande.commentaireRH) {
          historiqueArray.push({
            stepId: "RH",
            commentaire: demande.commentaireRH,
            dateValidation: demande.dateValidationRH,
          });
        }

        if (demande.commentaireIT) {
          historiqueArray.push({
            stepId: "IT",
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
    console.error("[API ALL REQUESTS ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de récupérer la liste des demandes.",
      },
      { status: 500 }
    );
  }
}