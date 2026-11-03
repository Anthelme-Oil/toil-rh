"use client";

import { Annonce } from "@/types";

interface Props {
  formData: Partial<Annonce>;
  onChange: (field: keyof Annonce, value: any) => void;
}

export function AnnonceFormFields({ formData, onChange }: Props) {
  return (
    <>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Type / Niveau d'urgence
        <select
          value={formData.type || "info"}
          onChange={(e) => onChange("type", e.target.value as Annonce["type"])}
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        >
          <option value="info">Information</option>
          <option value="warning">Important</option>
          <option value="urgent">Urgent</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Lien associé (optionnel)
        <input
          type="url"
          value={formData.lien || ""}
          onChange={(e) => onChange("lien", e.target.value)}
          placeholder="https://..."
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
        Contenu de l'annonce
        <textarea
          required
          rows={4}
          value={formData.contenu || ""}
          onChange={(e) => onChange("contenu", e.target.value)}
          placeholder="Rédigez le texte complet de votre annonce..."
          className="resize-none rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>
    </>
  );
}