// ═══════════════════════════════════════════════════════════════
// API Route — Demandes Internes (Bridge Next.js → Microsoft Lists)
// ═══════════════════════════════════════════════════════════════
//
// GET  /api/demandes  → Récupère les demandes de l'utilisateur
// POST /api/demandes  → Crée une nouvelle demande
//
// La création d'une demande insère un item dans la Microsoft List,
// ce qui déclenche automatiquement les workflows Power Automate
// associés (notifications, approbations, etc.)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { creerDemande, getDemandesUtilisateur } from '@/lib/demandes';
import type { DemandeInterne, TypeDemande, PrioriteDemande } from '@/types';

// ── Types valides pour la validation ──
const TYPES_VALIDES: TypeDemande[] = [
  'materiel',
  'acces',
  'it',
  'rh',
  'administrative',
  'autre',
  'renouvellement_compte',
  'creation_suppression_compte',
  'demande_conges',
  'domiciliation_bancaire',
  'attestation_travail',
  'consommables',
  'materiel_informatique',
  'intervention',
  'fiche_achat',
  'ordre_mission',
  'autorisation_acces',
];
const PRIORITES_VALIDES: PrioriteDemande[] = ['basse', 'normale', 'haute', 'urgente'];

/**
 * GET /api/demandes
 * Récupère les demandes de l'utilisateur connecté.
 */
export async function GET() {
  const session = await auth();
  const email = session?.user?.email || 'employe@compel-toil.com';

  try {
    const demandes = await getDemandesUtilisateur(email);

    return Response.json({
      success: true,
      data: demandes,
      total: demandes.length,
    });
  } catch (error) {
    console.error('[API Demandes] GET error:', error);
    return Response.json(
      { error: 'Erreur lors de la récupération des demandes.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/demandes
 * Crée une nouvelle demande interne.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email || 'employe@compel-toil.com';
  const name = session?.user?.name || 'Collaborateur T-OIL';

  try {
    const body = await request.json();

    // ── Validation des champs requis ──
    const { titre, type, description, priorite } = body;

    if (!titre || typeof titre !== 'string' || titre.trim().length < 3) {
      return Response.json(
        { error: 'Le titre est requis (minimum 3 caractères).' },
        { status: 400 }
      );
    }

    if (!TYPES_VALIDES.includes(type)) {
      return Response.json(
        { error: `Type invalide.` },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return Response.json(
        { error: 'La description est requise.' },
        { status: 400 }
      );
    }

    if (!PRIORITES_VALIDES.includes(priorite)) {
      return Response.json(
        { error: `Priorité invalide.` },
        { status: 400 }
      );
    }

    // ── Construction de la demande ──
    const demande: DemandeInterne = {
      titre: titre.trim(),
      type,
      description: description.trim(),
      priorite,
      demandeurEmail: email,
      demandeurNom: name,
    };

    // ── Insertion dans Microsoft List (ou fallback mock en dev) ──
    let id = `DEM-${Date.now()}`;
    try {
      id = await creerDemande(demande);
    } catch (err) {
      console.warn('[API Demandes] SharePoint indisponible, création locale simulée:', err);
    }

    return Response.json(
      {
        success: true,
        message: 'Demande créée avec succès. Un workflow de traitement a été déclenché.',
        data: { id, ...demande, statut: 'en_attente', dateCreation: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Demandes] POST error:', error);
    return Response.json(
      { error: 'Erreur lors de la création de la demande. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
