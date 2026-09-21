import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeNextWorkflowStep, WorkflowStatus, WorkflowType } from '@/lib/workflows/engine';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { actorEmail, actorName, actorRole, action, commentaire } = await req.json();
    // action: 'VALIDATE' | 'REJECT'

    const demande = await prisma.demande.findUnique({ where: { id } });
    if (!demande) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    const currentStatus = demande.statut as WorkflowStatus;
    const typeDemande = demande.typeDemande as WorkflowType;

    // Calcul du statut suivant
    const transition = computeNextWorkflowStep(
      typeDemande, 
      currentStatus, 
      action === 'REJECT' ? 'REJECT' : 'VALIDATE'
    );

    // Mise à jour de l'historique JSON (champ correct: historiqueValidations)
    const historiqueActuel = Array.isArray(demande.historiqueValidations)
      ? (demande.historiqueValidations as Array<any>)
      : [];

    const nouvelHistorique = [
      ...historiqueActuel,
      {
        action,
        etape: currentStatus,
        auteur: actorName,
        email: actorEmail,
        role: actorRole,
        date: new Date().toISOString(),
        commentaire: commentaire || '',
      },
    ];

    const demandeMiseAJour = await prisma.demande.update({
      where: { id },
      data: {
        statut: transition.nextStatus,
        historiqueValidations: nouvelHistorique,
      },
    });

    return NextResponse.json({ success: true, data: demandeMiseAJour });
  } catch (error: any) {
    console.error("[API_REQUEST_ACTION_ERROR]", error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}