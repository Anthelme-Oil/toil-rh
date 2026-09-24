"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Clock,
  User,
  Search,
  Paperclip,
  Upload,
  Send,
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

import { useUser } from "@/context/UserContext";

import {
  EXCEPTIONAL_ABSENCE_TYPES,
  INCLUDES_WEEKEND_TYPES,
  ExceptionalAbsenceType,
} from "@/types";

import { DayOff } from "@/types";

export default function AbsenceForm({
  onCancel,
  onSuccess,
}: {
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const { userEmail, userName, managerEmail, isLoading } = useUser();

  // ------------------------------------------------------------
  // FORMULAIRE
  // ------------------------------------------------------------

  const [formData, setFormData] = useState({
    absenceType: "",
    company: "T-Oil",
    startDate: "",
    endDate: "",
    manager: "",
    file: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
  const [isLoadingDayOffs, setIsLoadingDayOffs] = useState(false);
  // ------------------------------------------------------------
  // REMPLISSAGE AUTOMATIQUE DU MANAGER
  // ------------------------------------------------------------

  useEffect(() => {
    if (managerEmail) {
      setFormData((prev) => ({
        ...prev,
        manager: managerEmail,
      }));
    }
  }, [managerEmail]);

  const loadedYearsRef = React.useRef<Set<number>>(new Set());

  useEffect(() => {
    const loadDayOffs = async () => {
      const years = new Set<number>();

      if (formData.startDate) {
        years.add(new Date(`${formData.startDate}T00:00:00`).getFullYear());
      }

      if (formData.endDate) {
        years.add(new Date(`${formData.endDate}T00:00:00`).getFullYear());
      }

      if (years.size === 0) {
        years.add(new Date().getFullYear());
      }

      const yearsToLoad = Array.from(years).filter(
        (year) => !loadedYearsRef.current.has(year),
      );

      if (yearsToLoad.length === 0) {
        return;
      }

      setIsLoadingDayOffs(true);

      try {
        const responses = await Promise.all(
          yearsToLoad.map(async (year) => {
            const response = await fetch(`/api/requests/day-off?year=${year}`, {
              method: "GET",
              cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(
                result.message ||
                  `Impossible de récupérer les jours fériés de ${year}.`,
              );
            }

            return {
              year,
              data: Array.isArray(result.data) ? result.data : [],
            };
          }),
        );

        setDayOffs((previous) => {
          const merged = [...previous];

          for (const response of responses) {
            for (const dayOff of response.data) {
              const index = merged.findIndex((item) => item.id === dayOff.id);

              if (index >= 0) {
                merged[index] = dayOff;
              } else {
                merged.push(dayOff);
              }
            }
          }

          return merged;
        });

        for (const year of yearsToLoad) {
          loadedYearsRef.current.add(year);
        }
      } catch (error) {
        console.error(
          "[ABSENCE_FORM] Erreur lors du chargement des jours fériés :",
          error,
        );
      } finally {
        setIsLoadingDayOffs(false);
      }
    };

    loadDayOffs();
  }, [formData.startDate, formData.endDate]);

  // ------------------------------------------------------------
  // SÉLECTION DU TYPE D'ABSENCE ET SONT OPTION WEEKEND
  // ------------------------------------------------------------

  // Retrouver la CLÉ enum à partir du label sélectionné
  const selectedAbsenceKey = useMemo<ExceptionalAbsenceType | null>(() => {
    if (!formData.absenceType) return null;

    const entry = Object.entries(EXCEPTIONAL_ABSENCE_TYPES).find(
      ([, item]) => item.label === formData.absenceType,
    );

    return (entry?.[0] as ExceptionalAbsenceType) ?? null;
  }, [formData.absenceType]);

  const selectedAbsence = useMemo(() => {
    if (!selectedAbsenceKey) return null;
    return EXCEPTIONAL_ABSENCE_TYPES[selectedAbsenceKey];
  }, [selectedAbsenceKey]);

  // Vérifie si le type sélectionné compte aussi les samedis/dimanches
  const includesWeekend = useMemo(() => {
    if (!selectedAbsenceKey) return false;
    return INCLUDES_WEEKEND_TYPES.includes(selectedAbsenceKey);
  }, [selectedAbsenceKey]);

  // ------------------------------------------------------------
  // CALCUL DES JOURS (OUVRÉS OU CALENDAIRES)
  // ------------------------------------------------------------

  const dayOffDates = useMemo(() => {
    return new Set(
      dayOffs.map((dayOff) => {
        const date = new Date(dayOff.date);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      }),
    );
  }, [dayOffs]);

  // const calculatedDays = useMemo(() => {
  //   if (!formData.startDate || !formData.endDate) {
  //     return 0;
  //   }

  //   const start = new Date(`${formData.startDate}T00:00:00`);
  //   const end = new Date(`${formData.endDate}T00:00:00`);

  //   // Date de fin antérieure à la date de début
  //   if (end < start) {
  //     return 0;
  //   }

  //   let count = 0;
  //   const currentDate = new Date(start);

  //   while (currentDate <= end) {
  //     const day = currentDate.getDay(); // 0 = dimanche, 6 = samedi

  //     // Si le type inclut les week-ends, on compte tous les jours.
  //     // Sinon, on ignore les samedis et dimanches.
  //     if (includesWeekend || (day !== 0 && day !== 6)) {
  //       count++;
  //     }

  //     currentDate.setDate(currentDate.getDate() + 1);
  //   }

  //   return count;
  // }, [formData.startDate, formData.endDate, includesWeekend]);

  // ------------------------------------------------------------
  // DURÉE AUTORISÉE
  // ------------------------------------------------------------

  const calculatedDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return 0;
    }

    const start = new Date(`${formData.startDate}T00:00:00`);

    const end = new Date(`${formData.endDate}T00:00:00`);

    if (end < start) {
      return 0;
    }

    let count = 0;

    const currentDate = new Date(start);

    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");

      const dateKey = `${year}-${month}-${day}`;

      const dayOfWeek = currentDate.getDay();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const isDayOff = dayOffDates.has(dateKey);

      /*
       * Un jour férié n'est jamais compté,
       * quel que soit le type d'absence.
       */
      if (isDayOff) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      /*
       * Pour les types qui incluent les week-ends,
       * samedi et dimanche sont comptés.
       *
       * Pour les autres types, ils sont ignorés.
       */
      if (includesWeekend || !isWeekend) {
        count++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }, [formData.startDate, formData.endDate, includesWeekend, dayOffDates]);

  const holidaysInRange = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return [];
    }

    const start = new Date(`${formData.startDate}T00:00:00`);

    const end = new Date(`${formData.endDate}T00:00:00`);

    if (end < start) {
      return [];
    }

    return dayOffs.filter((dayOff) => {
      const dayOffDate = new Date(dayOff.date);

      return dayOffDate >= start && dayOffDate <= end;
    });
  }, [formData.startDate, formData.endDate, dayOffs]);
  const requiredDuration = useMemo(() => {
    return selectedAbsence?.duration ?? null;
  }, [selectedAbsence]);

  // ------------------------------------------------------------
  // DATE INVALIDE
  // ------------------------------------------------------------

  const isDateRangeInvalid = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return false;
    }

    return (
      new Date(`${formData.endDate}T00:00:00`) <
      new Date(`${formData.startDate}T00:00:00`)
    );
  }, [formData.startDate, formData.endDate]);

  // ------------------------------------------------------------
  // DÉPASSEMENT DE LA DURÉE AUTORISÉE
  // ------------------------------------------------------------

  const isDurationExceeded = useMemo(() => {
    if (
      requiredDuration === null ||
      calculatedDays === 0 ||
      isDateRangeInvalid
    ) {
      return false;
    }

    return calculatedDays > requiredDuration;
  }, [calculatedDays, requiredDuration, isDateRangeInvalid]);

  // ------------------------------------------------------------
  // GESTION DES CHAMPS
  // ------------------------------------------------------------

  const handleChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // ------------------------------------------------------------
  // SOUMISSION
  // ------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.absenceType) {
      setErrorMessage("Veuillez sélectionner un motif d'absence.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setErrorMessage("Veuillez sélectionner les dates de votre absence.");
      return;
    }

    if (isDateRangeInvalid) {
      setErrorMessage(
        "La date de fin ne peut pas être antérieure à la date de début.",
      );
      return;
    }

    if (calculatedDays === 0) {
      setErrorMessage("La période sélectionnée ne contient aucun jour valide.");
      return;
    }

    if (requiredDuration !== null && calculatedDays > requiredDuration) {
      setErrorMessage(
        `La durée sélectionnée (${calculatedDays} jour(s)) dépasse la durée autorisée (${requiredDuration} jour(s)) pour ce motif.`,
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let fileUrl: string | null = null;

      // Upload de la pièce jointe
      if (formData.file) {
        const fileData = new FormData();
        fileData.append("file", formData.file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileData,
        });

        if (!uploadRes.ok) {
          throw new Error("Impossible de téléverser le fichier.");
        }

        const uploadJson = await uploadRes.json();

        if (!uploadJson?.url) {
          throw new Error("L'URL du fichier téléversé est introuvable.");
        }

        fileUrl = uploadJson.url;
      }

      // Envoi de la demande
      const res = await fetch("/api/requests/absence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          absenceType: formData.absenceType,
          company: formData.company,
          startDate: formData.startDate,
          endDate: formData.endDate,
          calculatedDays,
          managerEmail: formData.manager,
          fileUrl,
          currentUser: {
            name: userName,
            email: userEmail,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMessage(
          result.error || "Erreur lors de l'envoi de la demande.",
        );
        return;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("[ABSENCE_FORM] Erreur lors de la soumission :", err);

      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Une erreur de connexion au serveur est survenue.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // BOUTON VERROUILLÉ ?
  // ------------------------------------------------------------

  const isSubmitDisabled =
    isSubmitting || isLoading || isDurationExceeded || isDateRangeInvalid;

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white p-6 text-slate-800 shadow-sm">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Nouvelle demande d’absence
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Workflow automatique N+1 / Administrateurs Système
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ERREURS */}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* TYPE + SOCIÉTÉ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* TYPE D'ABSENCE */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Type d'absence <span className="text-red-500">*</span>
            </label>

            <select
              required
              value={formData.absenceType}
              onChange={(e) => handleChange("absenceType", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="" disabled>
                -- Sélectionner un motif --
              </option>

              {Object.entries(EXCEPTIONAL_ABSENCE_TYPES).map(([key, item]) => (
                <option key={key} value={item.label}>
                  {item.duration
                    ? `${item.label} (${item.duration} j)`
                    : item.label}
                </option>
              ))}
            </select>
          </div>

          {/* SOCIÉTÉ */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Société d'appartenance
            </label>

            <select
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="T-Oil">T-Oil</option>
              <option value="STSL">STSL</option>
              <option value="COMPEL">COMPEL</option>
            </select>
          </div>
        </div>

        {/* DATES */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* DATE DÉBUT */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Date début congé
            </label>

            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* DATE FIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Date fin congé
            </label>

            <input
              type="date"
              required
              min={formData.startDate || undefined}
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* JOURS CALCULÉS */}
        <div
          className={`flex flex-col gap-1.5 rounded-2xl border p-3.5 transition-all ${
            isDurationExceeded || isDateRangeInvalid
              ? "border-red-300 bg-red-50 text-red-800"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Clock
                className={`h-4 w-4 ${
                  isDurationExceeded || isDateRangeInvalid
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              />
              <span>Nombre de jours :</span>
            </div>

            <div className="flex items-center gap-2">
              {includesWeekend && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  Week-ends inclus
                </span>
              )}

              <span
                className={`text-xs font-bold ${
                  isDurationExceeded || isDateRangeInvalid
                    ? "text-red-700"
                    : "text-emerald-700"
                }`}
              >
                {calculatedDays} jour(s)
              </span>
            </div>
          </div>

          {/* DATE INVALIDE */}
          {isDateRangeInvalid && (
            <div className="border-t border-red-200/60 pt-1 text-[11px] font-semibold text-red-700">
              La date de fin doit être postérieure ou égale à la date de début.
            </div>
          )}

          {/* DURÉE AUTORISÉE */}
          {!isDateRangeInvalid &&
            requiredDuration !== null &&
            formData.startDate &&
            formData.endDate && (
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-1 text-[11px]">
                <span>
                  Durée autorisée pour ce motif :{" "}
                  <strong>{requiredDuration} jour(s)</strong>
                </span>

                {!isDurationExceeded && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Durée correcte
                  </span>
                )}
              </div>
            )}

          {holidaysInRange.length > 0 && (
            <div className="border-t border-slate-200/60 pt-2">
              <div className="flex items-start gap-2 text-[11px] text-slate-500">
                <Calendar className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />

                <div>
                  <p className="font-semibold text-slate-600">
                    Jours fériés exclus du calcul
                  </p>

                  <div className="mt-1 space-y-0.5">
                    {holidaysInRange.map((dayOff) => (
                      <p key={dayOff.id}>{dayOff.name}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MESSAGE BLOQUANT */}
        {isDurationExceeded && (
          <div className="animate-pulse rounded-2xl border-2 border-red-300 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>

              <div className="text-xs leading-relaxed">
                <p className="font-bold text-red-700">
                  Durée d'absence dépassée
                </p>
                <p className="mt-1 text-red-700">
                  La durée sélectionnée est de{" "}
                  <strong>{calculatedDays} jour(s)</strong>.
                </p>
                <p className="mt-1 text-red-700">
                  Le motif sélectionné autorise au maximum{" "}
                  <strong>{requiredDuration} jour(s)</strong>.
                </p>
                <p className="mt-1 font-semibold text-red-800">
                  Veuillez modifier les dates de votre absence avant de pouvoir
                  soumettre la demande.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MANAGER N+1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600">
              Supérieur hiérarchique (Valideur N+1)
            </label>

            {managerEmail && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Auto-détecté via SSO / BD
              </span>
            )}
          </div>

          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />

            <input
              type="email"
              placeholder="Saisissez l'e-mail de votre responsable N+1..."
              value={formData.manager}
              onChange={(e) => handleChange("manager", e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />

            <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>

          {!formData.manager ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">
                  Aucun responsable N+1 associé à votre compte.
                </p>
                <p className="mt-0.5 text-amber-700">
                  Renseignez l'e-mail de votre N+1 ci-dessus. Si vous laissez ce
                  champ vide, la demande sera{" "}
                  <strong>
                    directement adressée aux Administrateurs Système
                  </strong>
                  .
                </p>
              </div>
            </div>
          ) : (
            <p className="px-3 text-[10px] text-slate-400">
              Ce responsable recevra la demande de validation prioritaire.
            </p>
          )}
        </div>

        {/* PIÈCES JOINTES */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
              Pièces jointes / Justificatifs
            </span>

            <span className="text-[10px] text-slate-400">
              PDF, PNG, JPG (Max 10 Mo)
            </span>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 transition-all hover:border-emerald-500 hover:bg-emerald-50/20">
            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                handleChange("file", e.target.files?.[0] || null)
              }
            />

            <div className="mb-2 rounded-full bg-emerald-100 p-2 text-emerald-700">
              <Upload className="h-4 w-4" />
            </div>

            <p className="text-center text-xs font-medium text-slate-600">
              <span className="font-bold text-emerald-700">Cliquez ici</span>{" "}
              pour joindre un justificatif
            </p>

            {formData.file && (
              <p className="mt-2 rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-semibold text-emerald-800">
                {formData.file.name}
              </p>
            )}
          </label>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`
              flex items-center gap-2
              rounded-full
              px-5 py-2.5
              text-xs font-semibold
              transition-all
              ${
                isSubmitDisabled
                  ? "cursor-not-allowed bg-slate-300 text-slate-500"
                  : "bg-[#006644] text-white hover:bg-emerald-800"
              }
            `}
          >
            {isDurationExceeded || isDateRangeInvalid ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}

            {isSubmitting
              ? "Envoi..."
              : isDurationExceeded || isDateRangeInvalid
                ? "Envoi verrouillé"
                : "Soumettre la demande"}
          </button>
        </div>
      </form>
    </div>
  );
}
