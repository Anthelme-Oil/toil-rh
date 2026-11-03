import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WorkflowType, WorkflowStatus } from '@/lib/workflows/engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      typeDemande,
      titre,
      emailDemandeur,
      nomDemandeur,
      utilisateurId,
      emailManager,
      donneesFormulaire,
      dateDebut,
      dateFin,
      nombreJours,
      motif,
    } = body;

    // Détermination du statut initial selon le workflow
    let initialStatus: WorkflowStatus = 'PENDING_N1';

    if (['DOMICILIATION', 'ATTESTATION'].includes(typeDemande)) {
      initialStatus = 'PENDING_DRH';
    } else if (['CONSOMMABLE', 'MATERIEL_IT', 'ACHAT', 'BESOIN_METIER'].includes(typeDemande)) {
      initialStatus = 'PENDING_IT_MGR';
    }

    const nouvelleDemande = await prisma.demande.create({
      data: {
        titre,
        typeDemande,
        statut: initialStatus,
        utilisateurId,
        emailDemandeur,
        nomDemandeur,
        emailManager: emailManager || '',
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        nombreJours,
        motif,
        donneesFormulaire,
        historiqueValidations: [
          {
            action: 'CREATION',
            auteur: nomDemandeur,
            email: emailDemandeur,
            date: new Date().toISOString(),
            commentaire: 'Demande soumise',
          },
        ],
      },
    });

    return NextResponse.json({ success: true, data: nouvelleDemande }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}