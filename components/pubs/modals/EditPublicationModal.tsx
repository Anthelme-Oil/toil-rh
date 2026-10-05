"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { PublicationType } from "@/types";
import { publicationMeta } from "@/config/navigation";

import { actualitesClientService } from "@/lib/services/actualite.service";
import { annoncesClientService } from "@/lib/services/annonces.service";
import { videosClientService } from "@/lib/services/videos.service";
import { evenementsClientService } from "@/lib/services/evenements.service";

import { ActualiteFormFields } from "@/components/forms/pubs/ActualiteFormFields";
import { AnnonceFormFields } from "@/components/forms/pubs/AnnonceFormFields";
import { VideoFormFields } from "@/components/forms/pubs/VideoFormFields";
import { EvenementFormFields } from "@/components/forms/pubs/EvenementFormFields";

interface EditPublicationModalProps {
  type: PublicationType;
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPublicationModal({
  type,
  item,
  isOpen,
  onClose,
  onSuccess,
}: EditPublicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({
    titre: item?.titre || item?.title || "",
    description: item?.description || item?.excerpt || "",
    ...item,
  });

  if (!isOpen || !item) return null;

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
        await actualitesClientService.update(item.id, {
          titre: formData.titre,
          description: formData.description,
          contenu: formData.contenu,
          categorie: formData.categorie,
          auteur: formData.auteur,
          imageUrl: formData.imageUrl,
          tempsLecture: formData.tempsLecture,
        });
      } else if (type === "annonces") {
        await annoncesClientService.update(item.id, {
          titre: formData.titre,
          contenu: formData.contenu || formData.description,
          type: formData.type || "info",
          lien: formData.lien,
        });
      } else if (type === "videos") {
        await videosClientService.update(item.id, {
          titre: formData.titre,
          description: formData.description,
          videoUrl: formData.videoUrl,
          thumbnailUrl: formData.thumbnailUrl,
          categorie: formData.categorie,
          duree: formData.duree,
        });
      } else if (type === "evenements") {
        await evenementsClientService.update(item.id, {
          titre: formData.titre,
          description: formData.description,
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin,
          lieu: formData.lieu,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de la publication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Édition
            </p>
            <h2 className="text-xl font-bold text-slate-950">
              Modifier l’élément ({meta.singular})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Titre
            <input
              required
              value={formData.titre || ""}
              onChange={(e) => handleFieldChange("titre", e.target.value)}
              className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          {/* Formulaires spécifiques selon le type de publication */}
          {type === "actualites" && (
            <ActualiteFormFields formData={formData} onChange={handleFieldChange} />
          )}
          {type === "annonces" && (
            <AnnonceFormFields formData={formData} onChange={handleFieldChange} />
          )}
          {type === "videos" && (
            <VideoFormFields formData={formData} onChange={handleFieldChange} />
          )}
          {type === "evenements" && (
            <EvenementFormFields formData={formData} onChange={handleFieldChange} />
          )}

          {type !== "annonces" && (
            <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Description
              <textarea
                required
                rows={3}
                value={formData.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                className="resize-none rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          )}

          <div className="flex justify-end gap-3 md:col-span-2 mt-4 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}