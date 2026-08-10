import { NextResponse } from 'next/server';
import { traiterDemandeConge } from '@/lib/demandes';
import { sendLeaveNotificationEmail, getEmailTemplateRH } from '@/lib/email';

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

    // ⚡ Notification e-mail selon la transition de statut
    if (action === 'APPROUVER' && role === 'N1') {
      // Le N+1 vient d'approuver ➔ Notifier l'équipe RH
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

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
