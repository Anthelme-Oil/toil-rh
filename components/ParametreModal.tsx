"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Save, SlidersHorizontal, AlertCircle } from "lucide-react";

interface ParametreItem {
  cle: string;
  valeur: string;
  description: string | null;
  misAJourLe: string;
}

interface ParametreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { cle: string; valeur: string; description: string }) => Promise<void>;
  existingKeys: string[]; // Pour vérifier si la clé existe déjà
  editingParam?: ParametreItem | null; // S'il s'agit d'une modification directe
}

export default function ParametreModal({
  isOpen,
  onClose,
  onSave,
  existingKeys,
  editingParam,
}: ParametreModalProps) {
  const [cle, setCle] = useState("");
  const [valeur, valeurSet] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronisation des états à l'ouverture ou lors d'une édition
  useEffect(() => {
    if (editingParam) {
      setCle(editingParam.cle);
      valeurSet(editingParam.valeur);
      setDescription(editingParam.description || "");
    } else {
      setCle("");
      valeurSet("");
      setDescription("");
    }
  }, [editingParam, isOpen]);

  if (!isOpen) return null;

  // Détecte si la clé saisie existe déjà dans la base
  const keyExists = !editingParam && existingKeys.includes(cle.trim().toUpperCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cle.trim() || !valeur.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        cle: cle.trim().toUpperCase(),
        valeur: valeur.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Erreur d'enregistrement", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* En-tête du Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              {editingParam ? "Modifier le paramètre" : "Nouvelle configuration de clé"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Champ Clé */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Clé de configuration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!!editingParam}
              value={cle}
              onChange={(e) => setCle(e.target.value)}
              placeholder="Ex: RH_EXEC_EMAIL"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 font-mono uppercase text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 transition"
            />
            {/* Alerte intelligente si la clé existe déjà */}
            {keyExists && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1 bg-amber-50 p-2 rounded border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Cette clé existe déjà. En validant, vous allez l'enrichir/mettre à jour avec cette nouvelle valeur.</span>
              </div>
            )}
          </div>

          {/* Champ Valeur */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Valeur / Email cible <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={valeur}
              onChange={(e) => valeurSet(e.target.value)}
              placeholder="Ex: rh.exec2@entreprise.com"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-800 transition"
            />
            <p className="text-[11px] text-slate-400">
              {keyExists 
                ? "La valeur sera ajoutée/mise à jour pour cette attribution clé." 
                : "Valeur textuelle ou adresse e-mail rattachée au déclencheur du workflow."}
            </p>
          </div>

          {/* Champ Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Description (optionnel)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez le rôle ou le contexte de cette attribution..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-800 transition resize-none"
            />
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 active:bg-slate-950 transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? "Enregistrement..." : keyExists ? "Ajouter la valeur" : "Enregistrer"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}