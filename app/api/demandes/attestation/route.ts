// ═══════════════════════════════════════════════════════════════
// API Route — Attestation de Travail (Création & Consultation)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { execute, query, generateId } from '@/lib/db';
import { getSystemSettings } from '@/lib/settings';
import { sendLeaveNotificationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'collaborateur';

  try {
    let sql = `SELECT * FROM demandes WHERE type_demande = 'ATTESTATION_TRAVAIL'`;
    const params: any[] = [];

    if (role === 'collaborateur') {
      sql += ` AND LOWER(email_demandeur) = ?`;
      params.push(userEmail.toLowerCase().trim());
    } else if (role === 'drh') {
      sql += ` AND (statut = 'EN_ATTENTE_DRH' OR statut = 'VALIDEE_DRH' OR statut = 'REFUSEE_DRH')`;
    } else if (role === 'rh') {
      sql += ` AND (statut = 'VALIDEE_DRH' OR statut = 'TRAITEE')`;
    }

    sql += ` ORDER BY cree_le DESC`;

    const rows = await query<any>(sql, params);

    const demandes = rows.map((row) => {
      let extra: any = {};
      if (row.donnees_formulaire) {
        try {
          extra = typeof row.donnees_formulaire === 'string' ? JSON.parse(row.donnees_formulaire) : row.donnees_formulaire;
        } catch {}
      }

      return {
        id: row.id,
        titre: row.titre || 'Demande d\'attestation de travail',
        typeDemande: 'attestation_travail',
        statut: row.statut, // EN_ATTENTE_DRH, VALIDEE_DRH, REFUSEE_DRH, TRAITEE
        nomDemandeur: row.nom_demandeur,
        emailDemandeur: row.email_demandeur,
        nom: extra.nom || row.nom_demandeur?.split(' ')[0] || '',
        prenom: extra.prenom || row.nom_demandeur?.split(' ').slice(1).join(' ') || '',
        societe: extra.societe || 'T-OIL',
        poste: extra.poste || '',
        motif: row.motif || extra.motif || '',
        documentFinalUrl: extra.documentFinalUrl || null,
        motifRefus: row.commentaire_rh || extra.motifRefus || null,
        dateCreation: row.cree_le ? new Date(row.cree_le).toISOString() : new Date().toISOString(),
        dateValidationDRH: row.date_validation_n1 ? new Date(row.date_validation_n1).toISOString() : null,
        dateTraitementRH: row.date_validation_rh ? new Date(row.date_validation_rh).toISOString() : null,
      };
    });

    return Response.json({ success: true, demandes });
  } catch (error: any) {
    console.error('[API Attestation] GET Error:', error);
    return Response.json({ error: 'Erreur chargement des demandes d\'attestation.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nom, prenom, societe, poste, motif } = body;

    if (!nom || !prenom || !societe || !motif) {
      return Response.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    const validSocietes = ['T-OIL', 'STSL', 'COMPEL'];
    if (!validSocietes.includes(societe)) {
      return Response.json({ error: 'Société invalide. Choisissez T-OIL, STSL ou COMPEL.' }, { status: 400 });
    }

    const id = generateId();
    const now = new Date();
    const nomComplet = `${nom} ${prenom}`.trim();
    const titre = `Attestation de Travail (${societe}) — ${nomComplet}`;

    const extraData = {
      nom,
      prenom,
      societe,
      poste: poste || '',
      motif,
    };

    const sql = `
      INSERT INTO demandes (
        id, titre, type_demande, statut, email_demandeur, nom_demandeur,
        motif, donnees_formulaire, cree_le, mis_a_jour_le
      ) VALUES (?, ?, 'ATTESTATION_TRAVAIL', 'EN_ATTENTE_DRH', ?, ?, ?, ?, ?, ?)
    `;

    await execute(sql, [
      id,
      titre,
      email.toLowerCase().trim(),
      nomComplet,
      motif,
      JSON.stringify(extraData),
      now,
      now,
    ]);

    // Email de notification à la DRH
    const settings = await getSystemSettings();
    const drhTargetEmail = settings.drhAttestationEmail || settings.drhEmail || 'drh@compel-toil.com';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
        <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 10px;">Nouvelle Demande d'Attestation de Travail</h2>
        <p>Une nouvelle demande d'attestation de travail a été soumise sur l'Intranet.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 40%;">Collaborateur :</td><td style="padding: 8px;">${nomComplet} (${email})</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Société :</td><td style="padding: 8px;"><strong>${societe}</strong></td></tr>
          ${poste ? `<tr><td style="padding: 8px; font-weight: bold;">Poste :</td><td style="padding: 8px;">${poste}</td></tr>` : ''}
          <tr><td style="padding: 8px; font-weight: bold;">Motif :</td><td style="padding: 8px;">${motif}</td></tr>
        </table>
        <div style="margin-top: 25px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL || ''}/demandes" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accéder au portail Intranet</a>
        </div>
      </div>
    `;

    sendLeaveNotificationEmail({
      to: drhTargetEmail,
      subject: `📄 Nouvelle Demande d'Attestation de Travail (${societe}) — ${nomComplet}`,
      html: emailHtml,
    }).catch((err) => console.error('[Email DRH Attestation Error]:', err));

    return Response.json(
      {
        success: true,
        message: 'Demande d\'attestation de travail transmise à la DRH.',
        id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API Attestation] POST Error:', error);
    return Response.json({ error: 'Erreur lors de la création de la demande.' }, { status: 500 });
  }
}
