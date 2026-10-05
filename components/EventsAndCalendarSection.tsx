
"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

import { Evenement, DayOff } from "@/types";
import  DemandesCard  from "./cards/demandes.card";

interface Props {
  events: Evenement[];
  offDays: DayOff[];
}

export function EventsAndCalendarSection({
  events = [],
  offDays = [],
}: Props) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  /* -------------------------------------------------------------------------- */
  /*                                  DATES                                     */
  /* -------------------------------------------------------------------------- */

  /**
   * Retourne une date normalisée à minuit.
   * Cela permet de comparer uniquement le jour/mois/année
   * et non l'heure exacte de l'événement.
   */
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  /**
   * Date d'aujourd'hui normalisée.
   */
  const today = useMemo(() => normalizeDate(new Date()), []);

  /**
   * Vérifie si la date d'un événement est passée.
   *
   * Aujourd'hui n'est pas considéré comme passé.
   */
  const isPastEvent = (date: string) => {
    const eventDate = normalizeDate(new Date(date));
    return eventDate < today;
  };

  /* -------------------------------------------------------------------------- */
  /*                              NAVIGATION                                    */
  /* -------------------------------------------------------------------------- */

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  /* -------------------------------------------------------------------------- */
  /*                              LABEL DU MOIS                                 */
  /* -------------------------------------------------------------------------- */

  const monthLabel = useMemo(() => {
    return currentDate
      .toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  }, [currentDate]);

  /* -------------------------------------------------------------------------- */
  /*                          JOURS DU CALENDRIER                               */
  /* -------------------------------------------------------------------------- */

  const { daysInMonth, startDayOffset } = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // La semaine commence le lundi.
    let offset = firstDay.getDay() - 1;

    if (offset === -1) {
      offset = 6;
    }

    return {
      daysInMonth: lastDay.getDate(),
      startDayOffset: offset,
    };
  }, [currentYear, currentMonth]);

  /* -------------------------------------------------------------------------- */
  /*                         ÉVÉNEMENTS DU CALENDRIER                           */
  /* -------------------------------------------------------------------------- */

  const activeEventsMap = useMemo(() => {
    const map = new Set<number>();

    events.forEach((event) => {
      if (!event.dateDebut) return;

      const date = new Date(event.dateDebut);

      if (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth
      ) {
        map.add(date.getDate());
      }
    });

    return map;
  }, [events, currentYear, currentMonth]);

  /* -------------------------------------------------------------------------- */
  /*                            JOURS FÉRIÉS                                    */
  /* -------------------------------------------------------------------------- */

  const activeOffDaysMap = useMemo(() => {
    const map = new Set<number>();

    offDays.forEach((day) => {
      if (!day.date) return;

      const date = new Date(day.date);

      if (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth
      ) {
        map.add(date.getDate());
      }
    });

    return map;
  }, [offDays, currentYear, currentMonth]);

  const currentMonthOffDays = useMemo(() => {
    return offDays.filter((day) => {
      if (!day.date) return false;

      const date = new Date(day.date);

      return (
        date.getFullYear() === currentYear &&
        date.getMonth() === currentMonth
      );
    });
  }, [offDays, currentYear, currentMonth]);

  /* -------------------------------------------------------------------------- */
  /*                         FORMATAGE DES DATES                                */
  /* -------------------------------------------------------------------------- */

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);

    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                  RENDER                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <section className="relative z-10 mx-auto grid max-w-[1320px] gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-[1.35fr_.65fr] lg:px-12">
      {/* -------------------------------------------------------------------- */}
      {/*                         SECTION ÉVÉNEMENTS                           */}
      {/* -------------------------------------------------------------------- */}

     

      <DemandesCard/>

      {/* -------------------------------------------------------------------- */}
      {/*                            CALENDRIER                                 */}
      {/* -------------------------------------------------------------------- */}

      <div className="flex flex-col gap-5 rounded-0 bg-white p-5 shadow-0 ring-1 ring-[#edf0f6] sm:p-7">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex size-9 items-center justify-center rounded-full text-[#6d7890] transition hover:bg-[#f0f4f8] hover:text-[#079bc2]"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="size-5" />
          </button>

          <h3 className="text-sm font-extrabold tracking-wider text-[#17223b]">
            {monthLabel}
          </h3>

          <button
            type="button"
            onClick={handleNextMonth}
            className="flex size-9 items-center justify-center rounded-full text-[#6d7890] transition hover:bg-[#f0f4f8] hover:text-[#079bc2]"
            aria-label="Mois suivant"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-[#8a96ab]">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
            <div key={index} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Grille */}
        <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-medium text-[#27344f]">
          {/* Décalage avant le premier jour */}
          {Array.from({ length: startDayOffset }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* Jours */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNumber = index + 1;

            const hasEvent = activeEventsMap.has(dayNumber);
            const hasOffDay = activeOffDaysMap.has(dayNumber);

            const isToday =
              today.getDate() === dayNumber &&
              today.getMonth() === currentMonth &&
              today.getFullYear() === currentYear;

            return (
              <div
                key={dayNumber}
                className="flex items-center justify-center p-0.5"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-lg transition ${
                    isToday
                      ? "bg-[#17223b] font-bold text-white"
                      : hasEvent || hasOffDay
                        ? "border-2 border-[#079bc2] font-bold text-[#079bc2]"
                        : "hover:bg-[#f4f6fb]"
                  }`}
                >
                  {dayNumber < 10 ? `0${dayNumber}` : dayNumber}
                </span>
              </div>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/*                         JOURS FÉRIÉS                               */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-2 border-t border-[#edf0f6] pt-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#17223b]">
            <Sparkles className="size-4 text-[#079bc2]" />

            <span>Jours fériés du mois</span>
          </div>

          {currentMonthOffDays.length === 0 ? (
            <p className="mt-2 text-xs text-[#8a96ab]">
              Aucun jour férié ce mois-ci.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {currentMonthOffDays.map((offDay) => {
                const date = new Date(offDay.date);

                return (
                  <div
                    key={offDay.id}
                    className="flex items-center justify-between rounded-xl bg-[#f0f9ff] px-3 py-2 text-xs font-semibold text-[#079bc2]"
                  >
                    <span>{offDay.name}</span>

                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] shadow-sm">
                      {date.getDate()}{" "}
                      {date.toLocaleDateString("fr-FR", {
                        month: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
