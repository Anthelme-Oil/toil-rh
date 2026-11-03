import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Session non valide ou expirée.' },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase().trim();
    // const estDrh = session?.user?.isDRH;
    // console.log("isDRH=>",estDrh,"session=>",session)
    const userRole = (session.user as any)?.role?.toUpperCase() || '';

    // Définition de la stratégie de récupération selon le rôle ou besoin global
    // Si c'est un profil RH / Admin / Manager, on peut élargir la requête Prisma 
    // (Ici on récupère toutes les demandes ou on filtre selon la logique métier requise)
    
    let userRequests;

    // Exemple : Si l'utilisateur est admin ou DRH, on récupère tout ou les en-cours
    // Adaptez cette condition selon vos rôles Prisma exacts
    if (userRole.includes('DRH')  || userRole.includes('ADMIN') || userRole.includes('N+1')) {
      userRequests = await prisma.demande.findMany({
        orderBy: {
          creeLe: 'desc',
        },
      });
    } else {
      // Par défaut, l'utilisateur voit ses propres demandes
      userRequests = await prisma.demande.findMany({
        where: {
          emailDemandeur: email,
        },
        orderBy: {
          creeLe: 'desc',
        },
      });
    }

    // Mapping complet renvoyant TOUS les champs de la table + l'historique structuré
    const formattedData = userRequests.map((demande) => {
      let historiqueArray: Array<any> = [];

      if (Array.isArray(demande.historiqueValidations)) {
        historiqueArray = demande.historiqueValidations as Array<any>;
      } else {
        if (demande.commentaireN1) {
          historiqueArray.push({ stepId: 'N1', commentaire: demande.commentaireN1, dateValidation: demande.dateValidationN1 });
        }
        if (demande.commentaireRH) {
          historiqueArray.push({ stepId: 'RH', commentaire: demande.commentaireRH, dateValidation: demande.dateValidationRH });
        }
        if (demande.commentaireIT) {
          historiqueArray.push({ stepId: 'IT', commentaire: demande.commentaireIT, dateValidation: demande.dateValidationIT });
        }
      }

      return {
        // --- TOUS LES CHAMPS DE LA TABLE DEMANDE ---
        ...demande,

        // --- CHAMPS COMPUTÉS OU FORMATÉS POUR LE FRONTEND ---
        reference: demande.id.slice(-6).toUpperCase(),
        titre: demande.titre,
        typeDemande: demande.typeDemande,
        type: demande.typeDemande, // Alias au cas où certains composants utilisent .type
        statut: demande.statut,    // Statut brut
        statutActuel: demande.statut,
        historique: historiqueArray,
      };
    });

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('[API MY_REQUESTS_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de récupérer la liste des demandes.' },
      { status: 500 }
    );
  }
}