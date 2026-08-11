import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { traiterDemandeConge } from '@/lib/demandes';
import { sendLeaveNotificationEmail, getEmailTemplateRH, getEmailTemplateDecision } from '@/lib/email';

/**
 * POST /api/demandes/conges/traiter
 * Traite (Approuve/Refuse) une demande de congé.
 * Protégé : vérifie que l'appelant a le rôle requis (MANAGER/RH/ADMIN).
 */
export async function POST(request: Request) {
  try {
    // ── Vérification de l'authentification ──
    const session = await auth();
    const callerEmail = session?.user?.email;

    if (!callerEmail) {
      return NextResponse.json(
        { error: 'Non authentifié. Connectez-vous via Microsoft 365.' },
        { status: 401 }
      );
    }

    // ── Vérification des permissions ──
    const callerPerms = await getUserPermissionsByEmail(callerEmail);
    if (!callerPerms.isManager && !callerPerms.isRH && !callerPerms.isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Vous devez être Manager, RH ou Admin pour traiter des demandes.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, action, role, motifRefus, demandeurNom, demandeurEmail, typeConge, dateDebut, dateFin, nombreJours } = body;

    if (!id || !action || !role) {
      return NextResponse.json(
        { error: 'Paramètres manquants (id, action, role).' },
        { status: 400 }
      );
    }

    // Vérification fine du rôle demandé vs permissions réelles
    if (role === 'RH' && !callerPerms.isRH && !callerPerms.isAdmin) {
      return NextResponse.json(
        { error: 'Seuls les RH et Admin peuvent effectuer une validation RH.' },
        { status: 403 }
      );
    }

    if (action === 'REFUSER' && !motifRefus) {
      return NextResponse.json(
        { error: 'Un motif de refus est obligatoire pour rejeter une demande.' },
        { status: 400 }
      );
    }

    const success = await traiterDemandeConge(id, action, role, motifRefus);
    if (!success) {
      return NextResponse.json({ error: 'Échec du traitement de la demande' }, { status: 500 });
    }

    // ⚡ Notifications E-mail
    if (action === 'APPROUVER' && role === 'N1') {
      // Le N+1 a approuvé ➔ Notifier la RH
      const rhEmail = process.env.RH_NOTIFICATION_EMAIL || 'rh@compel-toil.com';
      sendLeaveNotificationEmail({
        to: rhEmail,
        subject: `[Traitement RH] Congé validé par N+1 pour ${demandeurNom || 'un collaborateur'}`,
        html: getEmailTemplateRH({
          demandeurNom: demandeurNom || 'Collaborateur T-OIL',
          typeConge: typeConge || 'Congé',
          dateDebut: dateDebut || 'ND',
          dateFin: dateFin || 'ND',
          nombreJours: nombreJours || 1,
        }),
      }).catch((e) => console.warn('Échec envoi mail RH:', e));
    }

    // Notifier l'employé demandeur du résultat (RH finale ou refus N+1)
    if (demandeurEmail) {
      const isFinalDecision = role === 'RH' || action === 'REFUSER';
      if (isFinalDecision) {
        sendLeaveNotificationEmail({
          to: demandeurEmail,
          subject: action === 'APPROUVER' ? `[Accordé] Votre demande de congé a été validée` : `[Refusé] Votre demande de congé`,
          html: getEmailTemplateDecision({
            demandeurNom: demandeurNom || demandeurEmail,
            typeConge: typeConge || 'Congé Payé',
            statut: action === 'APPROUVER' ? 'APPROUVE' : 'REFUSE',
            motifRefus,
            valideurRole: role === 'N1' ? 'votre Supérieur N+1' : 'la Direction RH',
          }),
        }).catch((e) => console.warn('Échec envoi mail réponse à l\'employé:', e));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
