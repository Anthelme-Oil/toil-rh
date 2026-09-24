
'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react'

interface DayOff {
  id: number
  date: string
  name: string
  description: string | null
  is_recurring: boolean
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export default function Calendar() {
  const today = new Date()

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const [dayOffs, setDayOffs] = useState<DayOff[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [holidayName, setHolidayName] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ]

  const dayNames = [
    'Dim',
    'Lun',
    'Mar',
    'Mer',
    'Jeu',
    'Ven',
    'Sam',
  ]

  /*
   * ---------------------------------------------------------
   * Date helpers
   * ---------------------------------------------------------
   */

  const formatDateKey = (
    year: number,
    month: number,
    day: number
  ) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`
  }

  const currentDateKey = (day: number) => {
    return formatDateKey(currentYear, currentMonth, day)
  }

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const firstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isWeekend = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay()

    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const isPastDate = (day: number) => {
    const date = new Date(
      currentYear,
      currentMonth,
      day
    )

    const comparison = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    return date < comparison
  }

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  const isMonthPassed = useMemo(() => {
    const lastDay = new Date(
      currentYear,
      currentMonth,
      daysInMonth(currentMonth, currentYear)
    )

    const comparison = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    return lastDay < comparison
  }, [currentMonth, currentYear, today])

  /*
   * ---------------------------------------------------------
   * Chargement des jours fériés
   * ---------------------------------------------------------
   */

  const loadDayOffs = async (year: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/requests/day-off?year=${year}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Impossible de récupérer les jours fériés'
        )
      }

      setDayOffs(result.data ?? [])
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors du chargement'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDayOffs(currentYear)
  }, [currentYear])

  /*
   * ---------------------------------------------------------
   * Recherche d'un jour férié
   * ---------------------------------------------------------
   */

  const getDayOff = (day: number) => {
    const dateKey = currentDateKey(day)

    return dayOffs.find((item) => {
      const itemDate = item.date.slice(0, 10)

      return itemDate === dateKey
    })
  }

  /*
   * ---------------------------------------------------------
   * Navigation
   * ---------------------------------------------------------
   */

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentYear, currentMonth - 1, 1)
    )
  }

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentYear, currentMonth + 1, 1)
    )
  }

  /*
   * ---------------------------------------------------------
   * Ouverture du modal
   * ---------------------------------------------------------
   */

  const handleDayClick = (day: number) => {
    const isPast = isPastDate(day)
    const isWeekendDay = isWeekend(day)

    if (isPast || isWeekendDay || isMonthPassed) {
      return
    }

    const existingDayOff = getDayOff(day)

    setSelectedDay(day)
    setHolidayName(existingDayOff?.name ?? '')
    setError(null)
    setShowModal(true)
  }

  /*
   * ---------------------------------------------------------
   * Ajouter un jour férié
   * ---------------------------------------------------------
   */

  const addDayOff = async () => {
    if (selectedDay === null) {
      return
    }

    const name = holidayName.trim()

    if (!name) {
      setError(
        'Veuillez renseigner le nom du jour férié.'
      )
      return
    }

    try {
      setSaving(true)
      setError(null)

      const date = currentDateKey(selectedDay)

      const response = await fetch(
        '/api/requests/day-off',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date,
            name,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Impossible d'ajouter le jour férié"
        )
      }

      /*
       * On recharge depuis la base afin d'avoir
       * exactement l'état enregistré côté serveur.
       */
      await loadDayOffs(currentYear)

      setHolidayName('')
      setSelectedDay(null)
      setShowModal(false)
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter le jour férié"
      )
    } finally {
      setSaving(false)
    }
  }

  /*
   * ---------------------------------------------------------
   * Supprimer un jour férié
   * ---------------------------------------------------------
   */

  const removeDayOff = async (dayOff: DayOff) => {
    try {
      setDeletingId(dayOff.id)
      setError(null)

      const response = await fetch(
        '/api/requests/day-off',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: dayOff.id,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Impossible de retirer le jour férié'
        )
      }

      /*
       * On retire immédiatement l'élément de l'affichage.
       */
      setDayOffs((prev) =>
        prev.filter((item) => item.id !== dayOff.id)
      )

      /*
       * Si le modal concernait ce jour,
       * on le ferme également.
       */
      if (
        selectedDay !== null &&
        currentDateKey(selectedDay) ===
          dayOff.date.slice(0, 10)
      ) {
        setSelectedDay(null)
        setShowModal(false)
      }
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Impossible de retirer le jour férié'
      )
    } finally {
      setDeletingId(null)
    }
  }

  /*
   * ---------------------------------------------------------
   * Jours du mois
   * ---------------------------------------------------------
   */

  const days = Array.from(
    {
      length: daysInMonth(
        currentMonth,
        currentYear
      ),
    },
    (_, i) => i + 1
  )

  const emptyDays = Array.from({
    length: firstDayOfMonth(
      currentMonth,
      currentYear
    ),
  })

  /*
   * ---------------------------------------------------------
   * Jours fériés du mois courant
   * ---------------------------------------------------------
   */

  const monthHolidays = useMemo(() => {
    return dayOffs
      .filter((item) => {
        const date = item.date.slice(0, 10)

        const [year, month] = date
          .split('-')
          .map(Number)

        return (
          year === currentYear &&
          month === currentMonth + 1
        )
      })
      .sort((a, b) => {
        return (
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
        )
      })
  }, [
    dayOffs,
    currentMonth,
    currentYear,
  ])

  const selectedDayOff =
    selectedDay !== null
      ? getDayOff(selectedDay)
      : null

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <div className="">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Calendrier {currentYear}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Gérez vos jours fériés facilement
          </p>
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-0 shadow-sm p-8 backdrop-blur-sm border border-blue-100 dark:border-indigo-900">

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-8">

                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-blue-100 dark:hover:bg-indigo-900 rounded-lg transition-colors duration-200 hover:scale-110 transform"
                  aria-label="Mois précédent"
                >
                  <ChevronLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </button>

                <h2 className="text-3xl font-bold text-gray-800 dark:text-white min-w-fit">
                  {monthNames[currentMonth]}
                </h2>

                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-blue-100 dark:hover:bg-indigo-900 rounded-lg transition-colors duration-200 hover:scale-110 transform"
                  aria-label="Mois suivant"
                >
                  <ChevronRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-blue-50 py-3 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des jours fériés...
                </div>
              )}

              {/* Status message */}
              {isMonthPassed && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-300 text-center font-medium">
                    Ce mois est terminé - Aucune modification possible
                  </p>
                </div>
              )}

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center font-bold text-gray-600 dark:text-gray-400 py-3 text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">

                {emptyDays.map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="aspect-square"
                  />
                ))}

                {days.map((day) => {
                  const dayOff = getDayOff(day)
                  const isHoliday = Boolean(dayOff)

                  const isPast = isPastDate(day)
                  const isWeekendDay = isWeekend(day)

                  const canClick =
                    !isMonthPassed &&
                    !isWeekendDay &&
                    !isPast

                  const todayDay = isToday(day)

                  return (
                    <button
                      key={day}
                      onClick={() =>
                        handleDayClick(day)
                      }
                      disabled={!canClick}
                      title={
                        dayOff
                          ? dayOff.name
                          : undefined
                      }
                      className={`
                        aspect-square rounded-xl font-semibold text-lg transition-all duration-300 transform
                        flex items-center justify-center relative overflow-hidden
                        ${
                          isHoliday
                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-900 hover:shadow-xl scale-105'
                            : todayDay
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                              : isPast
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : isWeekendDay
                                  ? 'bg-purple-50 dark:bg-purple-900/30 text-gray-600 dark:text-gray-400 cursor-not-allowed border border-purple-200 dark:border-purple-800'
                                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 text-gray-800 dark:text-white border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-600 hover:scale-105 hover:shadow-lg cursor-pointer'
                        }
                      `}
                    >
                      {day}

                      {isHoliday && (
                        <div className="absolute inset-0 rounded-xl animate-pulse opacity-30 bg-white" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Jour férié
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Aujourd&apos;hui
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-50 border-2 border-purple-300 rounded-lg" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Week-end
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Passé
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Holidays Summary */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-0 shadow-sm p-6 backdrop-blur-sm border border-red-100 dark:border-red-900 h-full">

              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full" />
                Jours fériés
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {monthNames[currentMonth]} {currentYear}
              </p>

              {monthHolidays.length === 0 ? (
                <div className="text-center py-8">

                  <CalendarDays
                    className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
                    aria-hidden="true"
                  />

                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun jour férié défini pour ce mois
                  </p>

                </div>
              ) : (
                <div className="space-y-2">

                  {monthHolidays.map((item) => {
                    const date = new Date(
                      `${item.date.slice(0, 10)}T00:00:00`
                    )

                    const day = date.getDate()

                    return (
                      <div
                        key={item.id}
                        className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-500 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                      >

                        <div className="min-w-0">
                          <div className="font-semibold text-red-700 dark:text-red-300">
                            {day} {monthNames[currentMonth]}
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {item.name}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            removeDayOff(item)
                          }
                          disabled={
                            deletingId === item.id
                          }
                          className="ml-3 shrink-0 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Supprimer le jour férié"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>

                      </div>
                    )
                  })}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDay !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-blue-100 dark:border-indigo-900 animate-in fade-in zoom-in duration-300">

            <div className="text-center mb-6">

              <CalendarDays
                className="w-12 h-12 mx-auto mb-3 text-blue-500"
                aria-hidden="true"
              />

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {selectedDay} {monthNames[currentMonth]} {currentYear}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mt-2 capitalize">
                {new Date(
                  currentYear,
                  currentMonth,
                  selectedDay
                ).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                })}
              </p>
            </div>

            {selectedDayOff ? (
              <>
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">

                  <p className="text-xs font-medium uppercase tracking-wide text-red-500">
                    Jour férié
                  </p>

                  <p className="mt-1 font-semibold text-red-700 dark:text-red-300">
                    {selectedDayOff.name}
                  </p>

                </div>

                <button
                  onClick={() =>
                    removeDayOff(selectedDayOff)
                  }
                  disabled={
                    deletingId === selectedDayOff.id
                  }
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-900 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                >
                  {deletingId === selectedDayOff.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Suppression...
                    </span>
                  ) : (
                    'Retirer du jour férié'
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2 mb-5">

                  <label
                    htmlFor="holiday-name"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Nom du jour férié
                  </label>

                  <input
                    id="holiday-name"
                    type="text"
                    value={holidayName}
                    onChange={(event) =>
                      setHolidayName(event.target.value)
                    }
                    placeholder="Ex. Fête de l'indépendance"
                    maxLength={191}
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-slate-700 dark:text-white"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        addDayOff()
                      }
                    }}
                  />

                </div>

                <button
                  onClick={addDayOff}
                  disabled={saving || !holidayName.trim()}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </span>
                  ) : (
                    'Marquer comme jour férié'
                  )}
                </button>
              </>
            )}

            <button
              onClick={() => {
                setShowModal(false)
                setSelectedDay(null)
                setHolidayName('')
                setError(null)
              }}
              disabled={saving}
              className="w-full mt-3 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300 disabled:opacity-50"
            >
              Fermer
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
