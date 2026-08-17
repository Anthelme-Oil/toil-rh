// ═══════════════════════════════════════════════════════════════
// API Route — Traitement Final & Dépôt Document RH
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { execute, query } from '@/lib/db';
import { processAndSaveAttachments } from '@/lib/storage';
import { sendLeaveNotificationEmail, getEmailTemplateDomiciliationDocDispo } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { demandeId, documentFinal } = body;

    if (!demandeId) {
      return Response.json({ error: 'Identifiant de demande requis.' }, { status: 400 });
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

    let documentFinalUrl = extra.documentFinalUrl || null;

    // Si la RH a téléversé un document PDF généré
    if (documentFinal && documentFinal.contentBase64) {
      const processed = await processAndSaveAttachments([documentFinal]);
      documentFinalUrl = processed[0]?.url || null;
    }

    const now = new Date();
    const nouveauStatut = 'TRAITEE';

    extra.documentFinalUrl = documentFinalUrl;
    extra.dateTraitementRH = now.toISOString();

    const sql = `
      UPDATE demandes 
      SET statut = ?, date_validation_rh = ?, donnees_formulaire = ?, mis_a_jour_le = ?
      WHERE id = ?
    `;

    await execute(sql, [nouveauStatut, now, JSON.stringify(extra), now, demandeId]);

    // Envoi du mail d'information au collaborateur
    const htmlDocDispo = getEmailTemplateDomiciliationDocDispo({
      demandeurNom: demande.nom_demandeur,
    });

    sendLeaveNotificationEmail({
      to: demande.email_demandeur,
      subject: `🎉 Votre document de domiciliation bancaire est disponible`,
      html: htmlDocDispo,
    }).catch((err) => console.error('[Email Doc Dispo Error]:', err));

    return Response.json({
      success: true,
      message: 'Demande marquée comme traitée et document disponible.',
      statut: nouveauStatut,
      documentFinalUrl,
    });
  } catch (error: any) {
    console.error('[API Traiter RH] Error:', error);
    return Response.json({ error: 'Erreur lors de la finalisation RH.' }, { status: 500 });
  }
}
