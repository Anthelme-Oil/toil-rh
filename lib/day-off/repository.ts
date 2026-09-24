import { execute, query } from '../db'
import type {
  CreateDayOffInput,
  DayOff,
  UpdateDayOffInput,
} from './types'

/**
 * Récupère tous les jours fériés actifs d'une année.
 */
export async function findDayOffsByYear(
  year: number
): Promise<DayOff[]> {
  const rows = await query<any>(
    `
      SELECT
        id,
        date,
        name,
        description,
        isRecurring,
        isActive,
        createdAt,
        updatedAt
      FROM calendarDayOff
      WHERE YEAR(date) = ?
        AND isActive = 1
      ORDER BY date ASC
    `,
    [year]
  )

  return rows.map(mapDatabaseDayOff)
}

/**
 * Recherche un jour férié par sa date.
 *
 * On recherche également les jours désactivés afin de pouvoir
 * les réactiver depuis le service.
 */
export async function findDayOffByDate(
  date: string
): Promise<DayOff | null> {
  const rows = await query<any>(
    `
      SELECT
        id,
        date,
        name,
        description,
        isRecurring,
        isActive,
        createdAt,
        updatedAt
      FROM calendarDayOff
      WHERE DATE(date) = ?
      LIMIT 1
    `,
    [date]
  )

  if (rows.length === 0) {
    return null
  }

  return mapDatabaseDayOff(rows[0])
}

/**
 * Recherche un jour férié par son identifiant.
 */
export async function findDayOffById(
  id: number
): Promise<DayOff | null> {
  const rows = await query<any>(
    `
      SELECT
        id,
        date,
        name,
        description,
        isRecurring,
        isActive,
        createdAt,
        updatedAt
      FROM calendarDayOff
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  )

  if (rows.length === 0) {
    return null
  }

  return mapDatabaseDayOff(rows[0])
}

/**
 * Crée un nouveau jour férié.
 *
 * L'id est généré automatiquement par MySQL
 * grâce à AUTO_INCREMENT.
 */
export async function createDayOff(
  input: CreateDayOffInput
): Promise<DayOff> {
  const now = new Date()

  const result = await execute(
    `
      INSERT INTO calendarDayOff (
        date,
        name,
        description,
        isRecurring,
        isActive,
        createdAt,
        updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.date,
      input.name,
      input.description ?? null,
      input.isRecurring ? 1 : 0,
      1,
      now,
      now,
    ]
  )

  const dayOff = await findDayOffById(result.insertId)

  if (!dayOff) {
    throw new Error(
      `Jour férié créé mais introuvable ensuite : ${input.date}`
    )
  }

  return dayOff
}

/**
 * Réactive un jour férié précédemment désactivé.
 */
export async function reactivateDayOff(
  id: number,
  input: CreateDayOffInput
): Promise<DayOff> {
  const now = new Date()

  await execute(
    `
      UPDATE calendarDayOff
      SET
        date = ?,
        name = ?,
        description = ?,
        isRecurring = ?,
        isActive = 1,
        updatedAt = ?
      WHERE id = ?
    `,
    [
      input.date,
      input.name,
      input.description ?? null,
      input.isRecurring ? 1 : 0,
      now,
      id,
    ]
  )

  const dayOff = await findDayOffById(id)

  if (!dayOff) {
    throw new Error(
      'Jour férié introuvable après réactivation'
    )
  }

  return dayOff
}

/**
 * Met à jour un jour férié.
 */
export async function updateDayOff(
  id: number,
  input: UpdateDayOffInput
): Promise<DayOff> {
  const fields: string[] = []
  const values: unknown[] = []

  if (input.date !== undefined) {
    fields.push('date = ?')
    values.push(input.date)
  }

  if (input.name !== undefined) {
    fields.push('name = ?')
    values.push(input.name)
  }

  if (input.description !== undefined) {
    fields.push('description = ?')
    values.push(input.description)
  }

  if (input.isRecurring !== undefined) {
    fields.push('isRecurring = ?')
    values.push(input.isRecurring ? 1 : 0)
  }

  /**
   * Aucun champ à modifier :
   * on retourne simplement l'enregistrement existant.
   */
  if (fields.length === 0) {
    const existing = await findDayOffById(id)

    if (!existing) {
      throw new Error('Jour férié introuvable')
    }

    return existing
  }

  fields.push('updatedAt = ?')
  values.push(new Date())

  values.push(id)

  await execute(
    `
      UPDATE calendarDayOff
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    values
  )

  const dayOff = await findDayOffById(id)

  if (!dayOff) {
    throw new Error(
      'Jour férié introuvable après modification'
    )
  }

  return dayOff
}

/**
 * Désactive un jour férié.
 *
 * On ne supprime pas réellement la ligne de la base.
 */
export async function deactivateDayOff(
  id: number
): Promise<void> {
  await execute(
    `
      UPDATE calendarDayOff
      SET
        isActive = 0,
        updatedAt = ?
      WHERE id = ?
    `,
    [new Date(), id]
  )
}

export async function deleteDayOff(id: number): Promise<void> {
  await execute(
    `
      DELETE FROM calendarDayOff
      WHERE id = ?
    `,
    [id]
  )
}

/**
 * Transforme une ligne MySQL en objet DayOff.
 */
function mapDatabaseDayOff(row: any): DayOff {
  return {
    id: Number(row.id),
    date: row.date,
    name: row.name ?? '',
    description: row.description ?? null,
    isRecurring: Boolean(row.isRecurring),
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  }
}