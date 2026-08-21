// ═══════════════════════════════════════════════════════════════
// API Route — Traitement / Validation DRH pour Domiciliation
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { execute, query } from '@/lib/db';
import {
  sendLeaveNotificationEmail,
  getEmailTemplateDomiciliationRefus,
  getEmailTemplateDomiciliationRH,
} from '@/lib/email';
import { getUserPermissionsByEmail } from '@/lib/roles';

export async function POST(request: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const perms = await getUserPermissionsByEmail(userEmail);
  if (!perms.isDRH && !perms.isAdmin && !perms.isRH) {
    return Response.json({ error: 'Accès réservé au service DRH/RH' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { demandeId, action, motifRefus } = body;

    if (!demandeId || !action) {
      return Response.json({ error: 'Identifiant et action requis.' }, { status: 400 });
    }

    if (action === 'REFUSER' && !motifRefus?.trim()) {
      return Response.json({ error: 'Le motif du refus est obligatoire.' }, { status: 400 });
    }

    // Récupération de la demande
    const rows = await query<any>(`SELECT * FROM demandes WHERE id = ?`, [demandeId]);
    if (!rows || rows.length === 0) {
      return Response.json({ error: 'Demande introuvable.' }, { status: 404 });
    }

    const demande = rows[0];
    let extra: any = {};
    if (demande.donnees_formulaire) {
      try {
        extra =
          typeof demande.donnees_formulaire === 'string'
            ? JSON.parse(demande.donnees_formulaire)
            : demande.donnees_formulaire;
      } catch {}
    }

    const now = new Date();

    if (action === 'REFUSER') {
      const nouveauStatut = 'REFUSEE_DRH';
      extra.motifRefus = motifRefus.trim();

      const sql = `
        UPDATE demandes 
        SET statut = ?, date_validation_n1 = ?, commentaire_n1 = ?, donnees_formulaire = ?, mis_a_jour_le = ?
        WHERE id = ?
      `;

      await execute(sql, [
        nouveauStatut,
        now,
        motifRefus.trim(),
        JSON.stringify(extra),
        now,
        demandeId,
      ]);

      // Envoi mail notification refus au collaborateur
      const htmlRefus = getEmailTemplateDomiciliationRefus({
        demandeurNom: demande.nom_demandeur,
        motifRefus: motifRefus.trim(),
      });

      sendLeaveNotificationEmail({
        to: demande.email_demandeur,
        subject: `❌ Demande de Domiciliation Refusée par la DRH`,
        html: htmlRefus,
      }).catch((err) => console.error('[Email Refus Error]:', err));

      return Response.json({
        success: true,
        message: 'Demande refusée avec succès.',
        statut: nouveauStatut,
      });
    } else {
      // Action: VALIDER
      const nouveauStatut = 'VALIDEE_DRH';

      const sql = `
        UPDATE demandes 
        SET statut = ?, date_validation_n1 = ?, mis_a_jour_le = ?
        WHERE id = ?
      `;

      await execute(sql, [nouveauStatut, now, now, demandeId]);

      // Envoi mail notification à la RH chargée du traitement
      const htmlRH = getEmailTemplateDomiciliationRH({
        demandeurNom: demande.nom_demandeur,
        banque: extra.banque || 'N/A',
        agenceBancaire: extra.agenceBancaire || 'N/A',
      });

      sendLeaveNotificationEmail({
        to: process.env.RH_TRAITEMENT_EMAIL || 'rh-traitement@togosh.com',
        subject: `📄 Domiciliation Bancaire à Traiter — ${demande.nom_demandeur}`,
        html: htmlRH,
      }).catch((err) => console.error('[Email RH Traitement Error]:', err));

      return Response.json({
        success: true,
        message: 'Demande validée par la DRH et transmise à la RH.',
        statut: nouveauStatut,
      });
    }
  } catch (error: any) {
    console.error('[API Traiter DRH] Error:', error);
    return Response.json({ error: 'Erreur lors du traitement DRH.' }, { status: 500 });
  }
}
