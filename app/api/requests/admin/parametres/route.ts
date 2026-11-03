import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 1. GET: Récupérer tous les paramètres ou un paramètre spécifique par sa clé (?cle=...)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cle = searchParams.get("cle");

    if (cle) {
      const parametre = await prisma.parametre.findUnique({
        where: { cle: cle.toUpperCase() },
      });

      if (!parametre) {
        return NextResponse.json(
          { success: false, error: "Paramètre non trouvé" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: parametre }, { status: 200 });
    }

    const parametres = await prisma.parametre.findMany({
      orderBy: { misAJourLe: 'desc' }
    });
    
    // Format attendu par votre getSettings() frontend
    return NextResponse.json({ success: true, data: parametres }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * 2. POST (Upsert): Créer ou Mettre à jour (Enrichir) un paramètre
 * Si la clé existe déjà (contrainte @id), on met à jour sa valeur et description sans dupliquer.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cle, valeur, description } = body;

    if (!cle || !valeur) {
      return NextResponse.json(
        { error: "Les champs 'cle' et 'valeur' sont obligatoires." },
        { status: 400 }
      );
    }

    const formattedKey = cle.trim().toUpperCase();

    const parametre = await prisma.parametre.upsert({
      where: { cle: formattedKey },
      update: {
        valeur: valeur.trim(),
        description: description !== undefined ? description.trim() : undefined,
      },
      create: {
        cle: formattedKey,
        valeur: valeur.trim(),
        description: description ? description.trim() : null,
      },
    });

    return NextResponse.json(
      {
        message: "Paramètre enregistré avec succès",
        parametre,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du paramètre:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * 3. DELETE: Supprimer un paramètre par sa clé
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cle = searchParams.get("cle");

    if (!cle) {
      return NextResponse.json(
        { error: "La clé du paramètre est requise pour la suppression." },
        { status: 400 }
      );
    }

    await prisma.parametre.delete({
      where: { cle: cle.toUpperCase() },
    });

    return NextResponse.json(
      { message: `Paramètre ${cle.toUpperCase()} supprimé avec succès.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du paramètre:", error);
    return NextResponse.json(
      { error: "Paramètre introuvable ou erreur serveur" },
      { status: 500 }
    );
  }
}

// ==========================================
// 4. MÉTHODES UTILITAIRES POUR LE MOTEUR & WORKFLOW
// ==========================================

/**
 * Vérifie et enrichit dynamiquement le contexte de l'utilisateur connecté 
 * en fonction des e-mails enregistrés dans la table Parametre.
 * 
 * Injecte notamment : 
 * - HAS_EXEC_IT (pour PENDING_IT_EXEC)
 * - HAS_EXEC_ABS_PENDING_RH_EXEC (pour PENDING_RH_EXEC)
 */
export async function resolveUserWorkflowContext(userEmail: string): Promise<string[]> {
  try {
    if (!userEmail) return [];

    const allParams = await prisma.parametre.findMany({
      where: {
        cle: {
          in: ["RH_EXEC_EMAIL", "IT_EXEC_EMAIL"]
        }
      }
    });

    const permissions: string[] = [];
    const normalizedUserEmail = userEmail.trim().toLowerCase();

    const rhExecParam = allParams.find((p) => p.cle === "RH_EXEC_EMAIL");
    const itExecParam = allParams.find((p) => p.cle === "IT_EXEC_EMAIL");

    if (rhExecParam && rhExecParam.valeur.trim().toLowerCase() === normalizedUserEmail) {
      permissions.push("HAS_EXEC_ABS_PENDING_RH_EXEC");
    }

    if (itExecParam && itExecParam.valeur.trim().toLowerCase() === normalizedUserEmail) {
      permissions.push("HAS_EXEC_IT");
    }

    return permissions;
  } catch (error) {
    console.error("Erreur lors de la résolution du contexte utilisateur:", error);
    return [];
  }
}