import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPermissionsByEmail } from '@/lib/roles';
import { query } from '@/lib/db';
import { mapRowToDemandeConge } from '@/lib/demandes';

/**
 * GET /api/demandes/conges/[id]
 * Récupère les détails complets d'une demande de congé spécifique,
 * y compris les profils du demandeur et du manager.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email;

    if (!sessionEmail) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    // 1. Récupérer la demande
    const demandes = await query<any>(
      'SELECT * FROM demandes WHERE id = ? AND type_demande = "CONGE"',
      [id]
    );

    if (demandes.length === 0) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    const row = demandes[0];
    const cleanSessionEmail = sessionEmail.toLowerCase().trim();
    const cleanDemandeurEmail = row.email_demandeur?.toLowerCase().trim();
    const cleanManagerEmail = row.email_manager?.toLowerCase().trim();

    // 2. Vérifier les autorisations
    const perms = await getUserPermissionsByEmail(sessionEmail);
    const isOwner = cleanSessionEmail === cleanDemandeurEmail;
    const isManager = cleanSessionEmail === cleanManagerEmail;
    const isRHOrAdmin = perms.isRH || perms.isAdmin;

    if (!isOwner && !isManager && !isRHOrAdmin) {
      return NextResponse.json({ error: 'Accès refusé à cette demande' }, { status: 403 });
    }

    // 3. Récupérer les informations complémentaires du demandeur
    const demandeurInfos = await query<any>(
      'SELECT nom, email, departement, poste FROM utilisateurs WHERE email = ?',
      [cleanDemandeurEmail]
    );

    // 4. Récupérer les informations complémentaires du manager
    let managerName = '';
    let managerPoste = '';
    if (cleanManagerEmail) {
      const managerInfos = await query<any>(
        'SELECT nom, poste FROM utilisateurs WHERE email = ?',
        [cleanManagerEmail]
      );
      if (managerInfos.length > 0) {
        managerName = managerInfos[0].nom;
        managerPoste = managerInfos[0].poste || 'Supérieur Hiérarchique N+1';
      }
    }

    const mappedDemande = mapRowToDemandeConge(row);

    return NextResponse.json({
      success: true,
      demande: {
        ...mappedDemande,
        dateValidationN1: row.date_validation_n1 ? new Date(row.date_validation_n1).toISOString() : null,
        commentaireN1: row.commentaire_n1 || '',
        statutN1: row.statut_n1 || 'EN_ATTENTE',
        dateValidationRH: row.date_validation_rh ? new Date(row.date_validation_rh).toISOString() : null,
        commentaireRH: row.commentaire_rh || '',
        statutRH: row.statut_rh || 'EN_ATTENTE',
        demandeurPoste: demandeurInfos[0]?.poste || 'Collaborateur',
        demandeurDepartement: demandeurInfos[0]?.departement || 'T-OIL',
        managerNom: managerName || cleanManagerEmail || 'N+1 non défini',
        managerPoste: managerPoste,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
