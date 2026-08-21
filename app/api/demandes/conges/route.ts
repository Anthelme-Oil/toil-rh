import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { creerDemandeConge, getDemandesCongesUtilisateur, getDemandesCongesAValider } from '@/lib/demandes';
import { sendLeaveNotificationEmail, getEmailTemplateN1 } from '@/lib/email';

/**
 * POST /api/demandes/conges
 * Crée une nouvelle demande de congé.
 * Protégé : l'email du demandeur est lu depuis la session.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email;

    if (!sessionEmail) {
      return NextResponse.json(
        { error: 'Non authentifié. Connectez-vous via Microsoft 365.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      titre,
      typeConge,
      societe,
      dateDebut,
      dateFin,
      nombreJours,
      motif,
      managerEmail: initialManagerEmail,
      piecesJointes,
    } = body;

    if (!titre || !dateDebut || !dateFin) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants (titre, dates).' },
        { status: 400 }
      );
    }

    // L'email du demandeur provient de la session serveur, pas du body
    const demandeurEmail = sessionEmail;
    const demandeurNom = session.user.name || sessionEmail.split('@')[0];

    // Résolution du Manager Email depuis le service de rôles si non spécifié
    let targetManagerEmail = initialManagerEmail;
    if (!targetManagerEmail) {
      const userPerms = await getUserPermissionsByEmail(demandeurEmail);
      targetManagerEmail = userPerms.managerEmail;
    }

    const id = await creerDemandeConge({
      titre,
      typeConge: typeConge || 'conge_paye',
      societe: societe || 'T-OIL',
      dateDebut,
      dateFin,
      nombreJours: parseFloat(nombreJours) || 1,
      motif,
      demandeurNom,
      demandeurEmail,
      managerEmail: targetManagerEmail,
      piecesJointes,
    });

    // Envoi de la notification e-mail au N+1 s'il est identifié
    if (targetManagerEmail) {
      try {
        await sendLeaveNotificationEmail({
          to: targetManagerEmail,
          subject: `[Validation Requis] Demande de congé de ${demandeurNom}`,
          html: getEmailTemplateN1({
            demandeurNom,
            typeConge: typeConge || 'Congé Payé',
            dateDebut: new Date(dateDebut).toLocaleDateString('fr-FR'),
            dateFin: new Date(dateFin).toLocaleDateString('fr-FR'),
            nombreJours: parseFloat(nombreJours) || 1,
            motif,
          }),
        });
      } catch (e) {
        console.warn('Échec envoi mail N+1:', e);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/demandes/conges
 * Récupère les demandes de congés (propres ou à valider).
 * Protégé : l'email est lu depuis la session.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email;

    if (!sessionEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'n1' | 'rh'

    // Invalidation du cache HTTP pour mise à jour instantanée lors des validations
    const cacheHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    if (role === 'n1' || role === 'rh') {
      // Vérifier que l'utilisateur a bien le rôle pour voir les validations
      const perms = await getUserPermissionsByEmail(sessionEmail);
      if (role === 'rh' && !perms.isDRH && !perms.isRH && !perms.isAdmin) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
      if (role === 'n1' && !perms.isManager && !perms.isAdmin) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      const demandes = await getDemandesCongesAValider(sessionEmail, role === 'n1' ? 'N1' : 'RH');
      return NextResponse.json({ demandes }, { headers: cacheHeaders });
    }

    // Par défaut : les propres demandes de l'utilisateur
    const demandes = await getDemandesCongesUtilisateur(sessionEmail);
    return NextResponse.json({ demandes }, { headers: cacheHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
