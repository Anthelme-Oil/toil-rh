
import fs from 'fs/promises';
import path from 'path';

import type {
  MediaDocument,
  MediaDocumentQuery,
} from '@/types';

import {
  archiveMediaDocument,
  createMediaDocument,
  deleteMediaDocument,
  findMediaDocumentById,
  findMediaDocuments,
  incrementMediaDocumentDownloads,
  incrementMediaDocumentViews,
  updateMediaDocument,
} from './repository';

const UPLOAD_DIRECTORY = path.join(
  process.cwd(),
  'public',
  'uploads',
  'mediatheque'
);

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getExtension(fileName: string): string {
  const extension = path.extname(fileName);

  return extension
    ? extension.replace('.', '').toUpperCase()
    : 'OTHER';
}

function getFormat(extension: string): string {
  const format = extension.toLowerCase();

  if (format === 'pdf') return 'PDF';

  if (['doc', 'docx'].includes(format)) {
    return format.toUpperCase();
  }

  if (['xls', 'xlsx'].includes(format)) {
    return format.toUpperCase();
  }

  if (['ppt', 'pptx'].includes(format)) {
    return format.toUpperCase();
  }

  if (['txt'].includes(format)) {
    return 'TXT';
  }

  if (['csv'].includes(format)) {
    return 'CSV';
  }

  if (
    [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
    ].includes(format)
  ) {
    return 'IMAGE';
  }

  if (
    [
      'mp4',
      'webm',
      'mov',
      'avi',
    ].includes(format)
  ) {
    return 'VIDEO';
  }

  return 'OTHER';
}

/**
 * Vérifie qu'un document existe.
 */
export async function getMediaDocument(
  id: number
): Promise<MediaDocument> {
  const document = await findMediaDocumentById(id);

  if (!document) {
    throw new Error('DOCUMENT_NOT_FOUND');
  }

  return document;
}

/**
 * Liste des documents.
 */
export async function getMediaDocuments(
  query: MediaDocumentQuery = {}
) {
  return findMediaDocuments(query);
}

/**
 * Création d'un document.
 */
export async function createMediaDocumentService(params: {
  file: File;

  title: string;
  description?: string;
  objective?: string;

  department: string;
  category?: string;

  version?: string;

  status?: string;
  visibility?: string;

  authorId?: string;
  authorName?: string;
  authorEmail?: string;

  publishedById?: string;
  publishedByName?: string;
  publishedByEmail?: string;

  tags?: string[];
}): Promise<MediaDocument> {
  if (!params.file) {
    throw new Error('FILE_REQUIRED');
  }

  if (!params.title?.trim()) {
    throw new Error('TITLE_REQUIRED');
  }

  if (!params.department) {
    throw new Error('DEPARTMENT_REQUIRED');
  }

  await fs.mkdir(UPLOAD_DIRECTORY, {
    recursive: true,
  });

  const extension = getExtension(
    params.file.name
  );

  const format = getFormat(extension);

  const safeName = sanitizeFileName(
    params.file.name
  );

  const uniqueName =
    `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const filePath = path.join(
    UPLOAD_DIRECTORY,
    uniqueName
  );

  const buffer = Buffer.from(
    await params.file.arrayBuffer()
  );

  await fs.writeFile(
    filePath,
    buffer
  );

  const fileUrl =
    `/uploads/mediatheque/${uniqueName}`;

  const isPublished =
    params.status === 'PUBLISHED';

  const document =
    await createMediaDocument({
      title: params.title.trim(),

      description:
        params.description?.trim() || undefined,

      objective:
        params.objective?.trim() || undefined,

      department:
        params.department,

      category:
        params.category || undefined,

      format,

      extension,

      fileName:
        params.file.name,

      fileUrl,

      fileSize:
        params.file.size,

      version:
        params.version || '1.0',

      status:
        params.status ?? 'DRAFT',

      isPublished,

      visibility:
        params.visibility ?? 'PUBLIC',

      authorId:
        params.authorId,

      authorName:
        params.authorName,

      authorEmail:
        params.authorEmail,

      publishedById:
        isPublished
          ? params.publishedById
          : undefined,

      publishedByName:
        isPublished
          ? params.publishedByName
          : undefined,

      publishedByEmail:
        isPublished
          ? params.publishedByEmail
          : undefined,

      publishedAt:
        isPublished
          ? new Date()
          : undefined,

      tags:
        params.tags ?? [],
    });

  return document;
}

/**
 * Mise à jour d'un document.
 */
export async function updateMediaDocumentService(
  id: number,
  params: {
    file?: File | null;

    title?: string;
    description?: string;
    objective?: string;

    department?: string;
    category?: string;

    version?: string;

    status?: string;
    visibility?: string;

    publishedById?: string;
    publishedByName?: string;
    publishedByEmail?: string;

    tags?: string[];
  }
): Promise<MediaDocument> {
  const existing =
    await getMediaDocument(id);

  const data: any = {
    title:
      params.title?.trim(),

    description:
      params.description?.trim(),

    objective:
      params.objective?.trim(),

    department:
      params.department,

    category:
      params.category,

    version:
      params.version,

    status:
      params.status,

    visibility:
      params.visibility,

    publishedById:
      params.publishedById,

    publishedByName:
      params.publishedByName,

    publishedByEmail:
      params.publishedByEmail,

    tags:
      params.tags,
  };

  const shouldPublish =
    params.status === 'PUBLISHED' &&
    !existing.isPublished;

  if (shouldPublish) {
    data.isPublished = true;
    data.publishedAt = new Date();
  }

  if (params.status === 'ARCHIVED') {
    data.isPublished = false;
    data.archivedAt = new Date();
  }

  /**
   * Nouveau fichier.
   */
  if (params.file) {
    await fs.mkdir(
      UPLOAD_DIRECTORY,
      {
        recursive: true,
      }
    );

    const extension =
      getExtension(params.file.name);

    const format =
      getFormat(extension);

    const safeName =
      sanitizeFileName(params.file.name);

    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const newFilePath =
      path.join(
        UPLOAD_DIRECTORY,
        uniqueName
      );

    const buffer =
      Buffer.from(
        await params.file.arrayBuffer()
      );

    await fs.writeFile(
      newFilePath,
      buffer
    );

    /**
     * Suppression de l'ancien fichier
     * après avoir enregistré le nouveau.
     */
    if (existing.fileUrl) {
      const oldFilePath =
        path.join(
          process.cwd(),
          'public',
          existing.fileUrl
            .replace(/^\//, '')
        );

      try {
        await fs.unlink(
          oldFilePath
        );
      } catch {
        // Le fichier peut déjà ne plus exister.
      }
    }

    data.fileName =
      params.file.name;

    data.fileUrl =
      `/uploads/mediatheque/${uniqueName}`;

    data.fileSize =
      params.file.size;

    data.extension =
      extension;

    data.format =
      format;
  }

  return updateMediaDocument(
    id,
    data
  );
}

/**
 * Publier un document.
 */
export async function publishMediaDocument(
  id: number,
  publisher?: {
    id?: string;
    name?: string;
    email?: string;
  }
): Promise<MediaDocument> {
  await getMediaDocument(id);

  return updateMediaDocument(
    id,
    {
      status: 'PUBLISHED',
      isPublished: true,
      visibility: 'PUBLIC',

      publishedAt: new Date(),

      publishedById:
        publisher?.id,

      publishedByName:
        publisher?.name,

      publishedByEmail:
        publisher?.email,
    }
  );
}

/**
 * Archiver.
 */
export async function archiveMediaDocumentService(
  id: number
): Promise<MediaDocument> {
  await getMediaDocument(id);

  return archiveMediaDocument(id);
}

/**
 * Supprimer définitivement.
 */
export async function deleteMediaDocumentService(
  id: number
): Promise<void> {
  const document =
    await getMediaDocument(id);

  if (document.fileUrl) {
    const filePath =
      path.join(
        process.cwd(),
        'public',
        document.fileUrl.replace(
          /^\//,
          ''
        )
      );

    try {
      await fs.unlink(
        filePath
      );
    } catch {
      // Fichier déjà absent.
    }
  }

  await deleteMediaDocument(id);
}

/**
 * Consultation.
 *
 * On récupère le document et on incrémente
 * automatiquement le nombre de vues.
 */
export async function consultMediaDocument(
  id: number
): Promise<MediaDocument> {
  const document =
    await getMediaDocument(id);

  await incrementMediaDocumentViews(id);

  return {
    ...document,
    views: document.views + 1,
  };
}

/**
 * Téléchargement.
 *
 * Retourne le document et le chemin
 * physique du fichier.
 */
export async function downloadMediaDocument(
  id: number
) {
  const document =
    await getMediaDocument(id);

  const filePath =
    path.join(
      process.cwd(),
      'public',
      document.fileUrl.replace(
        /^\//,
        ''
      )
    );

  try {
    await fs.access(filePath);
  } catch {
    throw new Error(
      'FILE_NOT_FOUND'
    );
  }

  await incrementMediaDocumentDownloads(id);

  return {
    document: {
      ...document,
      downloads:
        document.downloads + 1,
    },

    filePath,
  };
}
