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
const TYPES_VALIDES: TypeDemande[] = ['materiel', 'acces', 'it', 'rh'];
const PRIORITES_VALIDES: PrioriteDemande[] = ['basse', 'normale', 'haute', 'urgente'];

/**
 * GET /api/demandes
 * Récupère les demandes de l'utilisateur connecté.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json(
      { error: 'Non authentifié. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const demandes = await getDemandesUtilisateur(session.user.email);

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
 *
 * Body attendu :
 * {
 *   titre: string,
 *   type: 'materiel' | 'acces' | 'it' | 'rh',
 *   description: string,
 *   priorite: 'basse' | 'normale' | 'haute' | 'urgente'
 * }
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email || !session?.user?.name) {
    return Response.json(
      { error: 'Non authentifié. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

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
        { error: `Type invalide. Valeurs acceptées : ${TYPES_VALIDES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return Response.json(
        { error: 'La description est requise (minimum 10 caractères).' },
        { status: 400 }
      );
    }

    if (!PRIORITES_VALIDES.includes(priorite)) {
      return Response.json(
        { error: `Priorité invalide. Valeurs acceptées : ${PRIORITES_VALIDES.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Construction de la demande ──
    const demande: DemandeInterne = {
      titre: titre.trim(),
      type,
      description: description.trim(),
      priorite,
      demandeurEmail: session.user.email,
      demandeurNom: session.user.name,
    };

    // ── Insertion dans Microsoft List ──
    const id = await creerDemande(demande);

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
