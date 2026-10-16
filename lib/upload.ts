// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
// import { randomUUID } from 'crypto';

// /**
//  * Sauvegarde un fichier dans public/uploads/[folder]
//  * @param file Le fichier récupéré (File / Blob)
//  * @param folder Le nom du sous-dossier (ex: "actualites", "annonces")
//  * @returns L'URL relative pour accéder au fichier (ex: "/uploads/actualites/uuid.png")
//  */
// export async function saveFileInFolder(file: File, folder: string): Promise<string> {
//   if (!file || !(file instanceof File) || file.size === 0) {
//     throw new Error('Fichier invalide ou vide.');
//   }

//   // 1. Récupération de l'extension du fichier
//   const ext = path.extname(file.name) || '.png';
//   const fileName = `${randomUUID()}${ext}`;

//   // 2. Dossier cible dans public/uploads/[folder]
//   const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
//   const filePath = path.join(uploadDir, fileName);

//   // 3. Conversion du fichier en Buffer
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   // 4. Création du dossier s'il n'existe pas + écriture du fichier
//   await mkdir(uploadDir, { recursive: true });
//   await writeFile(filePath, buffer);

//   // 5. Retourne l'URL qui sera servie par votre route dynamique app/uploads/[...path]/route.ts
//   return `/uploads/${folder}/${fileName}`;
// }


import { mkdir, appendFile, stat, rename, rm, copyFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export const ALLOWED_FOLDERS = ['actualites', 'annonces', 'videos', 'documents'];
export const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif',
  '.mp4', '.webm', '.mov',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip',
];
export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 Go
export const MAX_CHUNK_SIZE = 10 * 1024 * 1024; // 10 Mo (le client envoie 5 Mo)

const TMP_DIR = path.join(process.cwd(), '.upload-tmp');

// export function validateFolder(folder: string): string {
//   if (!ALLOWED_FOLDERS.includes(folder)) throw new Error('Dossier non autorisé.');
//   return folder;
// }

export function validateFolder(folder: string): string {
  // lettres, chiffres, tirets et underscores uniquement, 1 à 50 caractères
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(folder)) {
    throw new Error('Nom de dossier invalide.');
  }
  return folder;
}

export function validateExt(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) throw new Error(`Extension "${ext}" non autorisée.`);
  return ext;
}

export function tmpPathFor(uploadId: string) {
  return path.join(TMP_DIR, `${uploadId}.part`);
}

/** Renvoie la taille déjà reçue pour cet upload (0 si nouveau) */
export async function getReceivedSize(uploadId: string): Promise<number> {
  try {
    return (await stat(tmpPathFor(uploadId))).size;
  } catch {
    return 0;
  }
}

export async function appendChunk(uploadId: string, chunk: Buffer) {
  await mkdir(TMP_DIR, { recursive: true });
  await appendFile(tmpPathFor(uploadId), chunk);
}

export async function finalizeUpload(uploadId: string, folder: string, ext: string) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${randomUUID()}${ext}`;
  const finalPath = path.join(uploadDir, fileName);
  const tmp = tmpPathFor(uploadId);

  try {
    await rename(tmp, finalPath);
  } catch {
    // rename échoue si les dossiers sont sur des disques différents
    await copyFile(tmp, finalPath);
    await rm(tmp, { force: true });
  }
  return `/uploads/${folder}/${fileName}`;
}

export async function abortUpload(uploadId: string) {
  await rm(tmpPathFor(uploadId), { force: true });
}