"use client";

import { useState } from "react";
import { Video } from "@/types";
import { uploadClientService } from "@/lib/services/upload.service";
import { 
  Upload, 
  Loader2, 
  AlertCircle, 
  X, 
  Link as LinkIcon, 
  Video as VideoIcon, 
  FileVideo 
} from "lucide-react";

interface Props {
  formData: Partial<Video>;
  onChange: (field: keyof Video, value: any) => void;
}

export function VideoFormFields({ formData, onChange }: Props) {
  // Mode de saisie de la vidéo : 'file' (upload) ou 'url' (lien direct)
  const [videoInputMode, setVideoInputMode] = useState<"file" | "url">("file");

  // États locaux de chargement et d'erreurs
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);

  // Upload de la vidéo locale
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setVideoUploadError(null);

    try {
      const url = await uploadClientService.uploadFile(file, "videos");
      onChange("videoUrl", url);
    } catch (err: any) {
      setVideoUploadError(err.message || "Échec du téléversement de la vidéo.");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Upload de la miniature
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    setThumbnailUploadError(null);

    try {
      const url = await uploadClientService.uploadFile(file, "thumbnails");
      onChange("thumbnailUrl", url);
    } catch (err: any) {
      setThumbnailUploadError(err.message || "Échec du téléversement de la miniature.");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  return (
    <>
      {/* Catégorie */}
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

      {/* Durée */}
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

      {/* --- CHAMP VIDÉO AVEC SWITCH (Fichier MP4 / URL Externe) --- */}
      <div className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
        <div className="flex items-center justify-between">
          <span>Source de la vidéo</span>

          {/* Switch Select (Boutons Onglets) */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setVideoInputMode("file")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-all ${
                videoInputMode === "file"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Upload size={13} />
              Fichier Vidéo
            </button>

            <button
              type="button"
              onClick={() => setVideoInputMode("url")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-semibold transition-all ${
                videoInputMode === "url"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LinkIcon size={13} />
              URL Externe
            </button>
          </div>
        </div>

        {/* Option 1: URL directe/externe */}
        {videoInputMode === "url" ? (
          <input
            required
            type="url"
            value={formData.videoUrl || ""}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            placeholder="Ex: https://www.youtube.com/watch?v=... ou https://lien.com/video.mp4"
            className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        ) : (
          /* Option 2: Upload de fichier vidéo */
          <div>
            {formData.videoUrl ? (
              <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <FileVideo size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-700">Vidéo téléversée</p>
                  <p className="truncate text-[11px] text-slate-400">{formData.videoUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange("videoUrl", "")}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <X size={14} /> Supprimer
                </button>
              </div>
            ) : (
              <label className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 transition hover:bg-slate-100 cursor-pointer">
                {uploadingVideo ? (
                  <Loader2 size={22} className="animate-spin text-violet-600" />
                ) : (
                  <VideoIcon size={22} className="text-slate-400" />
                )}
                <span className="text-xs font-medium text-slate-600">
                  {uploadingVideo
                    ? "Téléversement de la vidéo en cours..."
                    : "Sélectionner un fichier vidéo (MP4, WEBM, MOV)"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {videoUploadError && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={14} /> {videoUploadError}
          </p>
        )}
      </div>

      {/* --- CHAMP MINIATURE (Thumbnail) --- */}
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
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                <X size={14} /> Supprimer
              </button>
            </div>
          </div>
        ) : (
          <label className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 transition hover:bg-slate-100 cursor-pointer">
            {uploadingThumbnail ? (
              <Loader2 size={20} className="animate-spin text-violet-600" />
            ) : (
              <Upload size={20} className="text-slate-400" />
            )}
            <span className="text-xs font-medium text-slate-600">
              {uploadingThumbnail ? "Téléversement..." : "Sélectionner une miniature (PNG, JPG)"}
            </span>
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleThumbnailUpload}
              disabled={uploadingThumbnail}
              className="hidden"
            />
          </label>
        )}

        {thumbnailUploadError && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={14} /> {thumbnailUploadError}
          </p>
        )}
      </div>
    </>
  );
}