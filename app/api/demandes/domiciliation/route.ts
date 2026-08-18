// ═══════════════════════════════════════════════════════════════
// API Route — Domiciliation Bancaire (Creation & Query)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { execute, query, generateId } from '@/lib/db';
import { processAndSaveAttachments } from '@/lib/storage';
import { sendLeaveNotificationEmail, getEmailTemplateDomiciliationDRH } from '@/lib/email';

export async function GET(request: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'collaborateur';

  try {
    let sql = `SELECT * FROM demandes WHERE type_demande = 'DOMICILIATION_BANCAIRE'`;
    const params: any[] = [];

    if (role === 'collaborateur') {
      sql += ` AND LOWER(email_demandeur) = ?`;
      params.push(userEmail.toLowerCase().trim());
    } else if (role === 'drh') {
      // DRH voit toutes les demandes ou celles en attente de sa validation
      sql += ` AND (statut = 'EN_ATTENTE_DRH' OR statut = 'VALIDEE_DRH' OR statut = 'REFUSEE_DRH')`;
    } else if (role === 'rh') {
      // RH Traitement voit les demandes validées par la DRH ou traitées
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
        titre: row.titre || 'Demande de domiciliation bancaire',
        typeDemande: 'domiciliation_bancaire',
        statut: row.statut, // EN_ATTENTE_DRH, VALIDEE_DRH, REFUSEE_DRH, TRAITEE
        nomDemandeur: row.nom_demandeur,
        emailDemandeur: row.email_demandeur,
        matricule: extra.matricule || '',
        nom: extra.nom || row.nom_demandeur?.split(' ')[0] || '',
        prenom: extra.prenom || row.nom_demandeur?.split(' ').slice(1).join(' ') || '',
        societe: extra.societe || 'T-Oil',
        poste: extra.poste || '',
        departement: extra.departement || '',
        objetDemande: extra.objetDemande || 'Mise à jour de dossier bancaire',
        emailPro: extra.emailPro || row.email_demandeur || '',
        telephone: extra.telephone || '',
        banque: extra.banque || '',
        agenceBancaire: extra.agenceBancaire || '',
        dateSouhaitee: extra.dateSouhaitee || '',
        commentaire: row.motif || extra.commentaire || '',
        ribUrl: row.piece_jointe || extra.ribUrl || '',
        documentFinalUrl: extra.documentFinalUrl || null,
        motifRefus: row.commentaire_rh || extra.motifRefus || null,
        dateCreation: row.cree_le ? new Date(row.cree_le).toISOString() : new Date().toISOString(),
        dateValidationDRH: row.date_validation_n1 ? new Date(row.date_validation_n1).toISOString() : null,
        dateTraitementRH: row.date_validation_rh ? new Date(row.date_validation_rh).toISOString() : null,
      };
    });

    return Response.json({ success: true, demandes });
  } catch (error: any) {
    console.error('[API Domiciliation] GET Error:', error);
    return Response.json({ error: 'Erreur chargement des demandes.' }, { status: 500 });
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
    const {
      matricule,
      nom,
      prenom,
      societe,
      poste,
      departement,
      objetDemande,
      emailPro,
      telephone,
      banque,
      agenceBancaire,
      dateSouhaitee,
      commentaire,
      pieceJointe,
    } = body;

    if (!matricule || !nom || !prenom || !societe || !poste || !departement || !objetDemande) {
      return Response.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    let ribUrl = '';
    let pieceJointeName = '';

    // Sauvegarde physique de la pièce jointe (RIB) si présente
    if (pieceJointe) {
      const processedAttachments = await processAndSaveAttachments([pieceJointe]);
      ribUrl = processedAttachments[0]?.url || '';
      pieceJointeName = pieceJointe.name;
    }

    const id = generateId();
    const now = new Date();
    const nomComplet = `${nom} ${prenom}`.trim();
    const titre = `Domiciliation Bancaire (${objetDemande || 'Demande'}) — ${nomComplet} [${societe || 'T-Oil'}]`;

    const extraData = {
      matricule: matricule.trim(),
      nom: nom.trim(),
      prenom: prenom.trim(),
      societe: societe || 'T-Oil',
      poste: poste.trim(),
      departement: departement.trim(),
      objetDemande: objetDemande || 'Mise à jour de dossier bancaire',
      emailPro: (emailPro || email).trim(),
      telephone: (telephone || '').trim(),
      banque: banque || '',
      agenceBancaire: agenceBancaire || '',
      dateSouhaitee: dateSouhaitee || '',
      commentaire: (commentaire || '').trim(),
      ribUrl,
      ribFilename: pieceJointeName,
    };

    const sql = `
      INSERT INTO demandes (
        id, titre, type_demande, statut, email_demandeur, nom_demandeur,
        motif, piece_jointe, donnees_formulaire, cree_le, mis_a_jour_le
      ) VALUES (?, ?, 'DOMICILIATION_BANCAIRE', 'EN_ATTENTE_DRH', ?, ?, ?, ?, ?, ?, ?)
    `;

    await execute(sql, [
      id,
      titre,
      (emailPro || email).toLowerCase().trim(),
      nomComplet,
      commentaire || '',
      ribUrl,
      JSON.stringify(extraData),
      now,
      now,
    ]);

    // Envoi de la notification à la DRH
    const emailHtml = getEmailTemplateDomiciliationDRH({
      demandeurNom: nomComplet,
      banque: banque || 'Non spécifiée',
      agenceBancaire: agenceBancaire || 'Non spécifiée',
      dateSouhaitee: dateSouhaitee || new Date().toISOString().split('T')[0],
    });

    // Email adressé à la DRH
    sendLeaveNotificationEmail({
      to: process.env.DRH_EMAIL || 'drh@togosh.com',
      subject: `🏛️ Nouvelle Demande de Domiciliation Bancaire — ${nomComplet}`,
      html: emailHtml,
    }).catch((err) => console.error('[Email DRH Error]:', err));

    return Response.json(
      {
        success: true,
        message: 'Demande de domiciliation bancaire transmise à la DRH.',
        id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API Domiciliation] POST Error:', error);
    return Response.json({ error: 'Erreur lors de la création de la demande.' }, { status: 500 });
  }
}
