import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendLeaveNotificationEmail, getEmailTemplateRappel } from '@/lib/email';
import { mapRowToDemandeConge } from '@/lib/demandes';

// Endpoint de relance automatique à planifier (Cron Job quotidien)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    // Protection par secret si configuré
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 1. Récupérer les demandes en attente N+1 depuis plus de 48 heures
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const pendingN1Rows = await query<any>(
      'SELECT * FROM demandes WHERE type_demande = "CONGE" AND statut_n1 = "EN_ATTENTE" AND cree_le <= ?',
      [twoDaysAgo]
    );

    let n1Count = 0;
    for (const row of pendingN1Rows) {
      const demande = mapRowToDemandeConge(row);
      if (demande.managerEmail) {
        await sendLeaveNotificationEmail({
          to: demande.managerEmail,
          subject: `[RAPPEL] Validation requise pour la demande de congé de ${demande.demandeurNom}`,
          html: getEmailTemplateRappel({
            demandeurNom: demande.demandeurNom || 'Un collaborateur',
            typeConge: demande.titre,
            dateDebut: demande.dateDebut ? new Date(demande.dateDebut).toLocaleDateString('fr-FR') : '-',
            dateFin: demande.dateFin ? new Date(demande.dateFin).toLocaleDateString('fr-FR') : '-',
            nombreJours: demande.nombreJours || 1,
            role: 'N1',
          }),
        });
        n1Count++;
      }
    }

    // 2. Récupérer les demandes en attente RH depuis plus de 48h
    const pendingRHRows = await query<any>(
      'SELECT * FROM demandes WHERE type_demande = "CONGE" AND statut_n1 = "APPROUVE" AND statut_rh = "EN_ATTENTE" AND mis_a_jour_le <= ?',
      [twoDaysAgo]
    );

    let rhCount = 0;
    const rhEmail = process.env.RH_NOTIFICATION_EMAIL || process.env.NOTIFICATION_RH_EMAIL || 'rh@compel-toil.com';
    for (const row of pendingRHRows) {
      const demande = mapRowToDemandeConge(row);
      await sendLeaveNotificationEmail({
        to: rhEmail,
        subject: `[RAPPEL RH] Validation finale requise pour la demande de ${demande.demandeurNom}`,
        html: getEmailTemplateRappel({
          demandeurNom: demande.demandeurNom || 'Un collaborateur',
          typeConge: demande.titre,
          dateDebut: demande.dateDebut ? new Date(demande.dateDebut).toLocaleDateString('fr-FR') : '-',
          dateFin: demande.dateFin ? new Date(demande.dateFin).toLocaleDateString('fr-FR') : '-',
          nombreJours: demande.nombreJours || 1,
          role: 'RH',
        }),
      });
      rhCount++;
    }

    return NextResponse.json({
      success: true,
      remindersSent: { n1Count, rhCount },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
