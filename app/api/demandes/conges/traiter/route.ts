import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { traiterDemandeConge } from '@/lib/demandes';
import { sendLeaveNotificationEmail, getEmailTemplateRH, getEmailTemplateDecision, getEmailTemplatePrint } from '@/lib/email';
import { getSystemSettings } from '@/lib/settings';
import { query } from '@/lib/db';

/**
 * POST /api/demandes/conges/traiter
 * Traite (Approuve/Refuse) une demande de congé.
 * Protégé : vérifie que l'appelant a le rôle requis (MANAGER/RH/DRH/ADMIN).
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
    if (!callerPerms.isManager && !callerPerms.isRH && !callerPerms.isDRH && !callerPerms.isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Privilèges insuffisants pour traiter des demandes.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, action, role, motifRefus } = body;

    if (!id || !action || !role) {
      return NextResponse.json(
        { error: 'Paramètres manquants (id, action, role).' },
        { status: 400 }
      );
    }

    // Vérification fine du rôle demandé vs permissions réelles
    if (role === 'RH' && !callerPerms.isDRH && !callerPerms.isRH && !callerPerms.isAdmin) {
      return NextResponse.json(
        { error: 'Seuls la DRH et les Administrateurs peuvent effectuer la validation finale.' },
        { status: 403 }
      );
    }

    if (action === 'REFUSER' && !motifRefus) {
      return NextResponse.json(
        { error: 'Un motif de refus est obligatoire pour rejeter une demande.' },
        { status: 400 }
      );
    }

    // Récupérer la demande en base de données pour avoir des infos fiables pour les e-mails
    const rows = await query<any>('SELECT * FROM demandes WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Demande introuvable.' }, { status: 404 });
    }
    const dbDemande = rows[0];

    const demandeurNom = dbDemande.nom_demandeur || dbDemande.email_demandeur.split('@')[0];
    const demandeurEmail = dbDemande.email_demandeur;
    const typeConge = dbDemande.type_conge || 'conge_paye';
    const dateDebut = dbDemande.date_debut ? new Date(dbDemande.date_debut).toLocaleDateString('fr-FR') : '';
    const dateFin = dbDemande.date_fin ? new Date(dbDemande.date_fin).toLocaleDateString('fr-FR') : '';
    const nombreJours = dbDemande.nombre_jours || 1;

    // Effectuer la modification en base de données
    const success = await traiterDemandeConge(id, action, role, motifRefus);
    if (!success) {
      return NextResponse.json({ error: 'Échec du traitement de la demande' }, { status: 500 });
    }

    const settings = await getSystemSettings();

    // ⚡ Notifications E-mail
    if (action === 'APPROUVER' && role === 'N1') {
      // Le N+1 a approuvé ➔ Notifier la DRH via l'e-mail configuré
      const drhEmail = settings.drhEmail || 'drh@compel-toil.com';
      try {
        await sendLeaveNotificationEmail({
          to: drhEmail,
          subject: `[Traitement DRH] Congé validé par N+1 pour ${demandeurNom}`,
          html: getEmailTemplateRH({
            demandeurNom: demandeurNom,
            typeConge: typeConge,
            dateDebut: dateDebut,
            dateFin: dateFin,
            nombreJours: nombreJours,
          }),
        });
      } catch (e) {
        console.warn('Échec envoi mail DRH:', e);
      }
    }

    // Notifier l'employé demandeur du résultat (DRH finale ou refus N+1)
    if (demandeurEmail) {
      const isFinalDecision = role === 'RH' || action === 'REFUSER';
      if (isFinalDecision) {
        try {
          await sendLeaveNotificationEmail({
            to: demandeurEmail,
            subject: action === 'APPROUVER' ? `[Accordé] Votre demande de congé a été validée` : `[Refusé] Votre demande de congé`,
            html: getEmailTemplateDecision({
              demandeurNom: demandeurNom,
              typeConge: typeConge,
              statut: action === 'APPROUVER' ? 'APPROUVE' : 'REFUSE',
              motifRefus,
              valideurRole: role === 'N1' ? 'votre Supérieur N+1' : 'la Direction DRH',
            }),
          });
        } catch (e) {
          console.warn('Échec envoi mail réponse à l\'employé:', e);
        }

        // Si c'est approuvé par la DRH (décision finale d'acceptation)
        if (action === 'APPROUVER' && role === 'RH') {
          // Notifier également le responsable de l'impression d'attestation
          const printEmail = settings.rhPrintEmail || 'rh.attestation@compel-toil.com';
          try {
            await sendLeaveNotificationEmail({
              to: printEmail,
              subject: `[Impression Requis] Attestation de congé prête pour ${demandeurNom}`,
              html: getEmailTemplatePrint({
                demandeurNom: demandeurNom,
                typeConge: typeConge,
                dateDebut: dateDebut,
                dateFin: dateFin,
                nombreJours: nombreJours,
              }),
            });
          } catch (e) {
            console.warn('Échec envoi mail RH Impression:', e);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
