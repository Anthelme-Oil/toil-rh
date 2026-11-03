"use client";

import { useState } from "react";
import { Actualite } from "@/types";
import { uploadClientService } from "@/lib/services/upload.service";
import { Upload, Loader2, CheckCircle2, AlertCircle, X, Image as ImageIcon } from "lucide-react";

interface Props {
  formData: Partial<Actualite>;
  onChange: (field: keyof Actualite, value: any) => void;
}

export function ActualiteFormFields({ formData, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const url = await uploadClientService.uploadFile(file, "actualites");
      onChange("imageUrl", url);
      setUploadSuccess(true);
    } catch (err: any) {
      setUploadError(err.message || "Erreur lors du téléversement de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("imageUrl", undefined);
    setUploadSuccess(false);
    setUploadError(null);
  };

  return (
    <>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Catégorie
        <select
          value={formData.categorie || "Institution"}
          onChange={(e) => onChange("categorie", e.target.value)}
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        >
          <option value="Institution">Institution</option>
          <option value="Vie de l’établissement">Vie de l’établissement</option>
          <option value="Projets">Projets</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Auteur
        <input
          type="text"
          value={formData.auteur || ""}
          onChange={(e) => onChange("auteur", e.target.value)}
          placeholder="Ex: Direction Communication"
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      {/* Zone de Sélection et Aperçu Image */}
      <div className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
        <span>Image d'illustration</span>

        {formData.imageUrl ? (
          <div className="relative flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
              <img
                src={formData.imageUrl}
                alt="Aperçu de la publication"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-700">Image sélectionnée</p>
              <p className="truncate text-[11px] text-slate-400">{formData.imageUrl}</p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              >
                <X size={14} /> Supprimer l'image
              </button>
            </div>
          </div>
        ) : (
          <label className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100 cursor-pointer">
            {uploading ? (
              <Loader2 size={22} className="animate-spin text-violet-600" />
            ) : (
              <Upload size={22} className="text-slate-400" />
            )}
            <span className="text-xs font-medium text-slate-600">
              {uploading ? "Téléversement en cours..." : "Cliquez pour parcourir ou glisser une image"}
            </span>
            <span className="text-[10px] text-slate-400">PNG, JPG, WEBP jusqu'à 5MB</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}

        {uploadSuccess && formData.imageUrl && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 size={14} /> Image chargée et associée avec succès !
          </p>
        )}

        {uploadError && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={14} /> {uploadError}
          </p>
        )}
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Temps de lecture
        <input
          type="text"
          value={formData.tempsLecture || ""}
          onChange={(e) => onChange("tempsLecture", e.target.value)}
          placeholder="Ex: 3 min"
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
        Contenu détaillé (optionnel)
        <textarea
          rows={3}
          value={formData.contenu || ""}
          onChange={(e) => onChange("contenu", e.target.value)}
          placeholder="Détail complet de l'article..."
          className="resize-none rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>
    </>
  );
}