// ═══════════════════════════════════════════════════════════════
// API Route — Traitement Final RH Attestation (Clôture & Document)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { execute, query } from '@/lib/db';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { sendLeaveNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const perms = await getUserPermissionsByEmail(userEmail);
  if (!perms.isRH && !perms.isRHPrint && !perms.isDRH && !perms.isAdmin) {
    return Response.json({ error: 'Accès réservé aux gestionnaires RH' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { demandeId } = body;

    if (!demandeId) {
      return Response.json({ error: 'ID de demande requis.' }, { status: 400 });
    }

    const rows = await query<any>(`SELECT * FROM demandes WHERE id = ? AND type_demande = 'ATTESTATION_TRAVAIL'`, [demandeId]);
    if (!rows.length) {
      return Response.json({ error: 'Demande introuvable.' }, { status: 404 });
    }

    const demande = rows[0];
    const now = new Date();

    let extra: any = {};
    if (demande.donnees_formulaire) {
      try {
        extra = typeof demande.donnees_formulaire === 'string' ? JSON.parse(demande.donnees_formulaire) : demande.donnees_formulaire;
      } catch {}
    }

    const documentUrl = `/demandes/attestation/${demandeId}`;
    extra.documentFinalUrl = documentUrl;

    const sql = `
      UPDATE demandes 
      SET statut = 'TRAITEE', date_validation_rh = ?, donnees_formulaire = ?, mis_a_jour_le = ?
      WHERE id = ?
    `;

    await execute(sql, [now, JSON.stringify(extra), now, demandeId]);

    // Email de notification au collaborateur
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dcfce7; border-radius: 10px; background-color: #f0fdf4;">
        <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Attestation de Travail Disponible !</h2>
        <p>Bonjour <strong>${demande.nom_demandeur}</strong>,</p>
        <p>Votre demande d'attestation de travail pour la société <strong>${extra.societe || 'T-OIL'}</strong> a été entièrement traitée par le service des Ressources Humaines.</p>
        <p>Votre document officiel est désormais prêt à être visualisé et imprimé depuis votre espace Intranet.</p>
        <div style="margin-top: 25px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL || ''}${documentUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Visualiser / Imprimer l'Attestation</a>
        </div>
      </div>
    `;

    sendLeaveNotificationEmail({
      to: demande.email_demandeur,
      subject: `📄 Votre Attestation de Travail (${extra.societe || 'T-OIL'}) est disponible`,
      html: emailHtml,
    }).catch((err) => console.error('[Email Final Attestation Error]:', err));

    return Response.json({
      success: true,
      message: 'Demande d\'attestation clôturée et disponible pour le collaborateur.',
      documentUrl,
    });
  } catch (error: any) {
    console.error('[API Traiter RH Attestation] Error:', error);
    return Response.json({ error: 'Erreur lors du traitement final.' }, { status: 500 });
  }
}
