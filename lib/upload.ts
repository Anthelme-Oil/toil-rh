import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Sauvegarde un fichier dans public/uploads/[folder]
 * @param file Le fichier récupéré (File / Blob)
 * @param folder Le nom du sous-dossier (ex: "actualites", "annonces")
 * @returns L'URL relative pour accéder au fichier (ex: "/uploads/actualites/uuid.png")
 */
export async function saveFileInFolder(file: File, folder: string): Promise<string> {
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error('Fichier invalide ou vide.');
  }

  // 1. Récupération de l'extension du fichier
  const ext = path.extname(file.name) || '.png';
  const fileName = `${randomUUID()}${ext}`;

  // 2. Dossier cible dans public/uploads/[folder]
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  const filePath = path.join(uploadDir, fileName);

  // 3. Conversion du fichier en Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 4. Création du dossier s'il n'existe pas + écriture du fichier
  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  // 5. Retourne l'URL qui sera servie par votre route dynamique app/uploads/[...path]/route.ts
  return `/uploads/${folder}/${fileName}`;
}