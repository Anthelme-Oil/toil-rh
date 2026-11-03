"use client";

import { Evenement } from "@/types";

interface Props {
  formData: Partial<Evenement>;
  onChange: (field: keyof Evenement, value: any) => void;
}

export function EvenementFormFields({ formData, onChange }: Props) {
  return (
    <>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Date et heure de début
        <input
          required
          type="datetime-local"
          value={formData.dateDebut || ""}
          onChange={(e) => onChange("dateDebut", e.target.value)}
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Date et heure de fin (optionnelle)
        <input
          type="datetime-local"
          value={formData.dateFin || ""}
          onChange={(e) => onChange("dateFin", e.target.value)}
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
        Lieu
        <input
          type="text"
          value={formData.lieu || ""}
          onChange={(e) => onChange("lieu", e.target.value)}
          placeholder="Ex: Salle de réunion A / Siège Social"
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>
    </>
  );
}