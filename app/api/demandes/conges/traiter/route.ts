import { NextResponse } from 'next/server';
import { traiterDemandeConge } from '@/lib/demandes';
import { sendLeaveNotificationEmail, getEmailTemplateRH, getEmailTemplateDecision } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action, role, motifRefus, demandeurNom, demandeurEmail, typeConge, dateDebut, dateFin, nombreJours } = body;

    if (!id || !action || !role) {
      return NextResponse.json(
        { error: 'Paramètres manquants (id, action, role).' },
        { status: 400 }
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

    // Notifier l'employé demandeur du résultat de sa demande (RH finale ou refus N+1)
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
