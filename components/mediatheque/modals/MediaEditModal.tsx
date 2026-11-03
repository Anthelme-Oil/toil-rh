'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Save,
  X,
} from 'lucide-react';

import {
  updateMedia,
} from '@/lib/services/media.service';

import type {
  MediaDocument,
} from '@/types';

interface MediaEditModalProps {
  media: MediaDocument;
  userEmail?: string;
  userName?: string;
  isAdmin?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MediaEditModal({
  media,
  userEmail,
  isAdmin,
  onClose,
  onSuccess,
}: MediaEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] =
    useState(media.title);

  const [description, setDescription] =
    useState(media.description ?? '');

  const [objective, setObjective] =
    useState(media.objective ?? '');

  const [version, setVersion] =
    useState(media.version ?? '');

  const canEdit =
    isAdmin ||
    media.author?.email?.toLowerCase() ===
      userEmail?.toLowerCase();

  useEffect(() => {
    if (!canEdit) {
      setError(
        'Vous n’êtes pas autorisé à modifier ce média.'
      );
    }
  }, [canEdit]);

  const handleSubmit = async () => {
    if (!canEdit) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateMedia(media.id, {
        title: title.trim(),
        description:
          description.trim() || undefined,
        objective:
          objective.trim() || undefined,
        version:
          version.trim() || undefined,
      });

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Impossible de modifier le média.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 text-black">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Modifier le média
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {media.title}
            </p>
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
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Titre
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={!canEdit}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0f766e] disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Objectif
            </label>

            <textarea
              value={objective}
              onChange={(event) =>
                setObjective(event.target.value)
              }
              disabled={!canEdit}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0f766e] disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={!canEdit}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0f766e] disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Version
            </label>

            <input
              value={version}
              onChange={(event) =>
                setVersion(event.target.value)
              }
              disabled={!canEdit}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0f766e] disabled:bg-slate-50"
            />
          </div>
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
            onClick={handleSubmit}
            disabled={loading || !canEdit}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Save size={16} />
            )}

            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}