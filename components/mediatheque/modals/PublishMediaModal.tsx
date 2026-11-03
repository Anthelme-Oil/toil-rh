
'use client';

import { Loader2, Send, X } from 'lucide-react';

import type { MediaDocument } from '@/types';

interface PublishMediaModalProps {
  document: MediaDocument | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  
}

export default function PublishMediaModal({
  document,
  open,
  loading = false,
  onClose,
  onConfirm,
}: PublishMediaModalProps) {
  if (!open || !document) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f766e]/10 text-[#0f766e]">
              <Send size={18} />
            </div>

            <div>
              <h2
                id="publish-modal-title"
                className="text-base font-semibold text-slate-800"
              >
                Confirmer la publication
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Cette action rendra le document disponible.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          <p className="text-sm leading-6 text-slate-600">
            Vous êtes sur le point de publier :
          </p>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">
              {document.title}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>{document.department}</span>

              {document.category && (
                <>
                  <span>•</span>
                  <span>{document.category}</span>
                </>
              )}

              {document.version && (
                <>
                  <span>•</span>
                  <span>Version {document.version}</span>
                </>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Après publication, le document pourra être consulté
            par les utilisateurs autorisés selon sa visibilité.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d675f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Send size={16} />
            )}

            {loading
              ? 'Publication...'
              : 'Confirmer la publication'}
          </button>
        </div>
      </div>
    </div>
  );
}
