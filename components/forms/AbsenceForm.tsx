
'use client';

import React, { useState, useMemo, useEffect } from 'react';

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
} from 'lucide-react';

import { useUser } from '@/context/UserContext';

import {
  ExceptionalAbsenceType,
  EXCEPTIONAL_ABSENCE_TYPES,
} from '@/types';

export default function AbsenceForm({
  onCancel,
  onSuccess,
}: {
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const { userEmail, userName, managerEmail, isLoading } = useUser();

  const [formData, setFormData] = useState({
    absenceType: '' as ExceptionalAbsenceType | '',
    company: 'T-Oil',
    startDate: '',
    endDate: '',
    manager: '',
    file: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ------------------------------------------------------------
  // Remplissage automatique du manager
  // ------------------------------------------------------------
  useEffect(() => {
    if (managerEmail) {
      setFormData((prev) => ({
        ...prev,
        manager: managerEmail,
      }));
    }
  }, [managerEmail]);

  // ------------------------------------------------------------
  // Calcul des jours ouvrés
  // Exclut samedi et dimanche
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
      const day = currentDate.getDay();

      // 0 = dimanche
      // 6 = samedi
      if (day !== 0 && day !== 6) {
        count++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }, [formData.startDate, formData.endDate]);

  // ------------------------------------------------------------
  // Durée autorisée pour le type d'absence sélectionné
  // ------------------------------------------------------------
  const requiredDuration = useMemo(() => {
    if (!formData.absenceType) {
      return null;
    }

    const absenceConfig =
      EXCEPTIONAL_ABSENCE_TYPES[formData.absenceType];

    return absenceConfig?.duration ?? null;
  }, [formData.absenceType]);

  // ------------------------------------------------------------
  // Dépassement de la durée autorisée
  // ------------------------------------------------------------
  const isDurationExceeded = useMemo(() => {
    if (
      requiredDuration === null ||
      calculatedDays === 0
    ) {
      return false;
    }

    return calculatedDays > requiredDuration;
  }, [calculatedDays, requiredDuration]);

  // ------------------------------------------------------------
  // Durée valide
  // ------------------------------------------------------------
  const isDurationValid = useMemo(() => {
    return !isDurationExceeded;
  }, [isDurationExceeded]);

  // ------------------------------------------------------------
  // Gestion des champs
  // ------------------------------------------------------------
  const handleChange = (
    field: string,
    value: string | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Efface l'erreur serveur lorsqu'on modifie le formulaire
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // ------------------------------------------------------------
  // Soumission
  // ------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sécurité supplémentaire
    // Impossible d'envoyer si la durée dépasse la durée autorisée
    if (
      requiredDuration !== null &&
      calculatedDays > requiredDuration
    ) {
      setErrorMessage(
        `La durée sélectionnée (${calculatedDays} jour(s)) dépasse la durée autorisée (${requiredDuration} jour(s)) pour ce motif.`
      );

      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let fileUrl: string | null = null;

      // --------------------------------------------------------
      // Upload du justificatif
      // --------------------------------------------------------
      if (formData.file) {
        const fileData = new FormData();

        fileData.append('file', formData.file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: fileData,
        });

        if (!uploadRes.ok) {
          throw new Error(
            'Impossible de téléverser le fichier.'
          );
        }

        const uploadJson = await uploadRes.json();

        if (!uploadJson?.url) {
          throw new Error(
            "L'URL du fichier téléversé est introuvable."
          );
        }

        fileUrl = uploadJson.url;
      }

      // --------------------------------------------------------
      // Envoi de la demande
      // --------------------------------------------------------
      const res = await fetch('/api/requests/absence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          result.error ||
            "Erreur lors de l'envoi de la demande."
        );

        return;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(
        '[ABSENCE_FORM] Erreur lors de la soumission :',
        err
      );

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Une erreur de connexion au serveur est survenue.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Bouton verrouillé ?
  // ------------------------------------------------------------
  const isSubmitDisabled =
    isSubmitting ||
    isLoading ||
    isDurationExceeded;

  return (
    <div className="w-full bg-white rounded-2xl p-6 text-slate-800 border border-slate-100 shadow-sm">

      {/* -------------------------------------------------------
          HEADER
      ------------------------------------------------------- */}
      <div className="flex items-start justify-between pb-5 border-b border-slate-100 mb-6">

        <div className="flex items-center gap-3">

          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Calendar className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Nouvelle demande d’absence
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Workflow automatique N+1 / Administrateurs Système
            </p>
          </div>

        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        )}

      </div>

      {/* -------------------------------------------------------
          ERREUR SERVEUR
      ------------------------------------------------------- */}
      {errorMessage && (
        <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">

          <AlertCircle className="h-4 w-4 flex-shrink-0" />

          <span>{errorMessage}</span>

        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* -----------------------------------------------------
            TYPE + SOCIÉTÉ
        ----------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="space-y-1.5">

            <label className="text-xs font-semibold text-slate-600">
              Type d'absence exceptionnelle{' '}
              <span className="text-red-500">*</span>
            </label>

            <select
              required
              value={formData.absenceType}
              onChange={(e) =>
                handleChange(
                  'absenceType',
                  e.target.value as ExceptionalAbsenceType
                )
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            >

              <option value="" disabled>
                -- Sélectionner un motif --
              </option>

              {Object.entries(EXCEPTIONAL_ABSENCE_TYPES).map(
                ([key, item]) => (
                  <option
                    key={key}
                    value={key}
                  >
                    {item.label} ({item.duration} j)
                  </option>
                )
              )}

            </select>

          </div>

          <div className="space-y-1.5">

            <label className="text-xs font-semibold text-slate-600">
              Société d'appartenance
            </label>

            <select
              value={formData.company}
              onChange={(e) =>
                handleChange(
                  'company',
                  e.target.value
                )
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="T-Oil">
                T-Oil
              </option>

              <option value="STSL">
                STSL
              </option>

              <option value="COMPEL">
                COMPEL
              </option>
            </select>

          </div>

        </div>

        {/* -----------------------------------------------------
            DATES
        ----------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="space-y-1.5">

            <label className="text-xs font-semibold text-slate-600">
              Date début congé
            </label>

            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                handleChange(
                  'startDate',
                  e.target.value
                )
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            />

          </div>

          <div className="space-y-1.5">

            <label className="text-xs font-semibold text-slate-600">
              Date fin congé
            </label>

            <input
              type="date"
              required
              value={formData.endDate}
              min={formData.startDate || undefined}
              onChange={(e) =>
                handleChange(
                  'endDate',
                  e.target.value
                )
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            />

          </div>

        </div>

        {/* -----------------------------------------------------
            JOURS CALCULÉS
        ----------------------------------------------------- */}
        <div
          className={`border rounded-2xl p-3.5 flex flex-col gap-1.5 transition-all ${
            isDurationExceeded
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2 text-xs font-medium">

              <Clock
                className={`h-4 w-4 ${
                  isDurationExceeded
                    ? 'text-red-600'
                    : 'text-emerald-600'
                }`}
              />

              <span>
                Nombre de jours ouvrés calculés :
              </span>

            </div>

            <span
              className={`text-xs font-bold ${
                isDurationExceeded
                  ? 'text-red-700'
                  : 'text-emerald-700'
              }`}
            >
              {calculatedDays} jour(s)
            </span>

          </div>

          {requiredDuration !== null &&
            formData.startDate &&
            formData.endDate && (
              <div className="text-[11px] pt-1 border-t border-slate-200/60 flex items-center justify-between">

                <span>
                  Durée autorisée pour ce motif :{' '}
                  <strong>
                    {requiredDuration} jour(s)
                  </strong>
                </span>

                {!isDurationExceeded && (
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Durée correcte
                  </span>
                )}

              </div>
            )}

        </div>

        {/* -----------------------------------------------------
            MESSAGE BLOQUANT
        ----------------------------------------------------- */}
        {isDurationExceeded && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl animate-pulse">

            <div className="flex items-start gap-3">

              <div className="p-2 bg-red-100 rounded-full flex-shrink-0">

                <AlertCircle className="h-5 w-5 text-red-600" />

              </div>

              <div className="text-xs leading-relaxed">

                <p className="font-bold text-red-700">
                  Durée d'absence dépassée
                </p>

                <p className="mt-1 text-red-700">

                  La durée sélectionnée est de{' '}

                  <strong>
                    {calculatedDays} jour(s)
                  </strong>.

                </p>

                <p className="mt-1 text-red-700">

                  Le motif sélectionné autorise au maximum{' '}

                  <strong>
                    {requiredDuration} jour(s)
                  </strong>.

                </p>

                <p className="mt-1 font-semibold text-red-800">

                  Veuillez modifier les dates de votre absence
                  avant de pouvoir soumettre la demande.

                </p>

              </div>

            </div>

          </div>
        )}

        {/* -----------------------------------------------------
            MANAGER N+1
        ----------------------------------------------------- */}
        <div className="space-y-2">

          <div className="flex justify-between items-center">

            <label className="text-xs font-semibold text-slate-600">
              Supérieur hiérarchique (Valideur N+1)
            </label>

            {managerEmail && (
              <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">

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
              onChange={(e) =>
                handleChange(
                  'manager',
                  e.target.value
                )
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />

            <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />

          </div>

          {!formData.manager ? (

            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-amber-800 text-[11px] leading-relaxed">

              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />

              <div>

                <p className="font-semibold text-amber-900">
                  Aucun responsable N+1 associé à votre compte.
                </p>

                <p className="mt-0.5 text-amber-700">

                  Renseignez l'e-mail de votre N+1 ci-dessus.
                  Si vous laissez ce champ vide, la demande sera{' '}

                  <strong>
                    directement adressée aux Administrateurs Système
                  </strong>.

                </p>

              </div>

            </div>

          ) : (

            <p className="text-[10px] text-slate-400 px-3">

              Ce responsable recevra la demande de validation prioritaire.

            </p>

          )}

        </div>

        {/* -----------------------------------------------------
            PIÈCES JOINTES
        ----------------------------------------------------- */}
        <div className="space-y-1.5">

          <div className="flex justify-between items-center text-xs">

            <span className="font-semibold text-slate-600 flex items-center gap-1.5">

              <Paperclip className="h-3.5 w-3.5 text-emerald-600" />

              Pièces jointes / Justificatifs

            </span>

            <span className="text-[10px] text-slate-400">
              PDF, PNG, JPG (Max 10 Mo)
            </span>

          </div>

          <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all">

            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                handleChange(
                  'file',
                  e.target.files?.[0] || null
                )
              }
            />

            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full mb-2">

              <Upload className="h-4 w-4" />

            </div>

            <p className="text-xs text-slate-600 text-center font-medium">

              <span className="text-emerald-700 font-bold">
                Cliquez ici
              </span>{' '}
              pour joindre un justificatif

            </p>

            {formData.file && (
              <p className="text-[11px] font-semibold text-emerald-800 mt-2 bg-emerald-100 px-3 py-0.5 rounded-full">

                {formData.file.name}

              </p>
            )}

          </label>

        </div>

        {/* -----------------------------------------------------
            ACTIONS
        ----------------------------------------------------- */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">

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
              font-semibold text-xs
              px-5 py-2.5
              rounded-full
              transition-all
              ${
                isSubmitDisabled
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#006644] hover:bg-emerald-800 text-white'
              }
            `}
          >

            {isDurationExceeded ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}

            {isSubmitting
              ? 'Envoi...'
              : isDurationExceeded
                ? 'Envoi verrouillé'
                : 'Soumettre la demande'}

          </button>

        </div>

      </form>

    </div>
  );
}
