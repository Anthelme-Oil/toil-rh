import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeNextWorkflowStep, WorkflowStatus, WorkflowType } from "@/lib/workflows/engine";

// GET : Récupérer uniquement les demandes en attente de la validation DRH
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase().trim();
    const currentUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Sécurité : Vérifier que l'utilisateur est bien DRH ou ADMIN
    if (!currentUser.estDRH && currentUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès réservé à la DRH" }, { status: 403 });
    }

    // On cible strictement PENDING_DRH
    const pendingRequests = await prisma.demande.findMany({
      where: {
        statut: "PENDING_DRH",
      },
      orderBy: { creeLe: "desc" },
    });

    return NextResponse.json({ success: true, data: pendingRequests });
  } catch (error) {
    console.error("[API_PENDING_DRH_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

// POST : Valider ou Rejeter une demande par la DRH
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase().trim();
    const currentUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!currentUser || (!currentUser.estDRH && currentUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "Action non autorisée" }, { status: 403 });
    }

    const body = await req.json();
    const { demandeId, action, commentaire } = body; // action: "VALIDATE" | "REJECT"

    const demande = await prisma.demande.findUnique({
      where: { id: demandeId },
    });

    if (!demande) {
      return NextResponse.json({ success: false, error: "Demande introuvable" }, { status: 404 });
    }

    const currentStatus = demande.statut as WorkflowStatus;
    const typeDemande = demande.typeDemande as WorkflowType;

    // Calcul du statut suivant via l'engine (ex: passe à PENDING_IT ou APPROUVE selon le workflow)
    const transition = computeNextWorkflowStep(
      typeDemande,
      currentStatus,
      action === "REJECT" ? "REJECT" : "VALIDATE"
    );

    // Historique JSON
    const historiqueActuel = Array.isArray(demande.historiqueValidations)
      ? (demande.historiqueValidations as Array<any>)
      : [];

    const nouvelleEntreeHistorique = {
      action: action === "REJECT" ? "REJECT" : "VALIDATE",
      etape: currentStatus,
      auteur: session.user.name || email,
      email: email,
      role: "DRH",
      date: new Date().toISOString(),
      commentaire: commentaire || "",
    };

    // Mise à jour de la demande en base avec les champs spécifiques DRH
    const updatedDemande = await prisma.demande.update({
      where: { id: demandeId },
      data: {
        statut: transition.nextStatus,
        statutRH: action === "REJECT" ? "REFUSE" : "APPROUVE",
        dateValidationRH: new Date(),
        commentaireRH: commentaire || "",
        historiqueValidations: [...historiqueActuel, nouvelleEntreeHistorique],
      },
    });

    return NextResponse.json({ success: true, data: updatedDemande });
  } catch (error) {
    console.error("[API_PENDING_DRH_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur lors du traitement DRH" }, { status: 500 });
  }
}