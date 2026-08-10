import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { PieceJointe } from '@/types';

/**
 * Traite et enregistre les pièces jointes (fichiers base64) sur le disque local dans /public/uploads/
 * et retourne la liste des pièces jointes légères avec leurs URLs d'accès direct.
 */
export async function processAndSaveAttachments(
  piecesJointes?: PieceJointe[]
): Promise<PieceJointe[]> {
  if (!piecesJointes || piecesJointes.length === 0) {
    return [];
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch {}

  const processed: PieceJointe[] = [];

  for (const pj of piecesJointes) {
    if (!pj.contentBase64) {
      processed.push(pj);
      continue;
    }

    try {
      let base64Data = pj.contentBase64;
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const timePrefix = Date.now();
      const sanitizedName = (pj.name || 'piece_jointe').replace(/[^a-zA-Z0-9_.-]/g, '_');
      const fileName = `${timePrefix}_${sanitizedName}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, buffer);

      processed.push({
        name: pj.name,
        url: `/uploads/${fileName}`,
      });
    } catch (err) {
      console.error('[Storage] Erreur sauvegarde fichier local:', err);
      processed.push({
        name: pj.name,
      });
    }
  }

  return processed;
}
