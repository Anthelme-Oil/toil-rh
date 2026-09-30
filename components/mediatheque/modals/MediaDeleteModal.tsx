'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';

import {
  deleteMedia,
} from '@/lib/services/media.service';

import type {
  MediaDocument,
} from '@/types/media';

interface MediaDeleteModalProps {
  media: MediaDocument;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MediaDeleteModal({
  media,
  onClose,
  onSuccess,
}: MediaDeleteModalProps) {
  const [loading, setLoading] =
    useState(false);

  const [permanent, setPermanent] =
    useState(false);

  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await deleteMedia(
        media.id,
        permanent
      );

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer le média.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Supprimer le média
              </h2>

              <p className="text-xs text-slate-500">
                Cette action nécessite une confirmation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-6 text-slate-600">
            Vous êtes sur le point de supprimer :
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-medium text-slate-800">
              {media.title}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {media.fileName}
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
            <input
              type="checkbox"
              checked={permanent}
              onChange={(event) =>
                setPermanent(event.target.checked)
              }
              className="mt-0.5"
            />

            <span>
              <span className="block text-sm font-medium text-slate-700">
                Suppression définitive
              </span>

              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                Sinon, le média sera simplement archivé.
              </span>
            </span>
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            {permanent
              ? 'Supprimer définitivement'
              : 'Archiver'}
          </button>
        </div>
      </div>
    </div>
  );
}