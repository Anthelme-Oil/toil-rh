import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { PieceJointe } from '@/types';
import { uploadDocumentToSharePoint } from './sharepoint';

/**
 * Traite et enregistre les pièces jointes :
 * 1. En priorité dans la bibliothèque de documents SharePoint Online via Microsoft Graph API.
 * 2. En fallback local dans /public/uploads/ si SharePoint n'est pas encore configuré.
 */
export async function processAndSaveAttachments(
  piecesJointes?: PieceJointe[]
): Promise<PieceJointe[]> {
  if (!piecesJointes || piecesJointes.length === 0) {
    return [];
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
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
      const fileName = pj.name || 'document';

      // 1. Tenter l'upload direct dans SharePoint Online
      const spUrl = await uploadDocumentToSharePoint(buffer, fileName, 'Justificatifs_Conges');

      if (spUrl) {
        console.log(`[Storage] Fichier "${fileName}" stocké dans SharePoint Online :`, spUrl);
        processed.push({
          name: fileName,
          url: spUrl,
        });
        continue;
      }

      // 2. Fallback stockage local si SharePoint n'est pas configuré
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch {}

      const timePrefix = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const localFileName = `${timePrefix}_${sanitizedName}`;
      const filePath = path.join(uploadDir, localFileName);

      await fs.writeFile(filePath, buffer);

      console.log(`[Storage] Fichier "${fileName}" stocké localement : /uploads/${localFileName}`);
      processed.push({
        name: fileName,
        url: `/uploads/${localFileName}`,
      });
    } catch (err) {
      console.error('[Storage] Erreur sauvegarde fichier:', err);
      processed.push({
        name: pj.name,
      });
    }
  }

  return processed;
}
