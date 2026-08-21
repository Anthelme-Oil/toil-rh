// ═══════════════════════════════════════════════════════════════
// API Route — Traitement DRH Attestation (Valider / Refuser)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { execute, query } from '@/lib/db';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { getSystemSettings } from '@/lib/settings';
import { sendLeaveNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const perms = await getUserPermissionsByEmail(userEmail);
  if (!perms.isDRH && !perms.isAdmin) {
    return Response.json({ error: 'Accès réservé au service DRH' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { demandeId, action, motifRefus } = body;

    if (!demandeId || !['VALIDER', 'REFUSER'].includes(action)) {
      return Response.json({ error: 'Données invalides.' }, { status: 400 });
    }

    if (action === 'REFUSER' && (!motifRefus || !motifRefus.trim())) {
      return Response.json({ error: 'Un motif de refus est obligatoire.' }, { status: 400 });
    }

    const rows = await query<any>(`SELECT * FROM demandes WHERE id = ? AND type_demande = 'ATTESTATION_TRAVAIL'`, [demandeId]);
    if (!rows.length) {
      return Response.json({ error: 'Demande non trouvée.' }, { status: 404 });
    }

    const demande = rows[0];
    const now = new Date();
    const nouveauStatut = action === 'VALIDER' ? 'VALIDEE_DRH' : 'REFUSEE_DRH';

    let extra: any = {};
    if (demande.donnees_formulaire) {
      try {
        extra = typeof demande.donnees_formulaire === 'string' ? JSON.parse(demande.donnees_formulaire) : demande.donnees_formulaire;
      } catch {}
    }

    if (action === 'REFUSER') {
      extra.motifRefus = motifRefus;
    }

    const sql = `
      UPDATE demandes 
      SET statut = ?, date_validation_n1 = ?, commentaire_rh = ?, donnees_formulaire = ?, mis_a_jour_le = ?
      WHERE id = ?
    `;

    await execute(sql, [
      nouveauStatut,
      now,
      action === 'REFUSER' ? motifRefus : null,
      JSON.stringify(extra),
      now,
      demandeId,
    ]);

    const settings = await getSystemSettings();

    if (action === 'REFUSER') {
      // Mail au collaborateur
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 10px; background-color: #fff5f5;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Demande d'Attestation de Travail Non Accordée</h2>
          <p>Bonjour <strong>${demande.nom_demandeur}</strong>,</p>
          <p>Votre demande d'attestation de travail (Société : <strong>${extra.societe || 'T-OIL'}</strong>) a été refusée par la DRH.</p>
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0;">
            <strong>Motif du refus :</strong><br/>
            ${motifRefus}
          </div>
          <p style="font-size: 12px; color: #666;">Pour toute précision, veuillez contacter la Direction des Ressources Humaines.</p>
        </div>
      `;

      sendLeaveNotificationEmail({
        to: demande.email_demandeur,
        subject: `❌ Notification Intranet : Votre demande d'attestation de travail a été refusée`,
        html: emailHtml,
      }).catch((err) => console.error('[Email Collaborateur Error]:', err));
    } else {
      // Validée par la DRH -> Transmettre à la RH Impression
      const rhPrintTarget = settings.rhPrintAttestationEmail || settings.rhPrintEmail || 'rh.attestation@compel-toil.com';

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Attestation de Travail à Générer / Imprimer</h2>
          <p>La demande d'attestation de travail pour <strong>${demande.nom_demandeur}</strong> (Société : <strong>${extra.societe || 'T-OIL'}</strong>) a été <strong>validée par la DRH</strong>.</p>
          <p>Elle est en attente de votre traitement final pour la mise à disposition de l'attestation au collaborateur.</p>
          <div style="margin-top: 25px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || ''}/demandes" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Traiter la demande sur l'Intranet</a>
          </div>
        </div>
      `;

      sendLeaveNotificationEmail({
        to: rhPrintTarget,
        subject: `✅ Attestation à Traiter (${extra.societe || 'T-OIL'}) — ${demande.nom_demandeur}`,
        html: emailHtml,
      }).catch((err) => console.error('[Email RH Traitement Error]:', err));
    }

    return Response.json({ success: true, message: `Demande ${action === 'VALIDER' ? 'validée' : 'refusée'}.` });
  } catch (error: any) {
    console.error('[API Traiter DRH Attestation] Error:', error);
    return Response.json({ error: 'Erreur lors du traitement DRH.' }, { status: 500 });
  }
}
