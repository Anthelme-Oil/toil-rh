
import Link from 'next/link';
import {

  ArrowUpRight,
  CalendarDays,
  Download,
  Eye,
} from 'lucide-react';

import type { MediaDocument } from '@/types';

import MediaFileIcon from './MediaFileIcon';
import MediaStats from './MediaStats';

interface MediaCardProps {
  document: MediaDocument;
}

const categoryLabels: Record<string, string> = {
  PROCEDURE: 'Procédure',
  GUIDE: 'Guide',
  FORMULAIRE: 'Formulaire',
  POLITIQUE: 'Politique',
  NOTE: 'Note',
  RAPPORT: 'Rapport',
  MANUEL: 'Manuel',
  INSTRUCTION: 'Instruction',
  REGLEMENT: 'Règlement',
  PRESENTATION: 'Présentation',
  MODELE: 'Modèle',
  REFERENCE: 'Référence',
  AUTRE: 'Autre',
};

function formatDate(
  date?: string | Date
) {
  if (!date) return 'Date non disponible';

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  ).format(new Date(date));
}

function formatFileSize(
  size?: number
) {
  if (!size) return null;

  if (size < 1024) {
    return `${size} octets`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} Ko`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}

export default function MediaCard({
  document,
}: MediaCardProps) {
  const category = document.category
    ? categoryLabels[document.category]
    : null;

  return (
    <article
      className="
        group flex min-h-[280px] flex-col
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-[0_12px_35px_rgba(15,76,92,0.08)]
      "
    >
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f4c5c]/10 text-[#0f4c5c]">
            <MediaFileIcon
              format={document.format}
              size={18}
            />
          </div>

          <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
            {document.extension.replace('.', '')}
          </span>
        </div>

        <span className="rounded-full bg-[#0f4c5c]/8 px-2.5 py-1 text-[11px] font-semibold text-[#0f4c5c]">
          {document.department}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col px-4 py-4">

        <div className="mb-2">
          {category && (
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {category}
            </span>
          )}

          <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-slate-900">
            {document.title}
          </h2>
        </div>

        {document.objective && (
          <p className="line-clamp-3 text-sm leading-5 text-slate-500">
            {document.objective}
          </p>
        )}

        {document.tags &&
          document.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {document.tags
                .slice(0, 3)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          )}

        <div className="mt-auto pt-5">

          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays size={13} />
              <span>
                {formatDate(document.publishedAt)}
              </span>
            </div>

            {document.version && (
              <span className="text-[11px] font-medium text-slate-400">
                v{document.version}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <MediaStats
              views={document.views}
              downloads={document.downloads}
            />

            <Link
              href={`/mediatheque/${document.id}/consultation`}
              className="
                inline-flex items-center gap-1.5
                rounded-lg
                bg-[#0f4c5c]
                px-3 py-2
                text-xs font-semibold text-white
                transition
                hover:bg-[#0b3d4a]
              "
            >
              Consulter
              <ArrowUpRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
