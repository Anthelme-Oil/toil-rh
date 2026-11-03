'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Save, Upload } from 'lucide-react';

import {
  createMedia,
} from '@/lib/services/media.service';

import { sendNotification } from '@/lib/services/notif.service';
import { DOCUMENT_DEPARTMENTS } from '@/types';

import type {
  DocumentCategory,
  DocumentDepartment,
  DocumentFormat,
  DocumentVisibility,
} from '@/types';

interface MediaFormProps {
  userEmail?: string;
  userName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MediaForm({
  userEmail,
  userName,
  onSuccess,
  onCancel,
}: MediaFormProps) {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');
  const [objective, setObjective] = useState('');

  const [department, setDepartment] =
    useState<DocumentDepartment>('IT');

  const [category, setCategory] =
    useState<DocumentCategory>('REFERENCE');

  const [visibility, setVisibility] =
    useState<DocumentVisibility>('PUBLIC');

  const [version, setVersion] = useState('1.0');
  const [tags, setTags] = useState('');

  const [file, setFile] =
    useState<File | null>(null);

  const [error, setError] = useState('');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');

    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }

    if (!file) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }

    setLoading(true);

    try {
      /*
       * Pour le moment, le formulaire transmet les
       * métadonnées au service.
       *
       * L'upload physique pourra ensuite être branché
       * sur ton service de stockage.
       */
      await createMedia({
        title: title.trim(),
        description: description.trim() || undefined,
        objective: objective.trim() || undefined,
        file,
        department,
        category,
        visibility,

        format: getDocumentFormat(file),
        extension: getExtension(file.name),

        fileName: file.name,
        fileUrl: '',
        fileSize: file.size,

        version: version.trim() || undefined,

        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),

        author: {
          id: userEmail,
          name: userName || userEmail || 'Utilisateur',
          email: userEmail,
        },

        status: 'DRAFT',
        isPublished: false,
      });

//       await sendNotification({
//         title:title,
//   recipients: ["anthelme.kpodar@togosh.com"],
//   subject: `${title.trim()}`,
//   message: description.trim(),
//   actionUrl: "/mediatheque",
// });

      onSuccess?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Impossible de créer le média.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Titre
          </label>

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Titre du document"
            className="h-10 w-full text-black rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0f766e]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Département
          </label>

          <select
            value={department}
            onChange={(event) =>
              setDepartment(
                event.target
                  .value as DocumentDepartment
              )
            }
            className="h-10 w-full bg-gray-100 text-black rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0f766e]"
          >
            {
              DOCUMENT_DEPARTMENTS.length > 0 &&(
                DOCUMENT_DEPARTMENTS.map((ddp,index)=> (
                   <option key={index} value={ddp}>{ddp}</option>
                ))

              )
            }
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Catégorie
          </label>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target
                  .value as DocumentCategory
              )
            }
            className="h-10 w-full bg-gray-100 text-black  rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0f766e]"
          >
            <option value="PROCEDURE">
              Procédure
            </option>
            <option value="GUIDE">Guide</option>
            <option value="FORMULAIRE">
              Formulaire
            </option>
            <option value="POLITIQUE">
              Politique
            </option>
            <option value="NOTE">Note</option>
            <option value="RAPPORT">Rapport</option>
            <option value="MANUEL">Manuel</option>
            <option value="INSTRUCTION">
              Instruction
            </option>
            <option value="REGLEMENT">
              Règlement
            </option>
            <option value="PRESENTATION">
              Présentation
            </option>
            <option value="MODELE">Modèle</option>
            <option value="REFERENCE">
              Référence
            </option>
            <option value="AUTRE">Autre</option>
          </select>
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
            placeholder="1.0"
            className="h-10 w-full text-black rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0f766e]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Visibilité
          </label>

          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(
                event.target
                  .value as DocumentVisibility
              )
            }
            className="h-10 w-full text-black bg-gray-100 text-black  rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0f766e]"
          >
            <option value="PUBLIC">
              Tout le monde
            </option>
            <option value="DEPARTMENT">
              Département
            </option>
            <option value="RESTRICTED">
              Restreint
            </option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Objectif
          </label>

          <textarea
            value={objective}
            onChange={(event) =>
              setObjective(event.target.value)
            }
            rows={3}
            placeholder="Objectif du document..."
            className="w-full text-black resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0f766e]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={3}
            placeholder="Description du document..."
            className="w-full text-black resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0f766e]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tags
          </label>

          <input
            value={tags}
            onChange={(event) =>
              setTags(event.target.value)
            }
            placeholder="ex: sécurité, procédure, IT"
            className="h-10 text-black w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0f766e]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Fichier
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 transition hover:border-[#0f766e] hover:bg-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-500">
              <Upload size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700">
                {file
                  ? file.name
                  : 'Sélectionner un fichier'}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                PDF, Word, Excel, PowerPoint ou autre
                format supporté
              </p>
            </div>

            <input
              type="file"
              className="hidden text-black"
              onChange={(event) =>
                setFile(
                  event.target.files?.[0] ?? null
                )
              }
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d675f] disabled:cursor-not-allowed disabled:opacity-50"
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
    </form>
  );
}

function getExtension(
  fileName: string
): string {
  const parts = fileName.split('.');

  return parts.length > 1
    ? parts.at(-1)?.toLowerCase() ?? ''
    : '';
}

function getDocumentFormat(
  file: File
): DocumentFormat {
  const extension = getExtension(file.name);

  if (extension === 'pdf') return 'PDF';
  if (extension === 'doc') return 'DOC';
  if (extension === 'docx') return 'DOCX';
  if (extension === 'xls') return 'XLS';
  if (extension === 'xlsx') return 'XLSX';
  if (extension === 'ppt') return 'PPT';
  if (extension === 'pptx') return 'PPTX';
  if (extension === 'txt') return 'TXT';
  if (extension === 'csv') return 'CSV';

  if (file.type.startsWith('image/')) {
    return 'IMAGE';
  }

  if (file.type.startsWith('video/')) {
    return 'VIDEO';
  }

  return 'OTHER';
}