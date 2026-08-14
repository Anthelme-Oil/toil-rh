import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Salles de réunion officielles de T-OIL
const SALLES_INITIALES = [
  {
    code: 'GRANDE_SALLE',
    nom: 'Grande Salle',
    capacite: 30,
    emplacement: 'Siège T-OIL — 1er Étage',
    equipements: ['Écran géant 4K', 'Visioconférence Teams', 'Tableau blanc', 'Sonorisation', 'Climatisation'],
  },
  {
    code: 'HALL_DG',
    nom: 'Hall DG',
    capacite: 12,
    emplacement: 'Direction Générale — RDC',
    equipements: ['Écran 4K', 'Visioconférence', 'Tableau blanc', 'Climatisation'],
  },
  {
    code: 'HALL_COMMERCIAL',
    nom: 'Hall Commercial',
    capacite: 10,
    emplacement: 'Direction Commerciale — RDC',
    equipements: ['Écran HD', 'Visioconférence', 'Tableau blanc'],
  },
  {
    code: 'HALL_OPERATION',
    nom: 'Hall Opération',
    capacite: 15,
    emplacement: 'Direction des Opérations — Bâtiment B',
    equipements: ['Écran HD', 'Visioconférence', 'Tableau blanc', 'Climatisation'],
  },
  {
    code: 'HALL_FINANCE',
    nom: 'Hall Finance',
    capacite: 10,
    emplacement: 'Direction Financière — 1er Étage',
    equipements: ['Écran HD', 'Visioconférence', 'Climatisation'],
  },
  {
    code: 'JURIDIQUE',
    nom: 'Petite Salle Juridique',
    capacite: 8,
    emplacement: 'Direction Juridique — 2ème Étage',
    equipements: ['Écran HD', 'Visioconférence'],
  },
];

// Assure l'existence des 6 salles T-OIL dans la base
async function initialiserSallesSiBesoin() {
  const count = await withRetry(() => prisma.salle.count());
  if (count === 0) {
    for (const salle of SALLES_INITIALES) {
      await withRetry(() =>
        prisma.salle.create({
          data: {
            code: salle.code,
            nom: salle.nom,
            capacite: salle.capacite,
            emplacement: salle.emplacement,
            equipements: salle.equipements,
            estActive: true,
          },
        })
      );
    }
  }
}

/**
 * GET /api/reservations?date=YYYY-MM-DD
 * Récupère toutes les salles et leurs réservations pour la date demandée.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateQuery = searchParams.get('date') || new Date().toISOString().split('T')[0];

    await initialiserSallesSiBesoin();

    // Plage du jour sélectionné (00:00:00 à 23:59:59 UTC)
    const debutJour = new Date(`${dateQuery}T00:00:00.000Z`);
    const finJour = new Date(`${dateQuery}T23:59:59.999Z`);

    const salles = await withRetry(() =>
      prisma.salle.findMany({
        where: { estActive: true },
        include: {
          reservations: {
            where: {
              date: {
                gte: debutJour,
                lte: finJour,
              },
              statut: 'CONFIRMEE',
            },
            orderBy: { heureDebut: 'asc' },
          },
        },
        orderBy: { nom: 'asc' },
      })
    );

    return NextResponse.json({ date: dateQuery, salles }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('[API Réservations GET] Erreur:', error);
    const msg = error instanceof Error ? error.message : 'Erreur lors de la récupération des réservations.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/reservations
 * Crée une nouvelle réservation de salle avec vérification d'anti-chevauchement (Anti-Surbooking).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salleId, titre, demandeurNom, demandeurEmail, date, heureDebut, heureFin, participants, motif } = body;

    if (!salleId || !titre || !demandeurNom || !demandeurEmail || !date || !heureDebut || !heureFin) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires (salle, titre, demandeur, date, heure début/fin) doivent être renseignés.' },
        { status: 400 }
      );
    }

    if (heureDebut >= heureFin) {
      return NextResponse.json(
        { error: 'L\'heure de début doit être strictement antérieure à l\'heure de fin.' },
        { status: 400 }
      );
    }

    const dateISO = new Date(`${date}T00:00:00.000Z`);

    // 1. Vérifier si la salle existe et est active
    const salle = await withRetry(() => prisma.salle.findUnique({ where: { id: salleId } }));
    if (!salle || !salle.estActive) {
      return NextResponse.json({ error: 'La salle sélectionnée est introuvable ou indisponible.' }, { status: 404 });
    }

    // 2. Vérification des conflits d'horaires (Anti-Surbooking)
    const debutJour = new Date(`${date}T00:00:00.000Z`);
    const finJour = new Date(`${date}T23:59:59.999Z`);

    const reservationsExistantes = await withRetry(() =>
      prisma.reservationSalle.findMany({
        where: {
          salleId,
          date: {
            gte: debutJour,
            lte: finJour,
          },
          statut: 'CONFIRMEE',
        },
      })
    );

    // Un chevauchement existe si : (heureDebutExistante < inputHeureFin) ET (heureFinExistante > inputHeureDebut)
    const conflit = reservationsExistantes.find((res) => {
      return res.heureDebut < heureFin && res.heureFin > heureDebut;
    });

    if (conflit) {
      return NextResponse.json(
        {
          error: `Conflit d'horaire : La salle "${salle.nom}" est déjà réservée de ${conflit.heureDebut} à ${conflit.heureFin} par ${conflit.demandeurNom} (${conflit.titre}).`,
        },
        { status: 409 }
      );
    }

    // 3. Création de la réservation
    const nouvelleReservation = await withRetry(() =>
      prisma.reservationSalle.create({
        data: {
          salleId,
          titre,
          demandeurNom,
          demandeurEmail,
          date: dateISO,
          heureDebut,
          heureFin,
          participants: participants ? parseInt(participants, 10) : 1,
          motif: motif || null,
          statut: 'CONFIRMEE',
        },
        include: {
          salle: true,
        },
      })
    );

    return NextResponse.json(
      {
        success: true,
        reservation: nouvelleReservation,
        message: `Réservation enregistrée avec succès pour la salle "${salle.nom}" le ${date} de ${heureDebut} à ${heureFin}.`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[API Réservations POST] Erreur:', error);
    const msg = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement de la réservation.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/reservations?id=...
 * Annule une réservation existante.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de la réservation requis.' }, { status: 400 });
    }

    await withRetry(() =>
      prisma.reservationSalle.update({
        where: { id },
        data: { statut: 'ANNULEE' },
      })
    );

    return NextResponse.json({ success: true, message: 'Réservation annulée avec succès.' });
  } catch (error: unknown) {
    console.error('[API Réservations DELETE] Erreur:', error);
    const msg = error instanceof Error ? error.message : 'Erreur lors de l\'annulation.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
