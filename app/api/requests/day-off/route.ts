import { NextRequest, NextResponse } from 'next/server'

import {
  addDayOff,
  getDayOffsByYear,
  removeDayOff,
} from '@/lib/day-off/service'

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function getErrorStatus(message: string): number {
  if (
    message.includes('déjà définie') ||
    message.includes('déjà retiré')
  ) {
    return 409
  }

  if (
    message.includes('introuvable') ||
    message.includes('Identifiant')
  ) {
    return 404
  }

  if (
    message.includes('invalide') ||
    message.includes('obligatoire') ||
    message.includes('doit être')
  ) {
    return 400
  }

  return 500
}

/**
 * GET /api/requests/day-off?year=2026
 */
export async function GET(request: NextRequest) {
  try {
    const yearParam = request.nextUrl.searchParams.get('year')

    const year = yearParam
      ? Number(yearParam)
      : new Date().getFullYear()

    if (!Number.isInteger(year)) {
      return NextResponse.json(
        {
          success: false,
          message: "L'année doit être un nombre entier.",
        },
        { status: 400 }
      )
    }

    const dayOffs = await getDayOffsByYear(year)

    return NextResponse.json({
      success: true,
      data: dayOffs,
    })
  } catch (error) {
    console.error('[GET /api/requests/day-off]', error)

    const message = getErrorMessage(
      error,
      'Erreur lors de la récupération des jours fériés'
    )

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: getErrorStatus(message) }
    )
  }
}

/**
 * POST /api/requests/day-off
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const dayOff = await addDayOff({
      date: body.date,
      name: body.name,
      description: body.description,
      isRecurring: body.isRecurring,
    })

    return NextResponse.json(
      {
        success: true,
        data: dayOff,
        message: 'Jour férié ajouté avec succès.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/requests/day-off]', error)

    const message = getErrorMessage(
      error,
      "Impossible d'ajouter le jour férié"
    )

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: getErrorStatus(message) }
    )
  }
}

/**
 * DELETE /api/requests/day-off
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const id = Number(body.id)

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Identifiant du jour férié invalide.',
        },
        { status: 400 }
      )
    }

    await removeDayOff(id)

    return NextResponse.json({
      success: true,
      message: 'Jour férié retiré avec succès.',
    })
  } catch (error) {
    console.error('[DELETE /api/requests/day-off]', error)

    const message = getErrorMessage(
      error,
      'Impossible de retirer le jour férié'
    )

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: getErrorStatus(message) }
    )
  }
}