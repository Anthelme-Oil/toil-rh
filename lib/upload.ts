
import {
  mkdir,
  rm,
} from 'node:fs/promises';

import {
  createWriteStream,
} from 'node:fs';

import {
  Readable,
} from 'node:stream';

import {
  pipeline,
} from 'node:stream/promises';

import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const ALLOWED_FOLDERS = [
  'actualites',
  'annonces',
  'videos',
  'documents',
];

export const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif',
  '.mp4', '.webm', '.mov',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.zip',
];

// Limite maximale : 5 Go
export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

export function validateFolder(folder: string): string {
  // if (!ALLOWED_FOLDERS.includes(folder)) {
  //   console.error(`[Upload Service] Dossier non autorisé: ${folder}`);
  //   throw new Error('Dossier non autorisé.');
  // }

  return folder;
}

export function validateExt(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Extension "${ext}" non autorisée.`);
  }

  return ext;
}

/**
 * Sauvegarde directement un fichier dans public/uploads/[folder].
 * Utilise un flux pour éviter de charger tout le fichier en Buffer.
 */
export async function saveFileInFolder(
  file: File,
  folder: string
): Promise<string> {

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Fichier invalide ou vide.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Le fichier dépasse la taille maximale autorisée de 5 Go.');
  }

  const safeFolder = validateFolder(folder);
  const ext = validateExt(file.name);

  const fileName = `${randomUUID()}${ext}`;

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    safeFolder
  );

  const filePath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });

  try {
    const readable = Readable.fromWeb(
      file.stream() as import('node:stream/web').ReadableStream
    );

    await pipeline(
      readable,
      createWriteStream(filePath, { flags: 'wx' })
    );

    return `/uploads/${safeFolder}/${fileName}`;

  } catch (error) {
    await rm(filePath, { force: true });
    throw error;
  }
}
