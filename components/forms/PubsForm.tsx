"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { PublicationType } from "@/types";
import { publicationMeta } from "@/config/navigation";

// Services clients HTTP
import { actualitesClientService } from "@/lib/services/actualite.service";
import { annoncesClientService } from "@/lib/services/annonces.service";
import { evenementsClientService } from "@/lib/services/evenements.service";
import { videosClientService } from "@/lib/services/videos.service";

// Sous-formulaires de champs spécifiques
import { ActualiteFormFields } from "./pubs/ActualiteFormFields";
import { AnnonceFormFields } from "./pubs/AnnonceFormFields";
import { EvenementFormFields } from "./pubs/EvenementFormFields";
import { VideoFormFields } from "./pubs/VideoFormFields";

interface PublicationFormProps {
  type: PublicationType;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PublicationForm({ type, onClose, onSuccess }: PublicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState<Record<string, any>>({
    titre: "",
    description: "",
    ...(type === "actualites" && { categorie: "Institution" }),
    ...(type === "annonces" && { type: "info" }),
  });

  const meta = publicationMeta[type];

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === "actualites") {
        await actualitesClientService.create({
          titre: formData.titre,
          description: formData.description,
          contenu: formData.contenu,
          categorie: formData.categorie,
          auteur: formData.auteur,
          imageUrl: formData.imageUrl,
          tempsLecture: formData.tempsLecture,
          datePublication: new Date().toISOString(),
        });
      } else if (type === "annonces") {
        await annoncesClientService.create({
          titre: formData.titre,
          contenu: formData.contenu || formData.description,
          type: formData.type || "info",
          datePublication: new Date().toISOString(),
          lien: formData.lien,
        });
      } else if (type === "videos") {
        await videosClientService.create({
          titre: formData.titre,
          description: formData.description,
          videoUrl: formData.videoUrl,
          thumbnailUrl: formData.thumbnailUrl || "",
          categorie: formData.categorie || "Média",
          duree: formData.duree || "0:00",
          date: new Date().toISOString(),
        });
      } else if (type === "evenements") {
        await evenementsClientService.create({
          titre: formData.titre,
          description: formData.description,
          dateDebut: formData.dateDebut || new Date().toISOString(),
          dateFin: formData.dateFin,
          lieu: formData.lieu,
        });
      }

      setSaved(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
      {/* Entête du Formulaire */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Nouvelle publication
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Créer une {meta.singular}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Message de Succès */}
      {saved ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-emerald-50 p-6 text-center text-sm font-medium text-emerald-700">
          <CheckCircle size={32} />
          <p>Votre {meta.singular} a bien été publiée et enregistrée.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
          >
            Fermer
          </button>
        </div>
      ) : (
        /* Formulaire */
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {/* Champ Titre commun */}
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Titre
            <input
              required
              value={formData.titre || ""}
              onChange={(e) => handleFieldChange("titre", e.target.value)}
              placeholder="Donnez un titre clair à votre publication"
              className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          {/* Champs spécifiques selon le type de publication */}
          {type === "actualites" && (
            <ActualiteFormFields formData={formData} onChange={handleFieldChange} />
          )}
          {type === "annonces" && (
            <AnnonceFormFields formData={formData} onChange={handleFieldChange} />
          )}
          {type === "evenements" && (
            <EvenementFormFields formData={formData} onChange={handleFieldChange} />
          )}
          {type === "videos" && (
            <VideoFormFields formData={formData} onChange={handleFieldChange} />
          )}

          {/* Champ Description commun (sauf pour les annonces qui utilisent le champ 'contenu') */}
          {type !== "annonces" && (
            <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Description
              <textarea
                required
                rows={4}
                value={formData.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Décrivez votre publication..."
                className="resize-none rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 md:col-span-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 disabled:opacity-50 transition"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Publier
            </button>
          </div>
        </form>
      )}
    </div>
  );
}