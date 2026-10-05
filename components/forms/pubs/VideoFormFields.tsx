"use client";

import { useState } from "react";
import { Video } from "@/types";
import { uploadClientService } from "@/lib/services/upload.service";
import { Upload, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

interface Props {
  formData: Partial<Video>;
  onChange: (field: keyof Video, value: any) => void;
}

export function VideoFormFields({ formData, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadClientService.uploadFile(file, "videos");
      onChange("thumbnailUrl", url);
    } catch (err: any) {
      setUploadError(err.message || "Échec de l'upload de la miniature.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Catégorie
        <input
          required
          type="text"
          value={formData.categorie || ""}
          onChange={(e) => onChange("categorie", e.target.value)}
          placeholder="Ex: Tuto, Présentation, Interview"
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Durée (ex: 03:45)
        <input
          required
          type="text"
          value={formData.duree || ""}
          onChange={(e) => onChange("duree", e.target.value)}
          placeholder="Ex: 03:45"
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
        URL de la vidéo (YouTube, Vimeo, MP4)
        <input
          required
          type="url"
          value={formData.videoUrl || ""}
          onChange={(e) => onChange("videoUrl", e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </label>

      {/* Miniature (Upload ou URL) */}
      <div className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
        <span>Image Miniature (Thumbnail)</span>

        {formData.thumbnailUrl ? (
          <div className="relative flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
              <img
                src={formData.thumbnailUrl}
                alt="Miniature vidéo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-700">Miniature chargée</p>
              <p className="truncate text-[11px] text-slate-400">{formData.thumbnailUrl}</p>
              <button
                type="button"
                onClick={() => onChange("thumbnailUrl", "")}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <X size={14} /> Supprimer
              </button>
            </div>
          </div>
        ) : (
          <label className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 transition hover:bg-slate-100 cursor-pointer">
            {uploading ? (
              <Loader2 size={20} className="animate-spin text-violet-600" />
            ) : (
              <Upload size={20} className="text-slate-400" />
            )}
            <span className="text-xs font-medium text-slate-600">
              {uploading ? "Téléversement..." : "Séléctionner une miniature (PNG, JPG)"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}

        {uploadError && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={14} /> {uploadError}
          </p>
        )}
      </div>
    </>
  );
}