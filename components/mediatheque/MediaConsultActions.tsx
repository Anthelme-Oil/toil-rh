'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Download, 
  Loader2, 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Tag, 
  Eye, 
  HardDrive, 
  ShieldCheck, 
  Info,
  Clock,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { MediaDocument } from '@/types';
import { consultMedia, downloadMedia } from '@/lib/services/media.service';

interface MediaConsultActionsProps {
  mediaId: string;
  downloads: number;
  media: MediaDocument;
}

export default function MediaConsultActions({
  mediaId,
  downloads,
  media,
}: MediaConsultActionsProps) {
  const consultationRegistered = useRef(false);
  const [downloadCount, setDownloadCount] = useState(downloads);
  const [isDownloading, setIsDownloading] = useState(false);

  // Enregistrement de la consultation
  useEffect(() => {
    if (consultationRegistered.current) return;
    consultationRegistered.current = true;

    const registerConsultation = async () => {
      try {
        await consultMedia(mediaId);
      } catch (error) {
        console.error('Erreur lors de la consultation :', error);
      }
    };

    registerConsultation();
  }, [mediaId]);

  // Gestion du téléchargement
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      await downloadMedia(mediaId);
      setDownloadCount((current) => current + 1);
    } catch (error) {
      console.error('Erreur lors du téléchargement :', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Inconnu';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Composant d'aperçu universel (Images, PDF, Office Word/Excel, Vidéo, Audio)
  const renderPreview = () => {
    const ext = media.extension?.toLowerCase() || '';
    const format = media.format?.toLowerCase() || '';
    const fileUrl = media.fileUrl;

    // 1. IMAGES
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || format === 'image') {
      return (
        <div className="flex justify-center rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <img
            src={fileUrl}
            alt={media.title}
            className="max-h-[600px] w-auto rounded-lg object-contain shadow-sm"
          />
        </div>
      );
    }

    // 2. PDF (Utilise le mode FitH et sans barres grises/noires)
    if (ext === 'pdf' || format === 'pdf') {
      return (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            className="h-[700px] w-full border-0 bg-white"
            title={media.title}
          />
        </div>
      );
    }

    // 3. DOCUMENTS MICROSOFT OFFICE (Word, Excel, PowerPoint)
    const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
    if (isOfficeDoc) {
      // Visionneuse Microsoft Office Web Viewer
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

      return (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <iframe
            src={officeViewerUrl}
            className="h-[700px] w-full border-0 bg-white"
            title={media.title}
          />
        </div>
      );
    }

    // 4. VIDÉOS
    if (['mp4', 'webm', 'ogg'].includes(ext) || format === 'video') {
      return (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900 p-1 shadow-sm">
          <video controls className="max-h-[600px] w-full rounded-lg">
            <source src={fileUrl} />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      );
    }

    // 5. AUDIO
    if (['mp3', 'wav', 'ogg'].includes(ext) || format === 'audio') {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 p-10">
          <FileText className="mb-4 h-16 w-16 text-slate-400" />
          <audio controls className="w-full max-w-md">
            <source src={fileUrl} />
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        </div>
      );
    }

    // 6. FICHIERS AUTRES (Archives, Code, etc.)
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <FileText className="mb-4 h-16 w-16 text-slate-300" />
        <p className="text-base font-medium text-slate-700">
          Aperçu direct non disponible pour l'extension ({ext.toUpperCase()})
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Veuillez télécharger le document pour en consulter l'intégralité.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER : Titre & Badges                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60">
                {media.department || 'Général'}
              </span>
              {media.category && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {media.category}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{media.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                media.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}
            >
              {media.status === 'PUBLISHED' ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
              {media.status || 'DRAFT'}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <Lock className="h-3 w-3" />
              {media.visibility || 'PUBLIC'}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTENT : Preview (Gauche) + Metadonnées & Action (Droite)    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Colonne Gauche : Aperçu & Description */}
        <div className="space-y-6 lg:col-span-2">
          {/* Zone d'aperçu du fichier */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Aperçu du document</h2>
            {renderPreview()}
          </div>

          {/* Description & Objectif */}
          {(media.description || media.objective) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              {media.description && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{media.description}</p>
                </div>
              )}

              {media.objective && (
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Objectifs</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{media.objective}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Colonne Droite : Métadonnées & Actions */}
        <div className="space-y-6">
          
          {/* Card d'action Principale */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? 'Téléchargement...' : 'Télécharger le document'}
            </button>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-slate-400" />
                {downloadCount.toLocaleString('fr-FR')} téléchargement{downloadCount > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                {media.views ? media.views.toLocaleString('fr-FR') : 0} vue{media.views && media.views > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Card de détails / Fiche technique */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Informations sur le fichier
            </h3>

            <dl className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500">
                  <User className="h-4 w-4 text-slate-400" />
                  Auteur
                </dt>
                <dd className="font-medium text-slate-800">
                  {media.author?.name || 'Anonyme'}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500">
                  <Info className="h-4 w-4 text-slate-400" />
                  Version
                </dt>
                <dd className="font-medium text-slate-800">
                  v{media.version || '1.0'}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500">
                  <HardDrive className="h-4 w-4 text-slate-400" />
                  Format / Ext.
                </dt>
                <dd className="font-medium text-slate-800 uppercase">
                  {media.format} ({media.extension})
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Taille
                </dt>
                <dd className="font-medium text-slate-800">
                  {formatFileSize(media.fileSize)}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Département
                </dt>
                <dd className="font-medium text-slate-800">
                  {media.department}
                </dd>
              </div>

              {media.createdAt && (
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Ajouté le
                  </dt>
                  <dd className="font-medium text-slate-800">
                    {new Date(media.createdAt).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              )}
            </dl>

            {/* Section Tags */}
            {media.tags && media.tags.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  Mots-clés / Tags
                </dt>
                <div className="flex flex-wrap gap-1.5">
                  {media.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}