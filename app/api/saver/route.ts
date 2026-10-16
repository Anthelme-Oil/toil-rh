// import { NextResponse } from 'next/server';
// import { saveFileInFolder } from '@/lib/upload';

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File | null;
//     const folder = (formData.get('folder') as string) || 'actualites';

//     if (!file) {
//       return NextResponse.json(
//         { error: 'Aucun fichier sélectionné ou transmis.' },
//         { status: 400 }
//       );
//     }

//     const fileUrl = await saveFileInFolder(file, folder);

//     return NextResponse.json(
//       { message: 'Fichier téléversé avec succès', url: fileUrl },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error('[API Upload] Erreur:', error);
//     return NextResponse.json(
//       { error: error.message || 'Erreur lors de la sauvegarde du fichier.' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import {
  MAX_CHUNK_SIZE, MAX_FILE_SIZE,
  validateFolder, validateExt,
  getReceivedSize, appendChunk, finalizeUpload, abortUpload,
} from '@/lib/upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const h = request.headers;
    const uploadId = h.get('x-upload-id') || '';
    const fileName = decodeURIComponent(h.get('x-file-name') || '');
    const folder = validateFolder(h.get('x-folder') || 'actualites');
    const offset = Number(h.get('x-offset'));
    const totalSize = Number(h.get('x-total-size'));

    if (!UUID_RE.test(uploadId)) {
      return NextResponse.json({ error: 'upload-id invalide.' }, { status: 400 });
    }
    if (!Number.isFinite(offset) || !Number.isFinite(totalSize) || totalSize <= 0 || totalSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Taille de fichier invalide ou trop grande.' }, { status: 413 });
    }
    const ext = validateExt(fileName);

    // Vérifie que le chunk arrive bien à la suite de ce qu'on a déjà
    const received = await getReceivedSize(uploadId);
    if (received !== offset) {
      // Le client peut reprendre à "received"
      return NextResponse.json({ error: 'Offset incorrect.', received }, { status: 409 });
    }

    const chunk = Buffer.from(await request.arrayBuffer());
    if (chunk.length === 0 || chunk.length > MAX_CHUNK_SIZE) {
      return NextResponse.json({ error: 'Taille de chunk invalide.' }, { status: 400 });
    }
    if (offset + chunk.length > totalSize) {
      await abortUpload(uploadId);
      return NextResponse.json({ error: 'Dépassement de la taille annoncée.' }, { status: 400 });
    }

    await appendChunk(uploadId, chunk);

    // Dernier chunk → on finalise
    if (offset + chunk.length === totalSize) {
      const url = await finalizeUpload(uploadId, folder, ext);
      return NextResponse.json({ done: true, url }, { status: 201 });
    }

    return NextResponse.json({ done: false, received: offset + chunk.length });
  } catch (error: any) {
    console.error('[API Upload chunk]', error);
    const isValidation = /non autorisé|invalide/i.test(error.message || '');
    return NextResponse.json({ error: error.message || 'Erreur upload.' }, { status:isValidation ? 400 : 500 });
  }
}

// Permet au client de savoir où reprendre après une coupure
export async function GET(request: Request) {
  const uploadId = new URL(request.url).searchParams.get('uploadId') || '';
  if (!UUID_RE.test(uploadId)) {
    return NextResponse.json({ error: 'upload-id invalide.' }, { status: 400 });
  }
  return NextResponse.json({ received: await getReceivedSize(uploadId) });
}