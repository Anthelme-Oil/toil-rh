
import {
  createDayOff,
  deactivateDayOff,
  findDayOffByDate,
  findDayOffsByYear,
  findDayOffById,
  deleteDayOff,
} from './repository'

import type {
  CreateDayOffInput,
} from './types'

/**
 * Normalise et valide une date au format YYYY-MM-DD.
 */
function normalizeDate(date: string): string {
  if (!date || typeof date !== 'string') {
    throw new Error('La date est obligatoire')
  }

  const trimmedDate = date.trim()

  // Vérification stricte du format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/

  if (!dateRegex.test(trimmedDate)) {
    throw new Error(
      'La date doit être au format YYYY-MM-DD'
    )
  }

  const parsedDate = new Date(
    `${trimmedDate}T00:00:00`
  )

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Date invalide')
  }

  // Vérification supplémentaire pour éviter
  // des dates comme 2026-02-31.
  const [year, month, day] = trimmedDate
    .split('-')
    .map(Number)

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new Error('Date invalide')
  }

  return trimmedDate
}

/**
 * Récupère les jours fériés d'une année.
 */
export async function getDayOffsByYear(
  year: number
) {
  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    throw new Error('Année invalide')
  }

  return findDayOffsByYear(year)
}

/**
 * Ajoute un jour férié.
 */
export async function addDayOff(
  input: CreateDayOffInput
) {
  if (!input) {
    throw new Error(
      'Les données du jour férié sont obligatoires'
    )
  }

  const date = normalizeDate(input.date)

  const name = input.name?.trim()

  if (!name) {
    throw new Error(
      'Le nom du jour férié est obligatoire'
    )
  }

  if (name.length > 191) {
    throw new Error(
      'Le nom du jour férié ne peut pas dépasser 191 caractères'
    )
  }

  const description =
    input.description?.trim() || null

  /*
   * Vérification métier :
   * les jours fériés sont uniquement enregistrés
   * sur les jours ouvrables.
   */
  const parsedDate = new Date(
    `${date}T00:00:00`
  )

  const dayOfWeek = parsedDate.getDay()

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    throw new Error(
      'Un jour férié ne peut pas être ajouté sur un week-end'
    )
  }

  /*
   * Vérification d'une éventuelle entrée existante.
   */
  const existingDayOff =
    await findDayOffByDate(date)

  if (existingDayOff) {
    if (existingDayOff.isActive) {
      throw new Error(
        'Cette date est déjà définie comme jour férié'
      )
    }

    /*
     * Si l'entrée existe mais a été désactivée,
     * on la réactive.
     *
     * Si ton repository ne possède pas encore
     * reactivateDayOff(), on peut simplement supprimer
     * cette partie et utiliser updateDayOff().
     */
    throw new Error(
      'Un jour férié existe déjà pour cette date mais il est désactivé'
    )
  }

  return createDayOff({
    date,
    name,
    description,
    isRecurring:
      input.isRecurring ?? false,
  })
}

/**
 * Supprime logiquement un jour férié.
 *
 * L'enregistrement n'est pas supprimé physiquement :
 * is_active passe à 0.
 */
export async function removeDayOff(
  id: number
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      'Identifiant du jour férié invalide'
    )
  }

  const existingDayOff =
    await findDayOffById(id)

  if (!existingDayOff) {
    throw new Error(
      'Jour férié introuvable'
    )
  }

  if (!existingDayOff.isActive) {
    throw new Error(
      'Ce jour férié est déjà retiré'
    )
  }

//   await deactivateDayOff(id)
  await deleteDayOff(id)
}
