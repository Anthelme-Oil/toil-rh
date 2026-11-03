import { prisma, withRetry } from '@/lib/prisma'
import type {
  CreateDayOffInput,
  DayOff,
  UpdateDayOffInput,
} from './types'

/**
 * Transforme le modèle Prisma en objet DayOff applicatif.
 */
function mapDatabaseDayOff(doc: any): DayOff {
  return {
    id: Number(doc.id),
    date: doc.date,
    name: doc.name ?? '',
    description: doc.description ?? null,
    isRecurring: Boolean(doc.isRecurring),
    isActive: Boolean(doc.isActive),
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  }
}

/**
 * Récupère tous les jours fériés actifs d'une année.
 */
export async function findDayOffsByYear(year: number): Promise<DayOff[]> {
  return withRetry(async () => {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)

    const rows = await prisma.calendarDayOff.findMany({
      where: {
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
        isActive: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return rows.map(mapDatabaseDayOff)
  })
}

/**
 * Recherche un jour férié par sa date (ISO ou YYYY-MM-DD).
 */
export async function findDayOffByDate(dateStr: string): Promise<DayOff | null> {
  return withRetry(async () => {
    const targetDate = new Date(dateStr)

    const row = await prisma.calendarDayOff.findFirst({
      where: {
        date: targetDate,
      },
    })

    if (!row) return null
    return mapDatabaseDayOff(row)
  })
}

/**
 * Recherche un jour férié par son identifiant.
 */
export async function findDayOffById(id: number): Promise<DayOff | null> {
  return withRetry(async () => {
    const row = await prisma.calendarDayOff.findUnique({
      where: { id },
    })

    if (!row) return null
    return mapDatabaseDayOff(row)
  })
}

/**
 * Crée un nouveau jour férié.
 */
export async function createDayOff(input: CreateDayOffInput): Promise<DayOff> {
  return withRetry(async () => {
    const created = await prisma.calendarDayOff.create({
      data: {
        date: new Date(input.date),
        name: input.name,
        description: input.description ?? null,
        isRecurring: input.isRecurring ?? false,
        isActive: true,
      },
    })

    return mapDatabaseDayOff(created)
  })
}

/**
 * Réactive un jour férié précédemment désactivé.
 */
export async function reactivateDayOff(
  id: number,
  input: CreateDayOffInput
): Promise<DayOff> {
  return withRetry(async () => {
    const updated = await prisma.calendarDayOff.update({
      where: { id },
      data: {
        date: new Date(input.date),
        name: input.name,
        description: input.description ?? null,
        isRecurring: input.isRecurring ?? false,
        isActive: true,
      },
    })

    return mapDatabaseDayOff(updated)
  })
}

/**
 * Met à jour un jour férié.
 */
export async function updateDayOff(
  id: number,
  input: UpdateDayOffInput
): Promise<DayOff> {
  return withRetry(async () => {
    const updated = await prisma.calendarDayOff.update({
      where: { id },
      data: {
        ...(input.date !== undefined && { date: new Date(input.date) }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isRecurring !== undefined && { isRecurring: input.isRecurring }),
      },
    })

    return mapDatabaseDayOff(updated)
  })
}

/**
 * Désactive un jour férié (Soft Delete).
 */
export async function deactivateDayOff(id: number): Promise<void> {
  return withRetry(async () => {
    await prisma.calendarDayOff.update({
      where: { id },
      data: {
        isActive: false,
      },
    })
  })
}

/**
 * Supprime définitivement un jour férié.
 */
export async function deleteDayOff(id: number): Promise<void> {
  return withRetry(async () => {
    await prisma.calendarDayOff.delete({
      where: { id },
    })
  })
}