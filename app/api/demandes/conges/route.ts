import { NextResponse } from 'next/server';
import { creerDemandeConge, getDemandesCongesUtilisateur, getDemandesCongesAValider } from '@/lib/demandes';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { sendLeaveNotificationEmail, getEmailTemplateN1 } from '@/lib/email';

// Force HMR reload for Prisma Client models update


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titre,
      typeConge,
      dateDebut,
      dateFin,
      nombreJours,
      motif,
      demandeurNom,
      demandeurEmail,
      demandeurLookupId,
      managerEmail: initialManagerEmail,
      supHierarchiqueLookupId,
      piecesJointes,
    } = body;

    if (!titre || !dateDebut || !dateFin || !demandeurEmail) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (titre, dates, email).' },
        { status: 400 }
      );
    }

    // Résolution du Manager Email depuis le service de rôles si non spécifié
    let targetManagerEmail = initialManagerEmail;
    if (!targetManagerEmail) {
      const userPerms = await getUserPermissionsByEmail(demandeurEmail);
      targetManagerEmail = userPerms.managerEmail;
    }

    const id = await creerDemandeConge({
      titre,
      typeConge: typeConge || 'conge_paye',
      dateDebut,
      dateFin,
      nombreJours: parseFloat(nombreJours) || 1,
      motif,
      demandeurNom: demandeurNom || demandeurEmail.split('@')[0],
      demandeurEmail,
      demandeurLookupId,
      managerEmail: targetManagerEmail,
      supHierarchiqueLookupId,
      piecesJointes,
    });

    // Envoi de la notification e-mail au N+1 s'il est identifié
    if (targetManagerEmail) {
      sendLeaveNotificationEmail({
        to: targetManagerEmail,
        subject: `[Validation Requis] Demande de congé de ${demandeurNom || demandeurEmail}`,
        html: getEmailTemplateN1({
          demandeurNom: demandeurNom || demandeurEmail,
          typeConge: typeConge || 'Congé Payé',
          dateDebut: new Date(dateDebut).toLocaleDateString('fr-FR'),
          dateFin: new Date(dateFin).toLocaleDateString('fr-FR'),
          nombreJours: parseFloat(nombreJours) || 1,
          motif,
        }),
      }).catch((e) => console.warn('Échec envoi mail asynchrone N+1:', e));
    }

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const role = searchParams.get('role'); // 'n1' | 'rh'

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  // Headers de cache HTTP (60s stale-while-revalidate pour navigation rapide)
  const cacheHeaders = {
    'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
  };

  try {
    if (role === 'n1' || role === 'rh') {
      const demandes = await getDemandesCongesAValider(email, role === 'n1' ? 'N1' : 'RH');
      return NextResponse.json({ demandes }, { headers: cacheHeaders });
    }

    const demandes = await getDemandesCongesUtilisateur(email);
    return NextResponse.json({ demandes }, { headers: cacheHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
