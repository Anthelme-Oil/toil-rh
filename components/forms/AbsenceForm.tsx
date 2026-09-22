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
  CheckCircle2
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { ExceptionalAbsenceType, EXCEPTIONAL_ABSENCE_TYPES } from '@/types';

export default function AbsenceForm({ onCancel, onSuccess }: { onCancel?: () => void; onSuccess?: () => void }) {
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

  // Remplissage automatique dès que le contexte charge le managerEmail
  useEffect(() => {
    if (managerEmail) {
      setFormData((prev) => ({ ...prev, manager: managerEmail }));
    }
  }, [managerEmail]);

  // Calcul dynamique des jours ouvrés (exclut Samedi et Dimanche)
  const calculatedDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [formData.startDate, formData.endDate]);

  // Récupération de la durée requise selon le type sélectionné
  const requiredDuration = useMemo(() => {
    if (!formData.absenceType) return null;
    return EXCEPTIONAL_ABSENCE_TYPES[formData.absenceType]?.duration ?? null;
  }, [formData.absenceType]);

  // Vérification de la conformité du nombre de jours
  const isDurationValid = useMemo(() => {
    if (!requiredDuration || calculatedDays === 0) return true;
    return calculatedDays === requiredDuration;
  }, [calculatedDays, requiredDuration]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Contrôle strict de la durée avant soumission
    if (requiredDuration && calculatedDays !== requiredDuration) {
      setErrorMessage(
        `La durée sélectionnée (${calculatedDays} jour(s)) ne correspond pas à la durée autorisée (${requiredDuration} jour(s)) pour ce motif.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let fileUrl: string | null = null;

      if (formData.file) {
        const fileData = new FormData();
        fileData.append('file', formData.file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
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
        setErrorMessage(result.error || "Erreur lors de l'envoi de la demande.");
        return;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('[ABSENCE_FORM] Erreur lors de la soumission :', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Une erreur de connexion au serveur est survenue.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 text-slate-800 border border-slate-100 shadow-sm">
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
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ligne 1 : Type & Société */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Type d'absence exceptionnelle <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.absenceType}
              onChange={(e) => handleChange('absenceType', e.target.value as ExceptionalAbsenceType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="" disabled>-- Sélectionner un motif --</option>
              {Object.entries(EXCEPTIONAL_ABSENCE_TYPES).map(([key, item]) => (
                <option key={key} value={item?.label}>
                  {item.label} ({item.duration} j)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Société d'appartenance</label>
            <select
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="T-Oil">T-Oil</option>
              <option value="STSL">STSL</option>
              <option value="COMPEL">COMPEL</option>
            </select>
          </div>
        </div>

        {/* Ligne 2 : Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Date début congé</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Date fin congé</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Jours calculés + Feedback de validation */}
        <div className={`border rounded-2xl p-3.5 flex flex-col gap-1.5 transition-all ${
          !isDurationValid 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Clock className={`h-4 w-4 ${!isDurationValid ? 'text-red-600' : 'text-emerald-600'}`} />
              <span>Nombre de jours ouvrés calculés :</span>
            </div>
            <span className={`text-xs font-bold ${!isDurationValid ? 'text-red-700' : 'text-emerald-700'}`}>
              {calculatedDays} jour(s)
            </span>
          </div>

          {requiredDuration !== null && formData.startDate && formData.endDate && (
            <div className="text-[11px] pt-1 border-t border-slate-200/60 flex items-center justify-between">
              <span>Durée requise pour ce motif : <strong>{requiredDuration} jour(s)</strong></span>
              {!isDurationValid && (
                <span className="font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Durée incorrecte
                </span>
              )}
            </div>
          )}
        </div>

        {/* Champ Manager N+1 & UX Message */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-600">
              Supérieur hiérarchique (Valideur N+1)
            </label>
            {managerEmail && (
              <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3 w-3" /> Auto-détecté via SSO / BD
              </span>
            )}
          </div>

          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              placeholder="Saisissez l'e-mail de votre responsable N+1..."
              value={formData.manager}
              onChange={(e) => handleChange('manager', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>

          {!formData.manager ? (
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-amber-800 text-[11px] leading-relaxed">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Aucun responsable N+1 associé à votre compte.</p>
                <p className="mt-0.5 text-amber-700">
                  Renseignez l'e-mail de votre N+1 ci-dessus. Si vous laissez ce champ vide, la demande sera <strong>directement adressée aux Administrateurs Système</strong>.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 px-3">
              Ce responsable recevra la demande de validation prioritaire.
            </p>
          )}
        </div>

        {/* Pièces jointes */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
              Pièces jointes / Justificatifs
            </span>
            <span className="text-[10px] text-slate-400">PDF, PNG, JPG (Max 10 Mo)</span>
          </div>

          <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleChange('file', e.target.files?.[0] || null)}
            />
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full mb-2">
              <Upload className="h-4 w-4" />
            </div>
            <p className="text-xs text-slate-600 text-center font-medium">
              <span className="text-emerald-700 font-bold">Cliquez ici</span> pour joindre un justificatif
            </p>
            {formData.file && (
              <p className="text-[11px] font-semibold text-emerald-800 mt-2 bg-emerald-100 px-3 py-0.5 rounded-full">
                {formData.file.name}
              </p>
            )}
          </label>
        </div>

        {/* Actions Footer */}
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
            disabled={isSubmitting || isLoading || !isDurationValid}
            className="flex items-center gap-2 bg-[#006644] hover:bg-emerald-800 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-all disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {isSubmitting ? 'Envoi...' : 'Soumettre la demande'}
          </button>
        </div>
      </form>
    </div>
  );
}